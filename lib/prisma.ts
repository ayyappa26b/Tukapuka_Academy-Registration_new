import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

/**
 * Prisma client singleton.
 * NOTE: Tenant isolation is enforced by passing `tenantId` explicitly
 * in every query's `where` clause. Do NOT use global context for this —
 * it leaks between concurrent requests in Next.js App Router.
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
