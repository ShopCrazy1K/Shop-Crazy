import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Clean DATABASE_URL by removing query parameters and ensuring proper format
 */
function cleanDatabaseUrl(url: string): string {
  if (!url) return url
  
  // Remove query parameters (everything after ?)
  let cleaned = url.split('?')[0]
  
  // Remove hash (everything after #)
  cleaned = cleaned.split('#')[0]
  
  // Trim whitespace
  cleaned = cleaned.trim()
  
  // Remove quotes if present
  cleaned = cleaned.replace(/^["']|["']$/g, '')
  
  return cleaned
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }

  // Clean the URL before using it
  const originalUrl = process.env.DATABASE_URL
  const cleanedUrl = cleanDatabaseUrl(originalUrl)
  
  // If URL was cleaned, log it
  if (cleanedUrl !== originalUrl) {
    console.log('[Prisma] Cleaned DATABASE_URL (removed query params/hash)')
    console.log('[Prisma] Original length:', originalUrl.length)
    console.log('[Prisma] Cleaned length:', cleanedUrl.length)
  }

  try {
    // Temporarily set cleaned URL in environment
    const originalEnv = process.env.DATABASE_URL
    process.env.DATABASE_URL = cleanedUrl
    
    try {
      const prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })

      // Restore original URL
      process.env.DATABASE_URL = originalEnv

      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prisma
      }

      return prisma
    } catch (prismaError: any) {
      // Restore original URL on error
      process.env.DATABASE_URL = originalEnv
      throw prismaError
    }
  } catch (error: any) {
    const errorMsg = error.message || String(error)
    console.error('[Prisma] Failed to create PrismaClient:', errorMsg)
    console.error('[Prisma] DATABASE_URL present:', !!process.env.DATABASE_URL)
    console.error('[Prisma] DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
    console.error('[Prisma] DATABASE_URL (first 80):', process.env.DATABASE_URL?.substring(0, 80) || 'none')
    console.error('[Prisma] Cleaned URL (first 80):', cleanedUrl.substring(0, 80))
    
    // Check for pattern errors
    if (errorMsg.includes('pattern') || errorMsg.includes('expected') || errorMsg.includes('string did not match')) {
      console.error('[Prisma] ⚠️ PATTERN VALIDATION ERROR')
      console.error('[Prisma] This usually means:')
      console.error('[Prisma] 1. URL has query parameters (remove ? and everything after)')
      console.error('[Prisma] 2. URL has hash (remove # and everything after)')
      console.error('[Prisma] 3. URL has quotes or spaces')
      console.error('[Prisma] 4. Password has unencoded special characters')
    }
    
    throw error
  }
}

export const prisma = getPrismaClient()
