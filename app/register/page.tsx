import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RegisterForm } from '@/components/RegisterForm'
import { AlreadyRegistered } from '@/components/AlreadyRegistered'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-up')
  }

  // If a Tuka already exists, use the normal dashboard flow.
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      tenant: {
        select: {
          name: true,
          licenseKey: true,
          reviewStatus: true,
          rejectionReason: true,
        },
      },
    },
  })

  if (existingUser) {
    if (
      existingUser.tenant.reviewStatus ===
      'APPROVED'
    ) {
      redirect('/dashboard')
    }

    return (
      <AlreadyRegistered
        academyName={existingUser.tenant.name}
        reviewStatus={
          existingUser.tenant.reviewStatus
        }
        rejectionReason={
          existingUser.tenant.rejectionReason
        }
      />
    )
  }

  const clerkUser = await currentUser()

  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress
      ?.trim()
      .toLowerCase() ?? ''

  const name =
    [
      clerkUser?.firstName,
      clerkUser?.lastName,
    ]
      .filter(Boolean)
      .join(' ') || ''

  // The academy is created before the User/Tuka row.
  // Therefore we must find a pending registration by the
  // existing Tenant.contactEmail field.
  const existingAcademy = email
    ? await prisma.tenant.findFirst({
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
          name: true,
          licenseKey: true,
          reviewStatus: true,
          rejectionReason: true,
        },
      })
    : null

  if (existingAcademy) {
    return (
      <AlreadyRegistered
        academyName={existingAcademy.name}
        reviewStatus={
          existingAcademy.reviewStatus
        }
        rejectionReason={
          existingAcademy.rejectionReason
        }
      />
    )
  }

  return (
    <RegisterForm
      defaultName={name}
      defaultEmail={email}
    />
  )
}
