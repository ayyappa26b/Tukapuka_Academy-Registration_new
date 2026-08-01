/**
 * POST /api/academy/register
 * ───────────────────────────
 * Called from /register AFTER the person has signed in with Clerk (same
 * Clerk application/keys as the main TukaPuka app — so the same account
 * works on both sites).
 *
 * Two modes, chosen by the "Do you already have an academy code?" toggle
 * on the form:
 *
 *   mode: 'create' → { academyName, contactName?, contactEmail? }
 *     Creates a brand-new Tenant ("Academy") with a fresh licenseKey
 *     (the academy code), then creates a User row for the signed-in
 *     Clerk account with role TUKA, owning that academy.
 *
 *   mode: 'join' → { academyCode }
 *     Looks up an existing Tenant by licenseKey. If it matches, the
 *     signed-in account is added to THAT academy as a TUKA — this is the
 *     "yes, I have a code" path, and reuses the exact same licenseKey
 *     lookup every onboarding flow in the main app already uses, so a
 *     code generated here works there and vice versa.
 *
 * Idempotent: a Clerk account that already has a User row just gets told
 * so (with their existing tenant) instead of erroring or double-creating.
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateLicenseKey } from '@/lib/licensing'
import { z } from 'zod'

const schema = z.discriminatedUnion('mode', [
  z.object({
    mode:          z.literal('create'),
    academyName:   z.string().trim().min(2, 'Academy name is too short').max(100),
    contactName:   z.string().trim().min(1).max(100).optional(),
    contactEmail:  z.string().trim().email().max(150).optional(),
  }),
  z.object({
    mode:        z.literal('join'),
    academyCode: z.string().trim().min(1).max(80),
  }),
])

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'academy'
}

async function setClerkRole(userId: string, tenantId: string) {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_metadata: { role: 'TUKA', tenantId } }),
  })
  if (!res.ok) {
    // Non-fatal — the DB row is the source of truth; the JWT will catch up
    // on next session refresh either here or on the main app.
    console.error(`[AcademyRegister] Clerk metadata PATCH failed: ${res.status}`, await res.text().catch(() => ''))
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthenticated' }, { status: 401 })

  // Idempotent — already registered/joined
  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { tenant: { select: { name: true, licenseKey: true } } },
  })
  if (existing) {
    return Response.json({
      alreadyOnboarded: true,
      role:        existing.role,
      academyName: existing.tenant.name,
      academyCode: existing.tenant.licenseKey,
    })
  }

  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const clerkUser = await currentUser()
  const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
  const clerkName  = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ')
    || clerkEmail.split('@')[0] || 'Tuka'

  // ── Mode: join an existing academy by code ──────────────────────────────
  if (parsed.data.mode === 'join') {
    const { academyCode } = parsed.data

    const tenant = await prisma.tenant.findFirst({
      where: { licenseKey: { equals: academyCode, mode: 'insensitive' } },
      select: { id: true, name: true, licenseKey: true },
    })
    if (!tenant) {
      if (/^[0-9a-f]{8}$/i.test(academyCode)) {
        return Response.json({
          error: 'That looks like a session join code, not an academy code. Ask your academy admin for the code that starts with ZHI-.',
        }, { status: 404 })
      }
      return Response.json({ error: 'Incorrect academy code. Double-check it and try again.' }, { status: 404 })
    }

    await prisma.user.create({
      data: { clerkId: userId, tenantId: tenant.id, role: 'TUKA', displayName: clerkName, email: clerkEmail },
    })
    await setClerkRole(userId, tenant.id)

    return Response.json({
      ok:          true,
      mode:        'join',
      academyName: tenant.name,
      academyCode: tenant.licenseKey,
    }, { status: 201 })
  }

  // ── Mode: create a brand-new academy ─────────────────────────────────────
  const { academyName, contactName, contactEmail } = parsed.data

  const baseSlug = slugify(academyName)
  let slug = baseSlug
  let attempt = 0
  while (await prisma.tenant.findUnique({ where: { slug }, select: { id: true } })) {
    attempt += 1
    slug = `${baseSlug}-${Date.now().toString(36)}${attempt > 1 ? `-${attempt}` : ''}`
    if (attempt > 5) break
  }

  const tenant = await prisma.tenant.create({
    data: {
      name:              academyName,
      slug,
      plan:              'FREE',
      licenseKey:        generateLicenseKey(),
      status:            'ACTIVE',
      reviewStatus:      'PENDING',
      maxPukas:          10,
      maxClasses:        3,
      maxSessions:       1,
      analyticsEnabled:  false,
      whiteLabelEnabled: false,
      contactName:  contactName  || clerkName,
      contactEmail: contactEmail || clerkEmail,
    },
    select: { id: true, name: true, licenseKey: true },
  })

  await prisma.user.create({
    data: { clerkId: userId, tenantId: tenant.id, role: 'TUKA', displayName: contactName || clerkName, email: contactEmail || clerkEmail },
  })
  await setClerkRole(userId, tenant.id)

  return Response.json({
    ok:          true,
    mode:        'create',
    academyName: tenant.name,
    academyCode: tenant.licenseKey,
  }, { status: 201 })
}
