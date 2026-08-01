import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RegisterForm } from '@/components/RegisterForm'
import { AlreadyRegistered } from '@/components/AlreadyRegistered'

export default async function RegisterPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-up')

  // Already has an academy (created one before, or joined one) — no need
  // to fill the form again.
  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      tenant: {
        select: { name: true, licenseKey: true, reviewStatus: true, rejectionReason: true },
      },
    },
  })
  if (existing) {
    // Approved academies skip straight to the dashboard — no reason to
    // show the "you're already registered" screen for those.
    if (existing.tenant.reviewStatus === 'APPROVED') {
      redirect('/dashboard')
    }
    return (
      <AlreadyRegistered
        academyName={existing.tenant.name}
        reviewStatus={existing.tenant.reviewStatus}
        rejectionReason={existing.tenant.rejectionReason}
      />
    )
  }

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
  const name  = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || ''

  return <RegisterForm defaultName={name} defaultEmail={email} />
}
