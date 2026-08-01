import { AcademyChangeRequestsDirectory } from '@/components/dashboard/AcademyChangeRequestsDirectory'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { redirect } from 'next/navigation'

export default async function AcademyPage() {
  const ctx = await getDashboardContext()
  if (!ctx) redirect('/register')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-xl text-tuka-navy">Academy</h2>
        <p className="text-sm text-muted-foreground font-body">
          Tukas asking to move from their current academy to yours.
        </p>
      </div>
      <AcademyChangeRequestsDirectory tenantId={ctx.tenant.id} />
    </div>
  )
}