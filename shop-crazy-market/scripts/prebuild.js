#!/usr/bin/env node
// Pre-build script to fix DATABASE_URL encoding
// This runs before Prisma generate (via npm prebuild hook)

const fs = require('fs');
const path = require('path');

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  
  // Check if password contains unencoded #
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = url.match(urlPattern);
  
  if (match) {
    const [, prefix, password, suffix] = match;
    
    // If password has # but not %23, encode it
    if (password.includes('#') && !password.includes('%23')) {
      const encodedPassword = password.replace(/#/g, '%23');
      const fixedUrl = `${prefix}${encodedPassword}${suffix}`;
      
      // Update process.env for this process
      process.env.DATABASE_URL = fixedUrl;
      
      // Also write to .env.local so Prisma can read it
      const envPath = path.join(process.cwd(), '.env.local');
      const envContent = `DATABASE_URL="${fixedUrl}"\n`;
      fs.writeFileSync(envPath, envContent, 'utf8');
      
      console.log('✅ Fixed DATABASE_URL encoding (encoded # as %23)');
      console.log('   Written to .env.local for Prisma');
    } else {
      console.log('✅ DATABASE_URL encoding is correct');
    }
  }
} else {
  console.log('⚠️  DATABASE_URL not set');
}

