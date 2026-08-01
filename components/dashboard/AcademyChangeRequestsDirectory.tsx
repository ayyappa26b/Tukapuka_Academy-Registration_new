'use client'

import { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader2, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAcademySocket } from '@/hooks/useAcademySocket'

interface AcademyChangeRequestRow {
  id: string
  reason: string | null
  createdAt: string
  requestingUser: { displayName: string; email: string }
  fromTenant: { name: string }
}

const PAGE_SIZE = 10

export function AcademyChangeRequestsDirectory({ tenantId }: { tenantId?: string }) {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [requests, setRequests] = useState<AcademyChangeRequestRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => setPage(1), [debounced])

  const [refreshKey, setRefreshKey] = useState(0)

  // Live updates: a new incoming request, or one getting reviewed elsewhere
  // (e.g. by another Tuka with dashboard access), refreshes this list
  // without the person needing to reload — same event bridge the main
  // app's /tuka/academy page uses.
  useAcademySocket({
    tenantId,
    onRequestNew: () => setRefreshKey(k => k + 1),
    onRequestReviewed: () => setRefreshKey(k => k + 1),
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      ...(debounced ? { search: debounced } : {}),
    })
    fetch(`/api/dashboard/academy-requests?${params}`)
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`)
        return data
      })
      .then(data => {
        if (cancelled) return
        setRequests(data.requests ?? [])
        setTotal(data.total ?? 0)
      })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load requests')
        setRequests([])
        setTotal(0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, debounced, refreshKey])

  async function act(id: string, action: 'approve' | 'reject') {
    setActingOn(id)
    try {
      await fetch(`/api/dashboard/academy-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectReason : undefined,
        }),
      })
      setRejectingId(null)
      setRejectReason('')
      setRefreshKey(k => k + 1)
    } finally {
      setActingOn(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="card-organic-solid p-6">
      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Tuka name or email..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-puka-red font-body py-12 text-center">
          Couldn&apos;t load requests — {error}
        </p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body py-12 text-center">
          No pending academy-change requests.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="rounded-xl border border-border px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-body font-semibold text-foreground">{r.requestingUser.displayName}</p>
                  <p className="text-xs text-muted-foreground font-body truncate">
                    {r.requestingUser.email} · currently at {r.fromTenant.name}
                  </p>
                  {r.reason && (
                    <p className="text-xs text-muted-foreground font-body italic mt-0.5">{r.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => act(r.id, 'approve')}
                    disabled={actingOn === r.id}
                    className="pill-btn size-8 flex items-center justify-center bg-puka-emerald/15 text-puka-emerald hover:bg-puka-emerald/25 disabled:opacity-40"
                    aria-label="Accept request"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    onClick={() => setRejectingId(rejectingId === r.id ? null : r.id)}
                    disabled={actingOn === r.id}
                    className="pill-btn size-8 flex items-center justify-center bg-puka-red/10 text-puka-red hover:bg-puka-red/20 disabled:opacity-40"
                    aria-label="Reject request"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {rejectingId === r.id && (
                <div className="mt-3 pt-3 border-t border-border flex gap-2">
                  <Input
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason (shown to the Tuka)"
                    className="text-xs"
                  />
                  <button
                    onClick={() => act(r.id, 'reject')}
                    disabled={actingOn === r.id}
                    className="pill-btn px-3 h-8 text-xs font-body font-semibold bg-puka-red/10 text-puka-red hover:bg-puka-red/20 disabled:opacity-40 shrink-0"
                  >
                    {actingOn === r.id ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                </div>
              )}
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
