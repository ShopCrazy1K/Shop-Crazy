import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Helper function to fix DATABASE_URL encoding issues
function fixDatabaseUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url
  }
  
  // Remove any whitespace, quotes, or newlines
  url = url.trim().replace(/^["']|["']$/g, '').replace(/\n/g, '')
  
  // Try to parse and reconstruct the URL properly
  try {
    // Pattern: postgresql://user:password@host:port/database
    const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/
    const match = url.match(urlPattern)
    
    if (match) {
      const [, username, password, host, port, path] = match
      
      // Properly encode the password
      let encodedPassword = password
      // If password contains special chars that aren't encoded, encode them
      if (password.includes('#') && !password.includes('%23')) {
        encodedPassword = encodedPassword.replace(/#/g, '%23')
      }
      if (password.includes('$') && !password.includes('%24')) {
        encodedPassword = encodedPassword.replace(/\$/g, '%24')
      }
      if (password.includes('@') && !password.includes('%40')) {
        encodedPassword = encodedPassword.replace(/@/g, '%40')
      }
      if (password.includes('%') && !password.match(/%[0-9A-Fa-f]{2}/)) {
        // If % is present but not as part of encoding, encode it
        encodedPassword = encodedPassword.replace(/%(?![0-9A-Fa-f]{2})/g, '%25')
      }
      
      // Reconstruct URL
      const portPart = port ? `:${port}` : ''
      const pathPart = path || '/postgres'
      return `postgresql://${username}:${encodedPassword}@${host}${portPart}${pathPart}`
    }
    
    // If pattern doesn't match, try URL constructor
    const urlObj = new URL(url)
    if (urlObj.password) {
      // Re-encode password
      const decodedPassword = decodeURIComponent(urlObj.password)
      const encodedPassword = encodeURIComponent(decodedPassword)
      urlObj.password = encodedPassword
      return urlObj.toString()
    }
    
    return url
  } catch (error) {
    // If URL parsing fails, try basic fixes
    console.warn('[Prisma] URL parsing failed, attempting basic fixes:', error)
    
    // Remove any obvious issues
    url = url.trim()
    
    // Try to encode password if it looks unencoded
    const passwordMatch = url.match(/postgresql:\/\/[^:]+:([^@]+)@/)
    if (passwordMatch) {
      const password = passwordMatch[1]
      // If password has special chars but no % encoding, encode them
      if (password.match(/[#\$@%]/) && !password.match(/%[0-9A-Fa-f]{2}/)) {
        const encodedPassword = encodeURIComponent(password)
        url = url.replace(`:${password}@`, `:${encodedPassword}@`)
      }
    }
    
    return url
  }
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
  
  // Store original URL to restore later
  const originalUrl = process.env.DATABASE_URL

  // Log the URL we're about to pass to Prisma (hide password for security)
  const urlForLogging = fixedUrl.replace(/:([^:@]+)@/, ':****@')
  console.log('[Prisma] Attempting to connect with URL:', urlForLogging)
  console.log('[Prisma] URL length:', fixedUrl.length)
  console.log('[Prisma] URL starts with postgresql://', fixedUrl.startsWith('postgresql://'))
  
  // Set the fixed URL for Prisma (it reads from process.env.DATABASE_URL)
  const originalEnvUrl = process.env.DATABASE_URL
  process.env.DATABASE_URL = fixedUrl
  
  // Try to create PrismaClient - catch validation errors early
  let prisma: PrismaClient
  
  // First, try with the fixed URL
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: fixedUrl,
        },
      },
    })
  } catch (prismaError: unknown) {
    const errorMessage = prismaError instanceof Error ? prismaError.message : String(prismaError)
    
    // If it's a pattern validation error, try reconstructing the URL more carefully
    if (errorMessage.includes('pattern') || errorMessage.includes('expected')) {
      console.warn('[Prisma] Pattern validation failed, attempting URL reconstruction...')
      
      try {
        // Parse the URL components manually
        const urlMatch = fixedUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/)
        
        if (urlMatch) {
          const [, username, password, host, port, path] = urlMatch
          
          // Re-encode password using encodeURIComponent (handles all special chars)
          const safePassword = encodeURIComponent(decodeURIComponent(password))
          
          // Reconstruct URL with properly encoded password
          const reconstructedUrl = `postgresql://${username}:${safePassword}@${host}${port ? `:${port}` : ''}${path || '/postgres'}`
          
          console.log('[Prisma] Attempting with reconstructed URL:', reconstructedUrl.replace(/:([^:@]+)@/, ':****@'))
          
          // Try again with reconstructed URL
          prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            datasources: {
              db: {
                url: reconstructedUrl,
              },
            },
          })
          
          // Update fixedUrl for logging
          fixedUrl = reconstructedUrl
        } else {
          throw new Error('Could not parse URL format')
        }
      } catch (reconstructError: unknown) {
        // Restore original URL even on error
        process.env.DATABASE_URL = originalUrl
        
        const reconstructMessage = reconstructError instanceof Error ? reconstructError.message : String(reconstructError)
        const errorStack = prismaError instanceof Error ? prismaError.stack : 'No stack'
        
        console.error('[Prisma] Failed to create client after reconstruction')
        console.error('[Prisma] Original error:', errorMessage)
        console.error('[Prisma] Reconstruction error:', reconstructMessage)
        console.error('[Prisma] Error stack:', errorStack)
        console.error('[Prisma] URL attempted (password hidden):', urlForLogging)
        console.error('[Prisma] URL length:', fixedUrl.length)
        console.error('[Prisma] Original URL (first 100 chars):', process.env.DATABASE_URL?.substring(0, 100))
        
        throw new Error(
          `DATABASE_URL validation failed. ` +
          `Prisma rejected the URL format. ` +
          `Please check your Vercel environment variables. ` +
          `URL format attempted: ${urlForLogging} ` +
          `The URL should be: postgresql://user:password@host:port/database ` +
          `Special characters in password must be URL-encoded ($ as %24, # as %23). ` +
          `Original error: ${errorMessage} ` +
          `Reconstruction error: ${reconstructMessage}`
        )
      }
    } else {
      // Restore original URL even on error
      process.env.DATABASE_URL = originalUrl
      
      const errorStack = prismaError instanceof Error ? prismaError.stack : 'No stack'
      
      console.error('[Prisma] Failed to create client')
      console.error('[Prisma] Error message:', errorMessage)
      console.error('[Prisma] Error stack:', errorStack)
      console.error('[Prisma] URL attempted (password hidden):', urlForLogging)
      console.error('[Prisma] URL length:', fixedUrl.length)
      
      throw prismaError
    }
  }
  
  // Restore original URL after successful creation
  process.env.DATABASE_URL = originalUrl

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

