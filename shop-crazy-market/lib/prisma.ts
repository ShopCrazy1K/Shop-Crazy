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
 * Prisma Client with robust error handling and URL cleaning
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
  
  // Clean the URL
  let cleanedUrl: string
  try {
    cleanedUrl = cleanDatabaseUrl(originalUrl)
    console.log('[Prisma] Cleaned DATABASE_URL length:', cleanedUrl.length)
    console.log('[Prisma] Cleaned DATABASE_URL (first 50):', cleanedUrl.substring(0, 50) + '...')
    
    if (cleanedUrl !== originalUrl) {
      console.log('[Prisma] ⚠️ URL was modified during cleaning')
    }
  } catch (cleanError: any) {
    console.error('[Prisma] ❌ Failed to clean URL:', cleanError.message)
    throw new Error(`Failed to clean DATABASE_URL: ${cleanError.message}`)
  }
  
  // Validate pattern BEFORE creating PrismaClient
  const prismaPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?(\/.*)?$/
  const matches = cleanedUrl.match(prismaPattern)
  
  if (!matches) {
    console.error('[Prisma] ❌ Cleaned URL does not match Prisma pattern!')
    console.error('[Prisma] Cleaned URL:', cleanedUrl.substring(0, 100))
    console.error('[Prisma] Pattern check:', {
      startsWithPostgresql: cleanedUrl.startsWith('postgresql://'),
      hasUsername: cleanedUrl.includes('://') && cleanedUrl.split('://')[1].includes(':'),
      hasPassword: cleanedUrl.includes(':') && cleanedUrl.includes('@'),
      hasHost: cleanedUrl.includes('@'),
      hasPort: /:\d+\//.test(cleanedUrl),
      hasDatabase: cleanedUrl.includes('/') && cleanedUrl.split('/').length > 1,
    })
    
    throw new Error(
      `DATABASE_URL format is invalid after cleaning. ` +
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
  
  // Set cleaned URL in environment temporarily
  const originalEnvUrl = process.env.DATABASE_URL
  process.env.DATABASE_URL = cleanedUrl
  
  try {
    console.log('[Prisma] Creating PrismaClient instance...')
    
    // Create PrismaClient - it will read from process.env.DATABASE_URL
    const prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    console.log('[Prisma] ✅ PrismaClient created successfully')
    
    // Restore original URL
    process.env.DATABASE_URL = originalEnvUrl
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
    
    return prisma
  } catch (error: any) {
    // Restore original URL on error
    process.env.DATABASE_URL = originalEnvUrl
    
    const errorMsg = error.message || String(error)
    console.error('[Prisma] ❌ Failed to create PrismaClient:', errorMsg)
    console.error('[Prisma] Error type:', error.constructor?.name)
    console.error('[Prisma] Error code:', error.code)
    console.error('[Prisma] Cleaned URL used:', cleanedUrl.substring(0, 100))
    
    // If it's a pattern error, provide detailed help
    if (errorMsg.includes('pattern') || errorMsg.includes('expected') || errorMsg.includes('string did not match')) {
      console.error('[Prisma] ⚠️ PATTERN VALIDATION ERROR')
      console.error('[Prisma] Original URL:', originalUrl.substring(0, 100))
      console.error('[Prisma] Cleaned URL:', cleanedUrl.substring(0, 100))
      console.error('[Prisma] Pattern match (before Prisma):', matches ? 'YES' : 'NO')
      
      // Double-check pattern match
      const finalMatch = cleanedUrl.match(prismaPattern)
      console.error('[Prisma] Final pattern check:', finalMatch ? 'MATCHES' : 'DOES NOT MATCH')
      
      throw new Error(
        `DATABASE_URL validation failed: ${errorMsg}. ` +
        `Original URL: ${originalUrl.substring(0, 80)}... ` +
        `Cleaned URL: ${cleanedUrl.substring(0, 80)}... ` +
        `Pattern match: ${matches ? 'YES' : 'NO'}. ` +
        `This error occurs when PrismaClient is created. ` +
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
