'use client'

import { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader2, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface PaymentRequest {
  id: string
  pukaName: string
  guardianEmail: string
  amount: string
  currency: string
  notes: string | null
  screenshotUrl: string
  createdAt: string
}

const PAGE_SIZE = 10

export function RequestsDirectory() {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actingOn, setActingOn] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => setPage(1), [debounced])

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      ...(debounced ? { search: debounced } : {}),
    })
    fetch(`/api/dashboard/requests?${params}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        setRequests(data.requests ?? [])
        setTotal(data.total ?? 0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, debounced, refreshKey])

  async function act(id: string, action: 'verify' | 'reject') {
    setActingOn(id)
    try {
      await fetch(`/api/dashboard/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      setRefreshKey(k => k + 1)
    } finally {
      setActingOn(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="card-organic-solid p-6">
      <div className="relative max-w-sm mb-5" data-tour="directory-search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by learner name..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body py-12 text-center">
          No pending payment requests.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-body font-semibold text-foreground">{r.pukaName}</p>
                <p className="text-xs text-muted-foreground font-body truncate">
                  {r.guardianEmail} · {r.currency} {r.amount}
                </p>
                {r.notes && (
                  <p className="text-xs text-muted-foreground font-body italic mt-0.5">{r.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={r.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-body font-semibold text-tuka-blue hover:underline"
                >
                  View proof
                </a>
                <button
                  onClick={() => act(r.id, 'verify')}
                  disabled={actingOn === r.id}
                  className="pill-btn size-8 flex items-center justify-center bg-puka-emerald/15 text-puka-emerald hover:bg-puka-emerald/25 disabled:opacity-40"
                  aria-label="Verify payment"
                >
                  <Check className="size-4" />
                </button>
                <button
                  onClick={() => act(r.id, 'reject')}
                  disabled={actingOn === r.id}
                  className="pill-btn size-8 flex items-center justify-center bg-puka-red/10 text-puka-red hover:bg-puka-red/20 disabled:opacity-40"
                  aria-label="Reject payment"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && total > 0 && (
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-body">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pill-btn size-8 flex items-center justify-center bg-muted disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-body font-semibold text-foreground min-w-[3rem] text-center">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="pill-btn size-8 flex items-center justify-center bg-muted disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
