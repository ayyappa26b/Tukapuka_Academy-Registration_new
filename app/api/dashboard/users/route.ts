import { NextRequest, NextResponse } from 'next/server'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(req: NextRequest) {
  const ctx = await getDashboardContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const roleParam = searchParams.get('role')

if (roleParam !== 'TUKA' && roleParam !== 'PUKA') {
  return NextResponse.json(
    { error: 'role must be TUKA or PUKA' },
    { status: 400 }
  )
}

const role = roleParam as UserRole

  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 10)))
  const search = searchParams.get('search')?.trim() ?? ''

  const where = {
    tenantId: ctx.tenant.id,
    role,
    ...(search ? { displayName: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        email: true,
        ageGroup: true,
        totalPoints: true,
        createdAt: true,
      },
      orderBy: { displayName: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, total, page, pageSize })
}
