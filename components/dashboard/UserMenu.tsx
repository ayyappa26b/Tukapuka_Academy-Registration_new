'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarTooltip } from '@/components/dashboard/SidebarTooltip'

export function UserMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { user, isLoaded } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (!isLoaded || !user) return null

  const name = user.fullName || user.primaryEmailAddress?.emailAddress || 'Account'
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  const initial = (user.fullName || email || '?').charAt(0).toUpperCase()

  return (
    <div className="relative" ref={ref} data-tour="user-menu">
      <SidebarTooltip label={name} disabled={!collapsed}>
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl py-2 hover:bg-sidebar-accent transition-colors',
            collapsed ? 'justify-center px-0' : 'px-2',
          )}
        >
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="" className="size-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="size-9 rounded-full bg-tuka-cyan/20 text-tuka-cyan flex items-center justify-center font-heading text-sm shrink-0">
              {initial}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 text-left">
              <p className="text-sm font-body font-semibold text-white truncate">{name}</p>
              <p className="text-xs text-sidebar-foreground/60 font-body">Educator view</p>
            </div>
          )}
        </button>
      </SidebarTooltip>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-64 card-organic-solid p-4 z-50">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt="" className="size-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="size-10 rounded-full bg-tuka-cyan/20 text-tuka-cyan flex items-center justify-center font-heading text-sm shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-body font-semibold text-foreground truncate">{name}</p>
              {email && (
                <p className="text-xs text-muted-foreground font-body truncate">{email}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(false)
              openUserProfile()
            }}
            className="w-full flex items-center gap-2 rounded-lg px-2 py-2 mt-2 text-sm font-body text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="size-4" />
            Manage account
          </button>
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
