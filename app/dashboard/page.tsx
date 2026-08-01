import { redirect } from 'next/navigation'
import { GraduationCap, Backpack, Inbox } from 'lucide-react'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'
import { AcademyCodeBox } from '@/components/dashboard/AcademyCodeBox'
import { StatCard } from '@/components/dashboard/StatCard'

export default async function DashboardPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/register')

  const [tukaCount, pukaCount, pendingRequests] = await Promise.all([
    prisma.user.count({ where: { tenantId: ctx.tenant.id, role: 'TUKA' } }),
    prisma.user.count({ where: { tenantId: ctx.tenant.id, role: 'PUKA' } }),
    prisma.paymentSubmission.count({ where: { tenantId: ctx.tenant.id, status: 'PENDING' } }),
  ])

  return (
    <div className="space-y-6">
      <AcademyCodeBox code={ctx.tenant.licenseKey} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Tuka" value={tukaCount} hint="educators in your academy" icon={GraduationCap} tone="blue" />
        <StatCard label="Puka" value={pukaCount} hint="learners enrolled" icon={Backpack} tone="emerald" />
        <StatCard
          label="Requests"
          value={pendingRequests}
          hint="payments awaiting review"
          icon={Inbox}
          tone="orange"
        />
      </div>
    </div>
  )
}
