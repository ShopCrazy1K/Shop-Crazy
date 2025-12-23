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
  let fixedUrl = fixDatabaseUrl(process.env.DATABASE_URL)
  
  // Additional fix: Ensure all special characters in password are properly encoded
  // This handles cases where password might have $, #, @, etc.
  try {
    const urlObj = new URL(fixedUrl)
    // If we can parse it, reconstruct with properly encoded password
    if (urlObj.password && urlObj.password !== decodeURIComponent(urlObj.password)) {
      // Password is already encoded, use as-is
    } else if (urlObj.password) {
      // Re-encode password to ensure all special chars are encoded
      const encodedPassword = encodeURIComponent(urlObj.password)
      fixedUrl = fixedUrl.replace(`:${urlObj.password}@`, `:${encodedPassword}@`)
    }
  } catch (urlError: unknown) {
    // If URL parsing fails, try to fix common issues
    const errorMessage = urlError instanceof Error ? urlError.message : String(urlError)
    console.warn('[Prisma] URL parsing failed, attempting to fix:', errorMessage)
    
    // Try encoding the entire password part if it contains special chars
    const passwordMatch = fixedUrl.match(/postgresql:\/\/[^:]+:([^@]+)@/)
    if (passwordMatch) {
      const password = passwordMatch[1]
      // If password contains unencoded special chars, encode them
      if (password.match(/[#\$@%]/) && !password.includes('%')) {
        const encodedPassword = encodeURIComponent(password)
        fixedUrl = fixedUrl.replace(`:${password}@`, `:${encodedPassword}@`)
      }
    }
  }
  
  // Validate URL format before passing to Prisma
  try {
    // Try to parse as URL to validate format
    new URL(fixedUrl)
  } catch (urlError: unknown) {
    const errorMessage = urlError instanceof Error ? urlError.message : String(urlError)
    console.error('[Prisma] Invalid DATABASE_URL format after fixes:', errorMessage)
    console.error('[Prisma] Original URL (first 80 chars):', process.env.DATABASE_URL?.substring(0, 80))
    console.error('[Prisma] Fixed URL (first 80 chars):', fixedUrl.substring(0, 80))
    throw new Error(
      `Invalid DATABASE_URL format. Expected: postgresql://user:password@host:port/database. ` +
      `Error: ${errorMessage}. Please check your Vercel environment variables.`
    )
  }
  
  // Temporarily override DATABASE_URL for Prisma
  const originalUrl = process.env.DATABASE_URL
  process.env.DATABASE_URL = fixedUrl

  let prisma: PrismaClient
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch (prismaError: any) {
    console.error('[Prisma] Failed to create client:', prismaError)
    // If it's a URL validation error, provide helpful message
    if (prismaError.message?.includes('pattern') || prismaError.message?.includes('URL')) {
      throw new Error(
        `DATABASE_URL validation failed. Please check your Vercel environment variables. ` +
        `The URL should be in format: postgresql://user:password@host:port/database. ` +
        `If your password contains special characters, they must be URL-encoded (e.g., # as %23). ` +
        `Original error: ${prismaError.message}`
      )
    }
    throw prismaError
  }

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

