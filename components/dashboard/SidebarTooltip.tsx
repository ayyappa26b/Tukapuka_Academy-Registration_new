'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Small hover tooltip used by the sidebar when it's collapsed to icons.
 * Renders its own positioning (to the right of the trigger) rather than
 * relying on the native `title` attribute, which is slow to appear and
 * can't be styled.
 */
export function SidebarTooltip({
  label,
  disabled,
  children,
}: {
  label: string
  disabled?: boolean
  children: ReactNode
}) {
  const [show, setShow] = useState(false)

  if (disabled) return <>{children}</>

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <div
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50',
          'whitespace-nowrap rounded-md bg-tuka-navy px-2.5 py-1.5 text-xs font-body font-semibold text-white shadow-lg',
          'transition-opacity duration-150',
          show ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-tuka-navy" />
      </div>
    </div>
  )
}
