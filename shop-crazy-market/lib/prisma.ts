import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization - only create client when actually used
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    // During build, return a mock client that throws helpful errors
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      throw new Error(
        'DATABASE_URL is not set. Please add it to your Vercel environment variables for Production, Preview, and Development environments.'
      )
    }
    throw new Error('DATABASE_URL environment variable is not set.')
  }

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }

  return prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient()
    return (client as any)[prop]
  },
})

