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
  
  // For connection pooling URLs (postgres.PROJECT_REF format), 
  // Prisma might be strict about the format. Let's validate it properly.
  
  try {
    // First, try to parse with URL constructor to validate basic format
    const urlObj = new URL(url)
    
    // Check if it's a PostgreSQL URL
    if (urlObj.protocol !== 'postgresql:') {
      console.warn('[Prisma] URL protocol is not postgresql:', urlObj.protocol)
      return url
    }
    
    // If password exists, ensure it's properly encoded
    if (urlObj.password) {
      // Decode and re-encode to ensure proper encoding
      try {
        const decodedPassword = decodeURIComponent(urlObj.password)
        const encodedPassword = encodeURIComponent(decodedPassword)
        
        // Only update if encoding changed (means it wasn't properly encoded)
        if (urlObj.password !== encodedPassword) {
          // Reconstruct URL with properly encoded password
          const newUrl = new URL(url)
          newUrl.password = encodedPassword
          url = newUrl.toString()
          console.log('[Prisma] Re-encoded password in URL')
        }
      } catch (encodeError) {
        // If decode fails, password might already be raw, try encoding it
        const encodedPassword = encodeURIComponent(urlObj.password)
        const newUrl = new URL(url)
        newUrl.password = encodedPassword
        url = newUrl.toString()
        console.log('[Prisma] Encoded raw password in URL')
      }
    }
    
    // Validate the reconstructed URL
    const validatedUrl = new URL(url)
    console.log('[Prisma] URL validated successfully')
    console.log('[Prisma] Username:', validatedUrl.username)
    console.log('[Prisma] Host:', validatedUrl.hostname)
    console.log('[Prisma] Port:', validatedUrl.port || 'default')
    
    return url
  } catch (error: any) {
    // If URL constructor fails, try regex-based approach
    console.warn('[Prisma] URL constructor failed, trying regex approach:', error.message)
    
    // Pattern: postgresql://user:password@host:port/database
    const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/
    const match = url.match(urlPattern)
    
    if (match) {
      const [, username, password, host, port, path] = match
      
      // Decode and re-encode password to ensure proper encoding
      let encodedPassword = password
      try {
        // Try to decode first (in case it's already encoded)
        const decoded = decodeURIComponent(password)
        encodedPassword = encodeURIComponent(decoded)
      } catch {
        // If decode fails, encode as-is
        encodedPassword = encodeURIComponent(password)
      }
      
      // Reconstruct URL
      const portPart = port ? `:${port}` : ''
      const pathPart = path || '/postgres'
      const reconstructed = `postgresql://${username}:${encodedPassword}@${host}${portPart}${pathPart}`
      
      console.log('[Prisma] Reconstructed URL using regex')
      return reconstructed
    }
    
    // If all else fails, return original (might work anyway)
    console.warn('[Prisma] Could not parse URL, returning original')
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
  console.log('[Prisma] Username from URL:', fixedUrl.match(/postgresql:\/\/([^:]+):/)?.[1] || 'not found')
  console.log('[Prisma] Host from URL:', fixedUrl.match(/@([^:]+)/)?.[1] || 'not found')
  console.log('[Prisma] Port from URL:', fixedUrl.match(/:(\d+)\//)?.[1] || 'not found')
  
  // Set the fixed URL for Prisma (it reads from process.env.DATABASE_URL)
  const originalEnvUrl = process.env.DATABASE_URL
  process.env.DATABASE_URL = fixedUrl
  
  // Try to create PrismaClient - use multiple fallback strategies
  let prisma: PrismaClient
  let lastError: Error | null = null
  
  // Strategy 0: Try with ORIGINAL URL directly (no processing at all)
  // Sometimes the simplest approach works - use URL exactly as Vercel provides it
  try {
    console.log('[Prisma] Strategy 0: Using ORIGINAL process.env.DATABASE_URL (no processing)')
    
    // Use the original URL directly - don't process it at all
    const originalEnvUrl = process.env.DATABASE_URL
    
    // Create client without explicit datasource - Prisma will read from env
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    console.log('[Prisma] ✅ Strategy 0 succeeded! Client created with original URL')
  } catch (error0: unknown) {
    lastError = error0 instanceof Error ? error0 : new Error(String(error0))
    const errorMessage0 = lastError.message
    
    console.warn('[Prisma] ❌ Strategy 0 failed:', errorMessage0)
    
    // Strategy 0.5: Try with fixed URL in environment (minimal processing)
    try {
      console.log('[Prisma] Strategy 0.5: Using fixed URL in environment (minimal processing)')
      
      const originalEnvUrl = process.env.DATABASE_URL
      process.env.DATABASE_URL = fixedUrl
      
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
      
      process.env.DATABASE_URL = originalEnvUrl
      
      console.log('[Prisma] ✅ Strategy 0.5 succeeded!')
    } catch (error05: unknown) {
      lastError = error05 instanceof Error ? error05 : new Error(String(error05))
      const errorMessage05 = lastError.message
      
      console.warn('[Prisma] ❌ Strategy 0.5 failed:', errorMessage05)
    
    // Strategy 1: Try with fixed URL as-is
    try {
      // Log what we're about to try
      console.log('[Prisma] Strategy 1: Attempting with fixed URL (explicit datasource)')
      console.log('[Prisma] URL format check:', {
        startsWithPostgresql: fixedUrl.startsWith('postgresql://'),
        hasUsername: fixedUrl.includes('@') && fixedUrl.split('@')[0].includes(':'),
        hasHost: fixedUrl.includes('@') && fixedUrl.split('@')[1].includes('/'),
        length: fixedUrl.length,
      })
      
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
          db: {
            url: fixedUrl,
          },
        },
      })
      console.log('[Prisma] ✅ Strategy 1 succeeded! Client created successfully')
    } catch (error1: unknown) {
      lastError = error1 instanceof Error ? error1 : new Error(String(error1))
      const errorMessage = lastError.message
      
      console.warn('[Prisma] ❌ Strategy 1 failed:', errorMessage)
      console.warn('[Prisma] Error type:', lastError.constructor.name)
      
      // Strategy 2: Reconstruct URL with fully encoded password
      if (errorMessage.includes('pattern') || errorMessage.includes('expected') || errorMessage.includes('string')) {
        try {
          console.warn('[Prisma] Attempting Strategy 2: Full URL reconstruction...')
          
          // Parse URL components
          const urlMatch = fixedUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/)
          
          if (urlMatch) {
            let [, username, password, host, port, path] = urlMatch
            
            // Decode then re-encode password to ensure proper encoding
            try {
              password = decodeURIComponent(password)
            } catch {
              // If decode fails, password might already be raw, use as-is
            }
            
            // Fully encode password
            const fullyEncodedPassword = encodeURIComponent(password)
            
            // Reconstruct URL
            const reconstructedUrl = `postgresql://${username}:${fullyEncodedPassword}@${host}${port ? `:${port}` : ''}${path || '/postgres'}`
            
            console.log('[Prisma] Strategy 2 - Reconstructed URL:', reconstructedUrl.replace(/:([^:@]+)@/, ':****@'))
            
            prisma = new PrismaClient({
              log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
              datasources: {
                db: {
                  url: reconstructedUrl,
                },
              },
            })
            
            fixedUrl = reconstructedUrl
            console.log('[Prisma] ✅ Strategy 2 succeeded!')
          } else {
            throw new Error('Could not parse URL components')
          }
        } catch (error2: unknown) {
          lastError = error2 instanceof Error ? error2 : new Error(String(error2))
          console.warn('[Prisma] Strategy 2 failed:', lastError.message)
          
          // Strategy 3: Use environment variable directly (let Prisma handle it)
          try {
            console.warn('[Prisma] Attempting Strategy 3: Using process.env.DATABASE_URL directly...')
            
            // Set the fixed URL in environment temporarily
            const tempEnvUrl = process.env.DATABASE_URL
            process.env.DATABASE_URL = fixedUrl
            
            // Create client without explicit datasource (uses env var)
            prisma = new PrismaClient({
              log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            })
            
            // Restore original URL after successful creation
            process.env.DATABASE_URL = tempEnvUrl || originalUrl
            
            console.log('[Prisma] ✅ Strategy 3 succeeded!')
          } catch (error3: unknown) {
            // Restore original URL
            process.env.DATABASE_URL = originalUrl
            
            lastError = error3 instanceof Error ? error3 : new Error(String(error3))
            console.error('[Prisma] ❌ All strategies failed!')
            console.error('[Prisma] Strategy 0 error:', errorMessage0)
            console.error('[Prisma] Strategy 1 error:', errorMessage)
            console.error('[Prisma] Strategy 2 error:', lastError.message)
            console.error('[Prisma] Strategy 3 error:', lastError.message)
            console.error('[Prisma] Original URL (first 100 chars):', process.env.DATABASE_URL?.substring(0, 100))
            console.error('[Prisma] Fixed URL (first 100 chars):', fixedUrl.substring(0, 100))
            
            throw new Error(
              `DATABASE_URL validation failed after all strategies. ` +
              `Please check your Vercel environment variables. ` +
              `URL format: ${urlForLogging} ` +
              `Errors: Strategy0=${errorMessage0}, Strategy1=${errorMessage}, Strategy2=${lastError.message}, Strategy3=${lastError.message}`
            )
          }
        }
      } else {
        // Not a pattern error, restore and throw original
        process.env.DATABASE_URL = originalUrl
        throw lastError
      }
    }
  }
  
  // Restore original URL after successful creation (if not already restored)
  if (process.env.DATABASE_URL !== originalUrl) {
    process.env.DATABASE_URL = originalUrl
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }

  return prisma
}

// Create a proxy that ensures PrismaClient is created with correct URL
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    try {
      const client = getPrismaClient()
      return (client as any)[prop]
    } catch (error: any) {
      const errorMessage = error.message || String(error)
      
      // If it's a pattern error during client creation, provide helpful message
      if (errorMessage.includes('pattern') || errorMessage.includes('expected')) {
        console.error('[Prisma Proxy] Pattern error during client access:', errorMessage)
        throw new Error(
          `Database connection error: The database URL format is invalid. ` +
          `Please check your Vercel environment variables. ` +
          `Error: ${errorMessage}`
        )
      }
      
      // Re-throw other errors
      throw error
    }
  },
})

