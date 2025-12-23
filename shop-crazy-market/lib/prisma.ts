import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * SIMPLIFIED Prisma Client - No URL processing, no validation bypass attempts
 * Just use the URL exactly as provided in environment variable
 * 
 * This is the simplest possible approach - let Prisma handle the URL validation
 */
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }

  // Log the URL format (hide password for security)
  const urlForLogging = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')
  console.log('[Prisma] Using DATABASE_URL:', urlForLogging.substring(0, 80) + '...')
  console.log('[Prisma] URL length:', process.env.DATABASE_URL.length)
  console.log('[Prisma] URL starts with postgresql://', process.env.DATABASE_URL.startsWith('postgresql://'))
  
  // Detailed URL analysis for debugging
  try {
    const url = new URL(process.env.DATABASE_URL)
    console.log('[Prisma] URL components:', {
      protocol: url.protocol,
      username: url.username,
      hostname: url.hostname,
      port: url.port || 'default',
      pathname: url.pathname,
      passwordLength: url.password?.length || 0,
      passwordHasSpecialChars: url.password ? /[#\$@%&]/.test(url.password) : false,
      passwordIsEncoded: url.password ? url.password.includes('%') : false,
    })
    
    // Check Prisma pattern match
    const prismaPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/
    const matches = process.env.DATABASE_URL.match(prismaPattern)
    console.log('[Prisma] Prisma pattern match:', matches ? 'YES' : 'NO')
    if (!matches) {
      console.error('[Prisma] URL does not match Prisma pattern!')
      console.error('[Prisma] Expected: postgresql://user:password@host:port/database')
      console.error('[Prisma] Got:', process.env.DATABASE_URL.substring(0, 100))
    }
  } catch (urlError: any) {
    console.error('[Prisma] Failed to parse URL:', urlError.message)
  }

  // Create PrismaClient - let it read from process.env.DATABASE_URL directly
  // No explicit datasource, no URL manipulation, just use what's in the environment
  // Prisma will validate the URL format internally
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }

  return prisma
}

// Export prisma client - created lazily on first access
export const prisma = getPrismaClient()
