import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Backpack, Inbox } from 'lucide-react'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'
import { AcademyCodeBox } from '@/components/dashboard/AcademyCodeBox'
import { StatCard } from '@/components/dashboard/StatCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/register')

 const [tukaCount, pukaCount, pendingRequests] =
  await Promise.all([
    prisma.user.count({
      where: {
        tenantId: ctx.tenant.id,
        role: 'TUKA',

        // The academy applicant/owner is not an educator.
        // Keep the current-user exclusion and also hide legacy owner rows
        // created by the old registration bug (same contact email).
        id: {
          not: ctx.user.id,
        },
        ...(ctx.tenant.contactEmail
          ? {
              email: {
                not: ctx.tenant.contactEmail,
              },
            }
          : {}),
      },
    }),

    prisma.user.count({
      where: {
        tenantId: ctx.tenant.id,
        role: 'PUKA',
      },
    }),

    prisma.paymentSubmission.count({
      where: {
        tenantId: ctx.tenant.id,
        status: 'PENDING',
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <AcademyCodeBox
        code={ctx.tenant.licenseKey}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Tuka"
          value={tukaCount}
          hint="educators in your academy"
          icon={GraduationCap}
          tone="blue"
        />

        <StatCard
          label="Puka"
          value={pukaCount}
          hint="learners enrolled"
          icon={Backpack}
          tone="emerald"
        />

        <StatCard
          label="Requests"
          value={pendingRequests}
          hint="payments awaiting review"
          icon={Inbox}
          tone="orange"
          href="/dashboard/requests"
        />
      </div>

      {pendingRequests > 0 && (
        <Link
          href="/dashboard/requests"
          className="text-sm font-body font-semibold text-tuka-blue hover:underline"
        >
          You have {pendingRequests}{' '}
          pending request
          {pendingRequests === 1 ? '' : 's'}.
          View requests →
        </Link>
      )}
    </div>
  )
}
