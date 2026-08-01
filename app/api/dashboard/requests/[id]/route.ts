import { NextRequest, NextResponse } from 'next/server'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  action: z.enum(['verify', 'reject']),
  rejectedReason: z.string().trim().max(300).optional(),
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

  // Scope the update to this tenant so one academy can't touch another's requests.
  const existing = await prisma.paymentSubmission.findFirst({
    where: { id, tenantId: ctx.tenant.id },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

  const updated = await prisma.paymentSubmission.update({
    where: { id },
    data:
      parsed.data.action === 'verify'
        ? { status: 'VERIFIED', verifiedByTukaId: ctx.user.id, verifiedAt: new Date() }
        : { status: 'REJECTED', rejectedReason: parsed.data.rejectedReason ?? null },
  })

  return NextResponse.json({ ok: true, status: updated.status })
}
