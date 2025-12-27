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

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
