import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }

  try {
    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }

    return prisma
  } catch (error: any) {
    const errorMsg = error.message || String(error)
    console.error('[Prisma] Failed to create PrismaClient:', errorMsg)
    console.error('[Prisma] DATABASE_URL present:', !!process.env.DATABASE_URL)
    console.error('[Prisma] DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
    console.error('[Prisma] DATABASE_URL (first 50):', process.env.DATABASE_URL?.substring(0, 50) || 'none')
    
    throw error
  }
}

export const prisma = getPrismaClient()
