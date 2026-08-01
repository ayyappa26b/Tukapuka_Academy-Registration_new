'use client'

import { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface DirectoryUser {
  id: string
  displayName: string
  email: string
  ageGroup: string | null
  totalPoints: number
  createdAt: string
}

const PAGE_SIZE = 10

export function UserDirectory({ role, emptyLabel }: { role: 'TUKA' | 'PUKA'; emptyLabel: string }) {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Debounce the search box so we're not firing a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Any new search resets back to page 1.
  useEffect(() => setPage(1), [debounced])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({
      role,
      page: String(page),
      pageSize: String(PAGE_SIZE),
      ...(debounced ? { search: debounced } : {}),
    })
    fetch(`/api/dashboard/users?${params}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        setUsers(data.users ?? [])
        setTotal(data.total ?? 0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [role, page, debounced])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="card-organic-solid p-6">
      <div className="relative max-w-sm mb-5" data-tour="directory-search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body py-12 text-center">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground font-body border-b border-border">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold">Email</th>
                <th className="py-2 pr-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-body font-semibold text-foreground">{u.displayName}</td>
                  <td className="py-3 pr-4 font-body text-muted-foreground">{u.email}</td>
                  <td className="py-3 pr-4 font-body text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
