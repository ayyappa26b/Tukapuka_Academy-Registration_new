import { NextResponse } from 'next/server'
import { getDashboardContext } from '@/lib/dashboard-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const ctx = await getDashboardContext()

  if (!ctx) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    )
  }

  const academyChangeRequests =
    await prisma.academyChangeRequest.count({
      where: {
        targetTenantId: ctx.tenant.id,
        status: 'PENDING',
      },
    })

  return NextResponse.json(
    { academyChangeRequests },
    {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate',
      },
    },
  )
}
