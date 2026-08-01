'use client'

import { useState } from 'react'
import { GraduationCap, Copy, Check } from 'lucide-react'

export function AcademyCodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="card-organic-solid p-5 flex items-center justify-between gap-4 flex-wrap"
      data-tour="academy-code"
    >
      <div className="flex items-center gap-4">
        <div className="size-11 rounded-xl bg-tuka-orange/10 flex items-center justify-center shrink-0">
          <GraduationCap className="size-5 text-tuka-orange" />
        </div>
        <div>
          <p className="text-xs font-body font-bold tracking-wide text-tuka-blue uppercase">
            Tuka enrollment code
          </p>
          <p className="font-score text-2xl font-bold tracking-[0.15em] text-tuka-navy">{code}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-xs text-muted-foreground font-body max-w-[16rem]">
          Tuka sign up and enter this code on the join page. One code per academy — never
          changes.
        </p>
        <button
          onClick={copy}
          className="pill-btn flex items-center gap-1.5 px-4 py-2 bg-tuka-blue text-white text-sm font-semibold hover:opacity-90 shrink-0"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
