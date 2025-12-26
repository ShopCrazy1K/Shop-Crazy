import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Clean and normalize DATABASE_URL to ensure it matches Prisma's expected format
 */
function cleanDatabaseUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url
  }
  
  // Step 1: Trim whitespace
  let cleaned = url.trim()
  
  // Step 2: Remove quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '')
  
  // Step 3: Remove any newlines or carriage returns
  cleaned = cleaned.replace(/[\r\n]/g, '')
  
  // Step 4: Fix protocol (postgres:// -> postgresql://)
  if (cleaned.startsWith('postgres://')) {
    cleaned = cleaned.replace('postgres://', 'postgresql://')
  }
  
  // Step 5: Ensure it starts with postgresql://
  if (!cleaned.startsWith('postgresql://')) {
    throw new Error(`DATABASE_URL must start with postgresql://, got: ${cleaned.substring(0, 20)}...`)
  }
  
  // Step 6: Parse and reconstruct to ensure proper encoding
  try {
    const urlObj = new URL(cleaned)
    
    // Reconstruct with proper encoding
    const username = urlObj.username || 'postgres'
    const password = urlObj.password || ''
    const hostname = urlObj.hostname || ''
    const port = urlObj.port || '5432'
    const pathname = urlObj.pathname || '/postgres'
    
    // Ensure password is properly encoded
    let encodedPassword = password
    try {
      // First, decode if already encoded to avoid double encoding
      let decodedPassword = password
      if (password.includes('%')) {
        try {
          decodedPassword = decodeURIComponent(password)
        } catch {
          // If decode fails, assume it's not properly encoded
          decodedPassword = password
        }
      }
      
      // Now encode special characters that need encoding
      // Characters that MUST be encoded: # $ % & + , / : ; = ? @ [ ]
      // We'll encode all special characters to be safe
      if (decodedPassword && /[#\$%&+\/:;=?@\[\] ]/.test(decodedPassword)) {
        // Encode each special character individually to avoid issues
        encodedPassword = decodedPassword
          .replace(/\$/g, '%24')  // $ -> %24
          .replace(/#/g, '%23')    // # -> %23
          .replace(/@/g, '%40')    // @ -> %40
          .replace(/%/g, '%25')    // % -> %25
          .replace(/&/g, '%26')    // & -> %26
          .replace(/\+/g, '%2B')    // + -> %2B
          .replace(/:/g, '%3A')    // : -> %3A
          .replace(/;/g, '%3B')    // ; -> %3B
          .replace(/=/g, '%3D')    // = -> %3D
          .replace(/\?/g, '%3F')   // ? -> %3F
          .replace(/\[/g, '%5B')   // [ -> %5B
          .replace(/\]/g, '%5D')   // ] -> %5D
          .replace(/ /g, '%20')    // space -> %20
      } else {
        // No special chars, use as-is
        encodedPassword = decodedPassword
      }
    } catch {
      // If encoding fails, use original
      encodedPassword = password
    }
    
    // Ensure pathname starts with /
    const dbPath = pathname.startsWith('/') ? pathname : `/${pathname}`
    
    // Reconstruct URL with properly encoded password and clean path
    // Remove any query params or hash (Prisma doesn't like them)
    cleaned = `postgresql://${username}:${encodedPassword}@${hostname}:${port}${dbPath}`
    
  } catch (parseError) {
    // If URL parsing fails, try regex-based approach
    const pattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/
    const match = cleaned.match(pattern)
    
    if (match) {
      let [, username, password, host, port, path] = match
      
      // Encode password if needed
      if (password && !password.includes('%')) {
        try {
          password = encodeURIComponent(password)
        } catch {
          // Keep original if encoding fails
        }
      }
      
      port = port || '5432'
      path = path || '/postgres'
      
      cleaned = `postgresql://${username}:${password}@${host}:${port}${path}`
    }
  }
  
  return cleaned
}

/**
 * Build a PostgreSQL connection string from components
 * This ensures perfect format that Prisma will accept
 */
function buildConnectionString(
  username: string,
  password: string,
  host: string,
  port: string,
  database: string
): string {
  // Encode username and password to handle special characters
  const encodedUsername = encodeURIComponent(username)
  const encodedPassword = encodeURIComponent(password)
  
  // Build the connection string
  return `postgresql://${encodedUsername}:${encodedPassword}@${host}:${port}${database.startsWith('/') ? database : '/' + database}`
}

/**
 * Prisma Client with robust error handling and URL cleaning
 * Uses multiple fallback strategies to handle URL issues
 */
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set.')
  }

  const originalUrl = process.env.DATABASE_URL
  console.log('[Prisma] Original DATABASE_URL length:', originalUrl.length)
  console.log('[Prisma] Original DATABASE_URL (first 50):', originalUrl.substring(0, 50) + '...')
  
  // Strategy 1: Try cleaned URL
  let cleanedUrl: string
  try {
    cleanedUrl = cleanDatabaseUrl(originalUrl)
    console.log('[Prisma] Strategy 1: Cleaned URL length:', cleanedUrl.length)
    console.log('[Prisma] Strategy 1: Cleaned URL (first 50):', cleanedUrl.substring(0, 50) + '...')
  } catch (cleanError: any) {
    console.error('[Prisma] Strategy 1 failed:', cleanError.message)
    cleanedUrl = originalUrl // Fallback to original
  }
  
  // Strategy 2: Try rebuilding from parsed components
  let rebuiltUrl: string | null = null
  try {
    const urlObj = new URL(cleanedUrl)
    rebuiltUrl = buildConnectionString(
      urlObj.username || 'postgres',
      urlObj.password || '',
      urlObj.hostname || '',
      urlObj.port || '5432',
      urlObj.pathname || '/postgres'
    )
    console.log('[Prisma] Strategy 2: Rebuilt URL from components')
    console.log('[Prisma] Strategy 2: Rebuilt URL (first 50):', rebuiltUrl.substring(0, 50) + '...')
  } catch (rebuildError: any) {
    console.error('[Prisma] Strategy 2 failed:', rebuildError.message)
  }
  
  // Try URLs in order: rebuilt > cleaned > original
  const urlsToTry = [
    { url: rebuiltUrl, name: 'rebuilt' },
    { url: cleanedUrl, name: 'cleaned' },
    { url: originalUrl, name: 'original' }
  ].filter(item => item.url !== null) as Array<{ url: string; name: string }>
  
  let lastError: Error | null = null
  
  for (const { url, name } of urlsToTry) {
    try {
      console.log(`[Prisma] Trying ${name} URL...`)
      
      // Validate pattern
      const prismaPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/
      const matches = url.match(prismaPattern)
      
      if (!matches) {
        console.error(`[Prisma] ${name} URL does not match pattern`)
        continue
      }
      
      console.log(`[Prisma] ${name} URL matches pattern`)
      console.log(`[Prisma] ${name} URL components:`, {
        username: matches[1],
        passwordLength: matches[2].length,
        host: matches[3],
        port: matches[4] || 'default',
        database: matches[5] || '/postgres',
      })
      
      // Try to create PrismaClient
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: url,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
      
      console.log(`[Prisma] ✅ PrismaClient created successfully using ${name} URL`)
      
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prisma
      }
      
      return prisma
    } catch (error: any) {
      const errorMsg = error.message || String(error)
      console.error(`[Prisma] ❌ Failed with ${name} URL:`, errorMsg)
      lastError = error
      
      // If it's not a pattern error, this might be a connection error (which is progress!)
      if (!errorMsg.includes('pattern') && !errorMsg.includes('expected') && !errorMsg.includes('string did not match')) {
        console.log(`[Prisma] ${name} URL passed validation but connection failed - this is progress!`)
        // Still try other URLs, but this is a good sign
      }
    }
  }
  
  // All strategies failed
  console.error('[Prisma] ❌ All URL strategies failed')
  console.error('[Prisma] Original URL:', originalUrl.substring(0, 100))
  console.error('[Prisma] Cleaned URL:', cleanedUrl.substring(0, 100))
  console.error('[Prisma] Rebuilt URL:', rebuiltUrl?.substring(0, 100) || 'N/A')
  
  if (lastError) {
    const errorMsg = lastError.message || String(lastError)
    throw new Error(
      `DATABASE_URL validation failed after trying all strategies: ${errorMsg}. ` +
      `Original URL: ${originalUrl.substring(0, 80)}... ` +
      `Please check your Vercel environment variables. ` +
      `Visit /api/debug-database-url for detailed analysis. ` +
      `Visit /api/test-prisma-connection for step-by-step testing.`
    )
  }
  
  throw new Error('Failed to create PrismaClient: All URL strategies failed')
}

// Export prisma client - created lazily on first access
export const prisma = getPrismaClient()
