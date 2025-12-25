import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Client with robust error handling
 * Handles DATABASE_URL validation errors gracefully
 */
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }

  const dbUrl = process.env.DATABASE_URL.trim()
  
  // Log the URL format (hide password for security)
  const urlForLogging = dbUrl.replace(/:([^:@]+)@/, ':****@')
  console.log('[Prisma] Using DATABASE_URL:', urlForLogging.substring(0, 80) + '...')
  console.log('[Prisma] URL length:', dbUrl.length)
  console.log('[Prisma] URL starts with postgresql://', dbUrl.startsWith('postgresql://'))
  
  // Validate and clean the URL
  let cleanedUrl = dbUrl
  
  // Remove any quotes
  cleanedUrl = cleanedUrl.replace(/^["']|["']$/g, '')
  
  // Ensure it starts with postgresql:// (not postgres://)
  if (cleanedUrl.startsWith('postgres://')) {
    cleanedUrl = cleanedUrl.replace('postgres://', 'postgresql://')
    console.log('[Prisma] Fixed protocol: postgres:// -> postgresql://')
  }
  
  // Check Prisma pattern match BEFORE creating client
  const prismaPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/
  const matches = cleanedUrl.match(prismaPattern)
  
  if (!matches) {
    console.error('[Prisma] ❌ URL does not match Prisma pattern!')
    console.error('[Prisma] URL (first 100 chars):', cleanedUrl.substring(0, 100))
    console.error('[Prisma] Expected format: postgresql://user:password@host:port/database')
    
    // Try to provide helpful error
    const issues: string[] = []
    if (!cleanedUrl.startsWith('postgresql://')) {
      issues.push('Must start with postgresql://')
    }
    if (!cleanedUrl.includes('://')) {
      issues.push('Missing protocol separator (://)')
    }
    if (!cleanedUrl.includes('@')) {
      issues.push('Missing @ separator between credentials and host')
    }
    if (!cleanedUrl.includes('/')) {
      issues.push('Missing database name (path after /)')
    }
    
    throw new Error(
      `DATABASE_URL format is invalid. ` +
      `Issues: ${issues.join(', ')}. ` +
      `Expected: postgresql://user:password@host:port/database ` +
      `Got: ${cleanedUrl.substring(0, 100)}... ` +
      `Visit /api/debug-database-url for detailed analysis.`
    )
  }
  
  console.log('[Prisma] ✅ URL matches Prisma pattern')
  console.log('[Prisma] URL components:', {
    username: matches[1],
    passwordLength: matches[2].length,
    host: matches[3],
    port: matches[4] || 'default',
    database: matches[5] || '/postgres',
  })
  
  // Set cleaned URL in environment temporarily for Prisma
  const originalUrl = process.env.DATABASE_URL
  process.env.DATABASE_URL = cleanedUrl
  
  try {
    console.log('[Prisma] Creating PrismaClient instance...')
    
    // Create PrismaClient - it will read from process.env.DATABASE_URL
    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    console.log('[Prisma] ✅ PrismaClient created successfully')
    
    // Restore original URL
    process.env.DATABASE_URL = originalUrl
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
    
    return prisma
  } catch (error: any) {
    // Restore original URL on error
    process.env.DATABASE_URL = originalUrl
    
    const errorMsg = error.message || String(error)
    console.error('[Prisma] ❌ Failed to create PrismaClient:', errorMsg)
    console.error('[Prisma] Error type:', error.constructor?.name)
    console.error('[Prisma] Error code:', error.code)
    
    // If it's a pattern error, provide detailed help
    if (errorMsg.includes('pattern') || errorMsg.includes('expected') || errorMsg.includes('string did not match')) {
      console.error('[Prisma] ⚠️ PATTERN VALIDATION ERROR')
      console.error('[Prisma] This occurs when PrismaClient is instantiated')
      console.error('[Prisma] Cleaned URL (first 100 chars):', cleanedUrl.substring(0, 100))
      console.error('[Prisma] Original URL (first 100 chars):', originalUrl.substring(0, 100))
      
      // Check if cleaning helped
      if (cleanedUrl !== originalUrl) {
        console.error('[Prisma] URL was cleaned but still failed validation')
      }
      
      throw new Error(
        `DATABASE_URL validation failed: ${errorMsg}. ` +
        `The URL format does not match Prisma's expected pattern. ` +
        `Cleaned URL: ${cleanedUrl.substring(0, 80)}... ` +
        `Please check your Vercel environment variables. ` +
        `Visit /api/debug-database-url for detailed analysis. ` +
        `Visit /api/test-prisma-connection for step-by-step testing.`
      )
    }
    
    // Re-throw other errors
    throw error
  }
}

// Export prisma client - created lazily on first access
export const prisma = getPrismaClient()
