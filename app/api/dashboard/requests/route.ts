import { NextRequest, NextResponse } from 'next/server'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const ctx = await getDashboardContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 10)))
  const search = searchParams.get('search')?.trim() ?? ''

  const where = {
    tenantId: ctx.tenant.id,
    status: 'PENDING' as const,
    ...(search ? { pukaName: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [requests, total] = await Promise.all([
    prisma.paymentSubmission.findMany({
      where,
      select: {
        id: true,
        pukaName: true,
        guardianEmail: true,
        amount: true,
        currency: true,
        notes: true,
        screenshotUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.paymentSubmission.count({ where }),
  ])

  return NextResponse.json({ requests, total, page, pageSize })
}
