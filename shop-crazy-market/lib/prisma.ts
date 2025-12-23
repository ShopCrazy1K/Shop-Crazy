import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Helper function to fix DATABASE_URL encoding issues
function fixDatabaseUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url
  }
  
  // If URL contains unencoded # in password, encode it
  // Pattern: postgresql://user:password#@host
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/
  const match = url.match(urlPattern)
  
  if (match) {
    const [, prefix, password, suffix] = match
    // Check if password contains unencoded special characters
    if (password.includes('#') && !password.includes('%23')) {
      // Encode # as %23
      const encodedPassword = password.replace(/#/g, '%23')
      return `${prefix}${encodedPassword}${suffix}`
    }
  }
  
  // If pattern doesn't match, return original (might be connection pooling URL)
  return url
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

  // Fix URL encoding issues automatically
  const fixedUrl = fixDatabaseUrl(process.env.DATABASE_URL)
  
  // Temporarily override DATABASE_URL for Prisma
  const originalUrl = process.env.DATABASE_URL
  process.env.DATABASE_URL = fixedUrl

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Restore original URL (in case it's used elsewhere)
  process.env.DATABASE_URL = originalUrl

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

