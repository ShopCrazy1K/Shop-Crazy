import { PrismaClient } from "@prisma/client";

// Clean DATABASE_URL before Prisma uses it (runtime cleaning)
function cleanDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  
  // Remove query parameters and hash fragments
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
  
  return cleaned;
}

// Clean DATABASE_URL at runtime
if (process.env.DATABASE_URL) {
  const cleaned = cleanDatabaseUrl(process.env.DATABASE_URL);
  if (cleaned && cleaned !== process.env.DATABASE_URL) {
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
