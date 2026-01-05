import { PrismaClient } from "@prisma/client";

// Clean DATABASE_URL before Prisma uses it (runtime cleaning)
function cleanDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  
  // Check if pgbouncer parameter exists before cleaning
  const hasPgbouncer = url.includes('pgbouncer=true');
  
  // Remove query parameters and hash fragments (but we'll add pgbouncer back)
  let cleaned = url.split('?')[0].split('#')[0];
  
  // Remove surrounding quotes and whitespace
  cleaned = cleaned.trim().replace(/^["']|["']$/g, '');
  
  // Convert postgres:// to postgresql://
  if (cleaned.startsWith('postgres://')) {
    cleaned = cleaned.replace('postgres://', 'postgresql://');
  }
  
  // Encode special characters in password if needed
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = cleaned.match(urlPattern);
  if (match) {
    const [, prefix, password, suffix] = match;
    let encodedPassword = password;
    let needsEncoding = false;
    
    // Encode special characters
    const specialChars: Record<string, string> = {
      '#': '%23',
      '$': '%24',
      '@': '%40',
      '%': '%25',
      '&': '%26',
      '+': '%2B',
      '=': '%3D',
    };
    
    for (const [char, encoded] of Object.entries(specialChars)) {
      if (password.includes(char) && !password.includes(encoded)) {
        encodedPassword = encodedPassword.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), encoded);
        needsEncoding = true;
      }
    }
    
    if (needsEncoding) {
      cleaned = `${prefix}${encodedPassword}${suffix}`;
    }
  }
  
  // Add pgbouncer=true if it was present or if we're using pooler
  if (hasPgbouncer || cleaned.includes('pooler.supabase.com')) {
    const separator = cleaned.includes('?') ? '&' : '?';
    cleaned = `${cleaned}${separator}pgbouncer=true`;
  }
  
  return cleaned;
}

// Clean DATABASE_URL at runtime
if (process.env.DATABASE_URL) {
  const cleaned = cleanDatabaseUrl(process.env.DATABASE_URL);
  if (cleaned) {
    process.env.DATABASE_URL = cleaned;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Create Prisma client with better error handling
let prismaInstance: PrismaClient;

try {
  // Get cleaned DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set. Please configure it in Vercel.");
  }
  
  // Clean the URL if needed (already done in next.config.js, but ensure it's clean here too)
  let cleanedUrl = dbUrl.trim();
  
  // Ensure it starts with postgresql://
  if (cleanedUrl.startsWith('postgres://')) {
    cleanedUrl = cleanedUrl.replace('postgres://', 'postgresql://');
  }
  
  // Add pgbouncer=true if using pooler and not already present
  if (cleanedUrl.includes('pooler.supabase.com') && !cleanedUrl.includes('pgbouncer=true')) {
    const separator = cleanedUrl.includes('?') ? '&' : '?';
    cleanedUrl = `${cleanedUrl}${separator}pgbouncer=true`;
  }
  
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: {
        db: {
          url: cleanedUrl,
        },
      },
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
  
  console.log("[PRISMA] Prisma Client initialized successfully");
  console.log("[PRISMA] DATABASE_URL configured:", !!dbUrl);
  console.log("[PRISMA] Using pooler:", cleanedUrl.includes('pooler'));
  console.log("[PRISMA] Using pgbouncer:", cleanedUrl.includes('pgbouncer=true'));
} catch (error: any) {
  console.error("[PRISMA] Failed to initialize Prisma Client:", error);
  console.error("[PRISMA] Error name:", error.name);
  console.error("[PRISMA] Error message:", error.message);
  console.error("[PRISMA] DATABASE_URL configured:", !!process.env.DATABASE_URL);
  console.error("[PRISMA] DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
  
  // Don't throw - instead create a client that will show errors when used
  // This prevents the app from crashing at startup
  prismaInstance = new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "postgresql://",
      },
    },
  }) as any;
}

export const prisma = prismaInstance;
