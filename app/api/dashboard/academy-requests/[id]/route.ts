import { NextRequest, NextResponse } from 'next/server'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'
import { redis, ACADEMY_EVENTS_CHANNEL, type AcademyEvent } from '@/lib/redis-client'
import { z } from 'zod'

const schema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().trim().max(300).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getDashboardContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  // Scope to this tenant — one academy can't act on another's requests.
  const existing = await prisma.academyChangeRequest.findFirst({
    where: { id, targetTenantId: ctx.tenant.id, status: 'PENDING' },
  })
  if (!existing) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

  const action = parsed.data.action === 'approve' ? 'APPROVED' : 'REJECTED'

  const updated = await prisma.academyChangeRequest.update({
    where: { id },
    data: {
      status: action,
      reviewedByUserId: ctx.user.id,
      reviewedAt: new Date(),
      rejectionReason: action === 'REJECTED' ? (parsed.data.rejectionReason ?? null) : null,
    },
  })

  if (action === 'APPROVED') {
    const movedUser = await prisma.user.update({
      where: { id: existing.requestingUserId },
      data: { tenantId: existing.targetTenantId },
    })

    // Keep Clerk's session claims in sync — same fields the main app's
    // /api/onboard and /api/academy-change-requests/[id] set.
    try {
      await fetch(`https://api.clerk.com/v1/users/${movedUser.clerkId}/metadata`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: { role: 'TUKA', tenantId: existing.targetTenantId },
        }),
      })
    } catch (err) {
      console.error('[dashboard/academy-requests] Clerk metadata sync failed:', err)
    }
  }

  // Publish-only — the main app's server.ts subscribes to this channel and
  // notifies the requesting Tuka live. This project runs no socket server.
  const event: AcademyEvent = {
    type: 'request:reviewed',
    targetTenantId: existing.targetTenantId,
    requestingUserId: existing.requestingUserId,
    requestId: existing.id,
    status: action,
    rejectionReason: updated.rejectionReason,
  }
  await redis.publish(ACADEMY_EVENTS_CHANNEL, JSON.stringify(event)).catch((err) =>
    console.error('[dashboard/academy-requests] redis publish failed:', err),
  )

  return NextResponse.json({ ok: true, status: updated.status })
}
