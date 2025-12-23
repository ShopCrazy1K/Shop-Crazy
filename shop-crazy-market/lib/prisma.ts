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
      console.error('[Prisma] URL breakdown:', {
        hasProtocol: process.env.DATABASE_URL.startsWith('postgresql://'),
        hasUsername: process.env.DATABASE_URL.includes('://') && process.env.DATABASE_URL.split('://')[1].includes(':'),
        hasPassword: process.env.DATABASE_URL.includes(':') && process.env.DATABASE_URL.includes('@'),
        hasHost: process.env.DATABASE_URL.includes('@'),
        hasPort: /:\d+\//.test(process.env.DATABASE_URL),
        hasDatabase: process.env.DATABASE_URL.includes('/') && process.env.DATABASE_URL.split('/').length > 1,
      })
    }
  } catch (urlError: any) {
    console.error('[Prisma] Failed to parse URL:', urlError.message)
  }

  // Create PrismaClient - let it read from process.env.DATABASE_URL directly
  // No explicit datasource, no URL manipulation, just use what's in the environment
  // Prisma will validate the URL format internally
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
    
    // If it's a pattern error, provide detailed help
    if (errorMsg.includes('pattern') || errorMsg.includes('expected') || errorMsg.includes('string did not match')) {
      console.error('[Prisma] PATTERN VALIDATION ERROR DETECTED')
      console.error('[Prisma] This means the DATABASE_URL format is invalid')
      console.error('[Prisma] Current URL (first 100 chars):', process.env.DATABASE_URL.substring(0, 100))
      console.error('[Prisma] Expected format: postgresql://user:password@host:port/database')
      console.error('[Prisma] Visit /api/debug-database-url to see detailed URL analysis')
      
      // Re-throw with helpful message
      throw new Error(
        `DATABASE_URL validation failed: ${errorMsg}. ` +
        `The URL format does not match Prisma's expected pattern. ` +
        `Please check your Vercel environment variables. ` +
        `Visit /api/debug-database-url for detailed analysis. ` +
        `Expected format: postgresql://postgres:PASSWORD@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres`
      )
    }
    
    // Re-throw other errors
    throw error
  }
}

// Export prisma client - created lazily on first access
export const prisma = getPrismaClient()
