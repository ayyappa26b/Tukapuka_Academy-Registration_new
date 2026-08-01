'use client'

/**
 * useAcademySocket (educator dashboard)
 * ──────────────────────────────────────
 * This project runs no socket server of its own (see lib/redis-client.ts) —
 * it connects as a plain client to the main TukaPuka app's long-lived
 * server.ts, which already bridges Redis → the /academy Socket.IO
 * namespace. That's the same event stream /tuka/academy uses on the main
 * app's side (see tukapuka/hooks/useAcademySocket.ts); this is just a
 * second listener on the `tenant:<tenantId>` room.
 *
 * Joining the tenant room alone is enough here: server.ts broadcasts both
 * `request:new` and `request:reviewed` to `tenant:<targetTenantId>`, which
 * covers everything this dashboard's Requests page needs to refresh live —
 * we don't need the per-user room the main app also joins.
 */

import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'

interface AcademyRequestNewEvent {
  type: 'request:new'
  requestId: string
  targetTenantId: string
}

interface AcademyRequestReviewedEvent {
  type: 'request:reviewed'
  requestId: string
  targetTenantId: string
  requestingUserId: string
  status: 'APPROVED' | 'REJECTED'
  rejectionReason?: string | null
}

export interface UseAcademySocketOptions {
  tenantId?: string
  disabled?: boolean
  onRequestNew?: (event: AcademyRequestNewEvent) => void
  onRequestReviewed?: (event: AcademyRequestReviewedEvent) => void
}

export function useAcademySocket(options: UseAcademySocketOptions) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (options.disabled || !options.tenantId) return

    const appUrl = process.env.NEXT_PUBLIC_TUKAPUKA_APP_URL ?? 'http://localhost:3000'
    const socket = io(`${appUrl}/academy`, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      auth: { tenantId: options.tenantId },
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('academy:join', { tenantId: options.tenantId })
    })

    if (options.onRequestNew) socket.on('request:new', options.onRequestNew)
    if (options.onRequestReviewed) socket.on('request:reviewed', options.onRequestReviewed)

    return () => {
      socket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.disabled, options.tenantId])

  return { socket: socketRef }
}
