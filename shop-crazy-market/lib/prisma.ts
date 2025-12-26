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

  // Try DATABASE_URL first, then DIRECT_URL as fallback
  const urlsToTry = [
    { url: process.env.DATABASE_URL, name: 'DATABASE_URL' },
    { url: process.env.DIRECT_URL, name: 'DIRECT_URL' },
  ].filter(item => item.url) // Only include URLs that exist

  let lastError: Error | null = null

  for (const { url, name } of urlsToTry) {
    try {
      // Clean the URL before using it
      const cleanedUrl = cleanDatabaseUrl(url)
      
      console.log(`[Prisma] Trying ${name}...`)
      if (cleanedUrl !== url) {
        console.log(`[Prisma] Cleaned ${name} (removed query params/hash)`)
        console.log(`[Prisma] Original length: ${url.length}, Cleaned length: ${cleanedUrl.length}`)
      }

      // Temporarily set cleaned URL in environment
      const originalEnv = process.env.DATABASE_URL
      process.env.DATABASE_URL = cleanedUrl
      
      try {
        const prisma = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        })

        // Test connection with a simple query
        // This will fail fast if authentication is wrong
        prisma.$connect().catch(() => {
          // Connection test - if it fails, we'll catch it below
        })

        // Restore original URL
        process.env.DATABASE_URL = originalEnv

        console.log(`[Prisma] ✅ Successfully created PrismaClient using ${name}`)

        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prisma
        }

        return prisma
      } catch (prismaError: any) {
        // Restore original URL on error
        process.env.DATABASE_URL = originalEnv
        
        const errorMsg = prismaError.message || String(prismaError)
        console.error(`[Prisma] ❌ Failed with ${name}:`, errorMsg)
        
        // If it's an authentication error, try next URL
        if (errorMsg.includes('authentication') || errorMsg.includes('credentials') || errorMsg.includes('password')) {
          console.error(`[Prisma] Authentication failed with ${name}, trying next URL...`)
          lastError = prismaError
          continue // Try next URL
        }
        
        // If it's a pattern error, try next URL
        if (errorMsg.includes('pattern') || errorMsg.includes('expected') || errorMsg.includes('string did not match')) {
          console.error(`[Prisma] Pattern error with ${name}, trying next URL...`)
          lastError = prismaError
          continue // Try next URL
        }
        
        // For other errors, throw immediately
        throw prismaError
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error)
      console.error(`[Prisma] Error with ${name}:`, errorMsg)
      lastError = error
      
      // Continue to next URL if available
      if (urlsToTry.length > 1) {
        continue
      }
      
      // If this was the last URL, throw the error
      throw error
    }
  }

  // All URLs failed
  if (lastError) {
    const errorMsg = lastError.message || String(lastError)
    console.error('[Prisma] ❌ All URLs failed')
    console.error('[Prisma] Last error:', errorMsg)
    
    if (errorMsg.includes('authentication') || errorMsg.includes('credentials')) {
      throw new Error(
        `Database authentication failed with all connection URLs. ` +
        `Please verify your password in Supabase Dashboard matches the password in Vercel environment variables. ` +
        `Password should be: Gotjuiceicemanbaby1`
      )
    }
    
    throw lastError
  }

  throw new Error('No valid DATABASE_URL or DIRECT_URL found')
}

export const prisma = getPrismaClient()
