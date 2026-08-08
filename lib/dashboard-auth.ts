import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Resolves the signed-in Clerk account to its academy dashboard context.
 * Returns null if there's no session, no User row yet, or the academy's
 * Tenant isn't APPROVED — callers should redirect appropriately in that case
 * rather than leak dashboard data.
 *
 * Any signed-in TUKA on the tenant can access the console (not just the
 * original creator) — ownership isn't tracked separately from role today.
 */
export async function getDashboardContext() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          licenseKey: true,
          reviewStatus: true,
          rejectionReason: true,
          contactEmail: true,
        },
      },
    },
  })
  if (!user) return null
  if (user.role !== 'TUKA') return null
  if (user.tenant.reviewStatus !== 'APPROVED') return null

  return { user, tenant: user.tenant }
}
