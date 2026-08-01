import Redis from 'ioredis'

/**
 * This app never runs its own Socket.IO server or Redis subscriber (see
 * next.config.ts) — it only *publishes* to the same Redis instance/channel
 * the main TukaPuka app (server.ts) subscribes to, so that when a Tuka
 * here approves/rejects an AcademyChangeRequest, the Tuka who filed it —
 * connected to the main app's `/academy` namespace — sees the outcome
 * live.
 *
 * For its own live updates (e.g. a new incoming request appearing on
 * /dashboard/academy without a reload), this app doesn't need Redis at
 * all — hooks/useAcademySocket.ts connects a plain socket.io-client
 * straight to the main app's already-running /academy namespace and joins
 * the `tenant:<id>` room, same as the main app's own client does.
 */
const globalForRedis = global as unknown as { redis?: Redis }

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
  })
  client.on('error', (err) => console.error('[Redis] Client error:', err))
  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Must match lib/redis-client.ts ACADEMY_EVENTS_CHANNEL in the main app.
export const ACADEMY_EVENTS_CHANNEL = 'academy:events'

export type AcademyEvent =
  | { type: 'request:new'; targetTenantId: string; requestId: string }
  | {
      type: 'request:reviewed'
      targetTenantId: string
      requestingUserId: string
      requestId: string
      status: 'APPROVED' | 'REJECTED'
      rejectionReason?: string | null
    }
