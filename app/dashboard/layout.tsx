import { redirect } from 'next/navigation'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { TourProvider } from '@/components/dashboard/Tour'
import { DashboardNotifications } from '@/components/dashboard/DashboardNotifications'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getDashboardContext()

  // No session, no User row yet, or not yet approved — /register itself
  // decides which of those screens (pending / rejected / sign-in) to show.
  if (!ctx) redirect('/register')

  return (
    <DashboardNotifications tenantId={ctx.tenant.id}>
      <TourProvider>
        <div className="min-h-screen flex bg-pond-water">
          <DashboardSidebar academyName={ctx.tenant.name} />
          <div className="flex-1 min-w-0 flex flex-col">
          <header className="px-8 pt-8 pb-2" data-tour="academy-header">
            <div className="flex items-center gap-3">
              <span className="text-4xl select-none" aria-hidden>
                🐦
              </span>
              <div>
                <h1 className="font-heading text-3xl text-tuka-navy">Academy Console</h1>
                <p className="text-sm text-muted-foreground font-body">{ctx.tenant.name}</p>
              </div>
            </div>
          </header>
            <main className="flex-1 min-w-0 px-8 pb-8">{children}</main>
          </div>
        </div>
      </TourProvider>
    </DashboardNotifications>
  )
}
