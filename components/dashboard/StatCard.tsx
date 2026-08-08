import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  href,
}: {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  tone: 'blue' | 'emerald' | 'orange'
  href?: string
}) {
  const toneClass = {
    blue: 'text-tuka-blue bg-tuka-blue/10',
    emerald: 'text-puka-emerald bg-puka-emerald/10',
    orange: 'text-tuka-orange bg-tuka-orange/10',
  }[tone]

  const content = (
    <div className="card-organic-solid p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-body font-bold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <div
          className={`size-8 rounded-lg flex items-center justify-center ${toneClass}`}
        >
          <Icon className="size-4" />
        </div>
      </div>

      <p className="font-score text-4xl font-bold mt-3 text-tuka-navy">
        {value}
      </p>

      <p className="text-xs text-muted-foreground font-body mt-1">
        {hint}
      </p>
    </div>
  )

  if (!href) return content

  return (
    <Link
      href={href}
      className="block transition-transform hover:-translate-y-0.5"
      aria-label={`${label}: ${value}. Open ${label.toLowerCase()}`}
    >
      {content}
    </Link>
  )
}
