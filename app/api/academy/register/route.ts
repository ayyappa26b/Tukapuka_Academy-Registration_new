/**
 * POST /api/academy/register
 *
 * create:
 * Creates ONLY the academy/Tenant.
 * It deliberately does NOT create a User/Tuka.
 *
 * join:
 * Existing academy-code flow: joins the academy as TUKA.
 *
 * A Tuka is created for a newly registered academy only after an admin
 * approves the academy and the applicant checks the status.
 */

import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateLicenseKey } from '@/lib/licensing'
import { ACADEMY_CONFIG } from '@/lib/academy-config'
import { z } from 'zod'

const schema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('create'),
    academyName: z.string().trim()
      .min(2, 'Academy name must be at least 2 characters')
      .max(100, 'Academy name must be 100 characters or less'),
    contactName: z.string().trim()
      .min(1, 'Your name is required')
      .max(100, 'Your name must be 100 characters or less'),
    contactEmail: z.string().trim()
      .email('Please enter a valid email address')
      .max(150),
  }),
  z.object({
    mode: z.literal('join'),
    academyCode: z.string().trim().min(1).max(80),
  }),
])

function slugify(input: string): string {
  return (
    input.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'academy'
  )
}

async function setClerkRole(userId: string, tenantId: string) {
  const res = await fetch(
    `https://api.clerk.com/v1/users/${userId}/metadata`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          role: 'TUKA',
          tenantId,
        },
      }),
      cache: 'no-store',
    },
  )

  if (!res.ok) {
    console.error(
      `[AcademyRegister] Clerk metadata PATCH failed: ${res.status}`,
      await res.text().catch(() => ''),
    )
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)

  if (!body) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return Response.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          'Invalid input',
      },
      { status: 400 },
    )
  }

  const clerkUser = await currentUser()

  const clerkEmail =
    clerkUser?.emailAddresses?.[0]?.emailAddress
      ?.trim()
      .toLowerCase() ?? ''

  const clerkName =
    [clerkUser?.firstName, clerkUser?.lastName]
      .filter(Boolean)
      .join(' ') ||
    clerkEmail.split('@')[0] ||
    'Tuka'

  // Existing User means this account already belongs to an academy.
  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      tenant: {
        select: {
          name: true,
          licenseKey: true,
          reviewStatus: true,
        },
      },
    },
  })

  if (existing) {
    return Response.json({
      alreadyOnboarded: true,
      role: existing.role,
      academyName: existing.tenant.name,
      academyCode: existing.tenant.licenseKey,
      reviewStatus: existing.tenant.reviewStatus,
    })
  }

  // ============================================================
  // JOIN EXISTING ACADEMY
  // ============================================================

  if (parsed.data.mode === 'join') {
    const { academyCode } = parsed.data

    const tenant = await prisma.tenant.findFirst({
      where: {
        licenseKey: {
          equals: academyCode,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        licenseKey: true,
        reviewStatus: true,
      },
    })

    if (!tenant) {
      if (/^[0-9a-f]{8}$/i.test(academyCode)) {
        return Response.json(
          {
            error:
              'That looks like a session join code, not an academy code. Ask your academy admin for the code that starts with ZHI-.',
          },
          { status: 404 },
        )
      }

      return Response.json(
        {
          error:
            'Incorrect academy code. Double-check it and try again.',
        },
        { status: 404 },
      )
    }

    if (tenant.reviewStatus !== 'APPROVED') {
      return Response.json(
        {
          error:
            'This academy has not been approved yet.',
        },
        { status: 403 },
      )
    }

    // Application-level Tuka limit. No DB/schema change.
    const tukaCount = await prisma.user.count({
      where: {
        tenantId: tenant.id,
        role: 'TUKA',
      },
    })

    if (tukaCount >= ACADEMY_CONFIG.MAX_TUKAS) {
      return Response.json(
        {
          error:
            'This academy has reached the maximum number of Tukas.',
        },
        { status: 403 },
      )
    }

    await prisma.user.create({
      data: {
        clerkId: userId,
        tenantId: tenant.id,
        role: 'TUKA',
        displayName: clerkName,
        email: clerkEmail,
      },
    })

    await setClerkRole(userId, tenant.id)

    return Response.json(
      {
        ok: true,
        mode: 'join',
        academyName: tenant.name,
        academyCode: tenant.licenseKey,
      },
      { status: 201 },
    )
  }

  // ============================================================
  // CREATE NEW ACADEMY
  // ============================================================

  const { academyName, contactName, contactEmail } = parsed.data

  const normalizedName = academyName.trim()
  const normalizedEmail = contactEmail.trim().toLowerCase()

  // Case-insensitive duplicate academy-name validation.
  const duplicateAcademy = await prisma.tenant.findFirst({
    where: {
      name: {
        equals: normalizedName,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      reviewStatus: true,
    },
  })

  if (duplicateAcademy) {
    if (duplicateAcademy.reviewStatus === 'PENDING') {
      return Response.json(
        {
          error:
            'An academy with this name is already under review.',
        },
        { status: 409 },
      )
    }

    if (duplicateAcademy.reviewStatus === 'APPROVED') {
      return Response.json(
        {
          error:
            'An academy with this name already exists.',
        },
        { status: 409 },
      )
    }

    return Response.json(
      {
        error:
          'An academy with this name already exists. Please choose another name.',
      },
      { status: 409 },
    )
  }

  // Prevent the same contact email from submitting another
  // active/pending academy registration.
  const duplicateRegistration = await prisma.tenant.findFirst({
    where: {
      contactEmail: {
        equals: normalizedEmail,
        mode: 'insensitive',
      },
      reviewStatus: {
        in: ['PENDING', 'APPROVED'],
      },
    },
    select: {
      id: true,
      name: true,
      reviewStatus: true,
    },
  })

  if (duplicateRegistration) {
    return Response.json(
      {
        error:
          duplicateRegistration.reviewStatus === 'PENDING'
            ? 'You already have an academy registration under review.'
            : 'Your account is already registered with an academy.',
      },
      { status: 409 },
    )
  }

  // Unique slug.
  const baseSlug = slugify(normalizedName)
  let slug = baseSlug
  let attempt = 0

  while (
    await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    attempt += 1

    slug = `${baseSlug}-${Date.now().toString(36)}${
      attempt > 1 ? `-${attempt}` : ''
    }`

    if (attempt > 5) {
      return Response.json(
        {
          error:
            'Unable to create a unique academy identifier. Please try again.',
        },
        { status: 500 },
      )
    }
  }

  // IMPORTANT:
  // Only Tenant is created here.
  // NO prisma.user.create()
  // NO setClerkRole()
  // NO TUKA role.
  //
  // These remain the defaults for newly registered academies.
  // MAX_TUKAS is an application-level Tuka limit, not a DB column.
  const tenant = await prisma.tenant.create({
    data: {
      name: normalizedName,
      slug,
      plan: 'FREE',
      licenseKey: generateLicenseKey(),
      status: 'ACTIVE',
      reviewStatus: 'PENDING',
      maxPukas: 10,
      maxClasses: 3,
      maxSessions: 1,
      analyticsEnabled: false,
      whiteLabelEnabled: false,
      contactName: contactName.trim(),
      contactEmail: normalizedEmail,
    },
    select: {
      id: true,
      name: true,
      licenseKey: true,
      reviewStatus: true,
    },
  })

  return Response.json(
    {
      ok: true,
      mode: 'create',
      academyName: tenant.name,
      academyCode: tenant.licenseKey,
      reviewStatus: tenant.reviewStatus,
    },
    { status: 201 },
  )
}
