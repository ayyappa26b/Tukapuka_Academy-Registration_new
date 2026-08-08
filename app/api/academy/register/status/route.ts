import {
  auth,
  currentUser,
  clerkClient,
} from '@clerk/nextjs/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // ============================================================
    // 1. GET CURRENT CLERK SESSION
    // ============================================================

    const { userId } = await auth()

    if (!userId) {
      return Response.json(
        {
          error: 'Unauthenticated',
        },
        { status: 401 },
      )
    }

    // ============================================================
    // 2. GET CURRENT CLERK USER
    // ============================================================

    const clerkUser = await currentUser()

    if (!clerkUser) {
      return Response.json(
        {
          error:
            'Unable to identify your Clerk account.',
        },
        { status: 401 },
      )
    }

    const email =
      clerkUser.emailAddresses?.[0]
        ?.emailAddress
        ?.trim()
        .toLowerCase()

    if (!email) {
      return Response.json(
        {
          error:
            'Your Clerk account does not have an email address.',
        },
        { status: 400 },
      )
    }

    console.log(
      '[AcademyStatus] Clerk user:',
      userId,
    )

    console.log(
      '[AcademyStatus] Email:',
      email,
    )

    // ============================================================
    // 3. CHECK IF USER ALREADY EXISTS
    // ============================================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          clerkId: userId,
        },
        select: {
          id: true,
          tenantId: true,
          role: true,
          tenant: {
            select: {
              id: true,
              name: true,
              licenseKey: true,
              reviewStatus: true,
            },
          },
        },
      })

    if (existingUser) {
      console.log(
        '[AcademyStatus] User already exists:',
        existingUser.id,
      )

      return Response.json({
        ok: true,
        reviewStatus:
          existingUser.tenant.reviewStatus,
        academyName:
          existingUser.tenant.name,
        academyCode:
          existingUser.tenant.licenseKey,
        role: existingUser.role,
      })
    }

    // ============================================================
    // 4. FIND ACADEMY USING EXISTING contactEmail
    // ============================================================

    const academy =
      await prisma.tenant.findFirst({
        where: {
          contactEmail: {
            equals: email,
            mode: 'insensitive',
          },
        },

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          name: true,
          licenseKey: true,
          reviewStatus: true,
          rejectionReason: true,
        },
      })

    if (!academy) {
      console.error(
        '[AcademyStatus] No academy found for:',
        email,
      )

      return Response.json(
        {
          error:
            'No academy registration was found for your account.',
        },
        { status: 404 },
      )
    }

    console.log(
      '[AcademyStatus] Academy:',
      academy.name,
    )

    console.log(
      '[AcademyStatus] Status:',
      academy.reviewStatus,
    )

    // ============================================================
    // 5. PENDING
    // ============================================================

    if (
      academy.reviewStatus ===
      'PENDING'
    ) {
      return Response.json({
        ok: true,
        reviewStatus: 'PENDING',
        academyName: academy.name,
        rejectionReason: null,
      })
    }

    // ============================================================
    // 6. REJECTED
    // ============================================================

    if (
      academy.reviewStatus ===
      'REJECTED'
    ) {
      return Response.json({
        ok: true,
        reviewStatus: 'REJECTED',
        academyName: academy.name,
        rejectionReason:
          academy.rejectionReason,
      })
    }

    // ============================================================
    // 7. APPROVED
    //
    // ONLY NOW create the Tuka.
    // ============================================================

    if (
      academy.reviewStatus ===
      'APPROVED'
    ) {
      console.log(
        '[AcademyStatus] Academy approved. Creating Tuka...',
      )

      const displayName =
        [
          clerkUser.firstName,
          clerkUser.lastName,
        ]
          .filter(Boolean)
          .join(' ') ||
        email.split('@')[0] ||
        'Tuka'

      // Safety guard:
      // A previous buggy version of the registration flow could create the
      // owner as a Tuka before approval. Never create another Tuka for the
      // same email. If the old row belongs to this academy, reuse it.
      const existingTukaByEmail =
        await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: 'insensitive',
            },
            role: 'TUKA',
          },
          select: {
            id: true,
            tenantId: true,
            role: true,
          },
        })

      let user

      if (
        existingTukaByEmail &&
        existingTukaByEmail.tenantId === academy.id
      ) {
        user = existingTukaByEmail
      } else if (existingTukaByEmail) {
        return Response.json(
          {
            error:
              'This email is already associated with a Tuka account in another academy.',
          },
          { status: 409 },
        )
      } else {
        try {
          user =
            await prisma.user.create({
              data: {
                clerkId: userId,
                tenantId: academy.id,
                role: 'TUKA',
                displayName,
                email,
              },

              select: {
                id: true,
                tenantId: true,
                role: true,
              },
            })
        } catch (createError) {
        console.error(
          '[AcademyStatus] User creation error:',
          createError,
        )

        // Another request may have created it.
          user =
            await prisma.user.findUnique({
              where: {
                clerkId: userId,
              },

              select: {
                id: true,
                tenantId: true,
                role: true,
              },
            })

          if (!user) {
            return Response.json(
              {
                error:
                  'Academy is approved, but we could not create your Tuka account.',
              },
              { status: 500 },
            )
          }
        }
      }

      // ============================================================
      // 8. UPDATE CLERK PUBLIC METADATA
      // ============================================================

      try {
        const client =
          await clerkClient()

        await client.users.updateUserMetadata(
          userId,
          {
            publicMetadata: {
              role: 'TUKA',
              tenantId: academy.id,
            },
          },
        )

        console.log(
          '[AcademyStatus] Clerk metadata updated',
        )
      } catch (clerkError) {
        console.error(
          '[AcademyStatus] Clerk metadata update failed:',
          clerkError,
        )

        // IMPORTANT:
        // User was already created successfully.
        // Don't return 500 just because metadata update failed.
      }

      console.log(
        '[AcademyStatus] Tuka created:',
        user.id,
      )

      return Response.json({
        ok: true,
        reviewStatus: 'APPROVED',
        academyName: academy.name,
        academyCode:
          academy.licenseKey,
        role: 'TUKA',
      })
    }

    // ============================================================
    // 9. UNKNOWN STATUS
    // ============================================================

    return Response.json(
      {
        error:
          `Unknown academy status: ${academy.reviewStatus}`,
      },
      { status: 500 },
    )
  } catch (error) {
    console.error(
      '[AcademyStatus] Unexpected error:',
      error,
    )

    return Response.json(
      {
        error:
          'Unable to check academy status.',
      },
      { status: 500 },
    )
  }
}