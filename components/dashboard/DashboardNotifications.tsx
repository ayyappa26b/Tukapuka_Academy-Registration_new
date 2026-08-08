'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useAcademySocket } from '@/hooks/useAcademySocket'

type DashboardNotificationsContextValue = {
  academyChangeRequests: number
}

const DashboardNotificationsContext =
  createContext<DashboardNotificationsContextValue>({
    academyChangeRequests: 0,
  })

export function useDashboardNotifications() {
  return useContext(
    DashboardNotificationsContext,
  )
}

export function DashboardNotifications({
  tenantId,
  children,
}: {
  tenantId: string
  children: React.ReactNode
}) {
  const [academyChangeRequests, setAcademyChangeRequests] =
    useState(0)
  const [toast, setToast] = useState<{
    title: string
    message: string
    kind: 'new' | 'success' | 'error'
  } | null>(null)
  const previousCount = useRef<number | null>(null)
  const hideTimer = useRef<number | null>(null)

  const showToast = (
    title: string,
    message: string,
    kind: 'new' | 'success' | 'error' = 'new',
  ) => {
    setToast({ title, message, kind })

    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current)
    }

    hideTimer.current = window.setTimeout(() => {
      setToast(null)
    }, 5000)
  }

  const refreshCount = async () => {
    try {
      const res = await fetch(
        '/api/dashboard/notifications',
        {
          cache: 'no-store',
        },
      )

      if (!res.ok) return

      const data = await res.json()
      const next =
        Number(data.academyChangeRequests) || 0

      setAcademyChangeRequests(next)

      if (
        previousCount.current !== null &&
        next > previousCount.current
      ) {
        const added =
          next - previousCount.current

        showToast(
          'New academy request',
          added === 1
            ? 'A Tuka wants to join your academy.'
            : `${added} Tukas want to join your academy.`,
          'new',
        )
      }

      previousCount.current = next
    } catch (error) {
      console.error(
        '[DashboardNotifications]',
        error,
      )
    }
  }

  useEffect(() => {
    refreshCount()

    const interval = window.setInterval(
      refreshCount,
      10000,
    )

    return () => {
      window.clearInterval(interval)

      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current)
      }
    }
  }, [])

  useAcademySocket({
    tenantId,
    onRequestNew: () => {
      refreshCount()
      showToast(
        'New academy request',
        'A Tuka wants to join your academy.',
        'new',
      )
    },
    onRequestReviewed: (event) => {
      refreshCount()

      showToast(
        event.status === 'APPROVED'
          ? 'Request approved'
          : 'Request rejected',
        event.status === 'APPROVED'
          ? 'The academy-change request was approved.'
          : 'The academy-change request was rejected.',
        event.status === 'APPROVED'
          ? 'success'
          : 'error',
      )
    },
  })

  return (
    <DashboardNotificationsContext.Provider
      value={{ academyChangeRequests }}
    >
      {children}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-5 z-[100] w-[min(380px,calc(100vw-2rem))] animate-in fade-in slide-in-from-top-3"
        >
          <div className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-[0_18px_60px_rgba(11,59,96,0.18)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-lg ${
                  toast.kind === 'success'
                    ? 'bg-puka-emerald/15'
                    : toast.kind === 'error'
                      ? 'bg-puka-red/10'
                      : 'bg-tuka-blue/10'
                }`}
              >
                {toast.kind === 'success'
                  ? '✓'
                  : toast.kind === 'error'
                    ? '!'
                    : '🔔'}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-heading text-base font-bold text-tuka-navy">
                  {toast.title}
                </p>
                <p className="mt-0.5 text-xs font-body text-muted-foreground">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardNotificationsContext.Provider>
  )
}
