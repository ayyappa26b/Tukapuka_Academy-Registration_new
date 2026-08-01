'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  GraduationCap,
  Backpack,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTour } from '@/components/dashboard/Tour'
import { UserMenu } from '@/components/dashboard/UserMenu'
import { SidebarTooltip } from '@/components/dashboard/SidebarTooltip'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tourId: 'nav-dashboard' },
  { href: '/dashboard/tuka', label: 'Tuka', icon: GraduationCap, tourId: 'nav-tuka' },
  { href: '/dashboard/puka', label: 'Puka', icon: Backpack, tourId: 'nav-puka' },
  // { href: '/dashboard/requests', label: 'Requests', icon: Inbox, tourId: 'nav-requests' },
  { href: '/dashboard/academy', label: 'Academy', icon: Building2, tourId: 'nav-academy' },
]

const COLLAPSE_KEY = 'dashboard-sidebar-collapsed'

export function DashboardSidebar({ academyName }: { academyName: string }) {
  const pathname = usePathname()
  const { startTour } = useTour()
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Read the saved preference after mount so the server render and first
  // client render match (avoids a hydration flash), then apply it.
  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSE_KEY)
    if (saved === '1') setCollapsed(true)
    setHydrated(true)
  }, [])

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <aside
      className={cn(
        'shrink-0 bg-sidebar text-sidebar-foreground flex flex-col sticky top-0 h-screen overflow-y-auto overflow-x-hidden',
        !hydrated && 'transition-none',
        hydrated && 'transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64',
      )}
    >
      <div className={cn('flex items-center gap-3 px-5 py-6', collapsed && 'px-0 justify-center')}>
        <span className="text-2xl select-none shrink-0" aria-hidden>
          🐦
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg leading-tight text-white">TukaPuka</p>
            <p className="text-xs text-sidebar-foreground/60 font-body truncate">{academyName}</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggle}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="shrink-0 p-1.5 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white transition-colors"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center pb-2">
          <SidebarTooltip label="Expand sidebar">
            <button
              onClick={toggle}
              aria-label="Expand sidebar"
              className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white transition-colors"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          </SidebarTooltip>
        </div>
      )}

      <nav className={cn('flex-1 space-y-1', collapsed ? 'px-2' : 'px-3')} data-tour="sidebar-nav">
        {NAV.map(({ href, label, icon: Icon, tourId }) => {
          const active = pathname === href
          return (
            <SidebarTooltip key={href} label={label} disabled={!collapsed}>
              <Link
                href={href}
                data-tour={tourId}
                className={cn(
                  'flex items-center gap-3 rounded-xl py-2.5 text-sm font-body font-semibold transition-colors',
                  collapsed ? 'justify-center px-0' : 'px-3',
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white',
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && label}
              </Link>
            </SidebarTooltip>
          )
        })}
      </nav>

      <div className={cn('pb-3 pt-3 border-t border-sidebar-border', collapsed ? 'px-2' : 'px-3')}>
        <SidebarTooltip label="Take the tour" disabled={!collapsed}>
          <button
            onClick={startTour}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl py-2.5 text-sm font-body font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white transition-colors',
              collapsed ? 'justify-center px-0' : 'px-3',
            )}
          >
            {collapsed ? <HelpCircle className="size-4 shrink-0" /> : 'Take the tour'}
          </button>
        </SidebarTooltip>
      </div>

      <div className={cn('pb-4 pt-3 border-t border-sidebar-border', collapsed ? 'px-2' : 'px-3')}>
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  )
}
