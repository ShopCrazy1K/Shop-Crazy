#!/usr/bin/env node
// Pre-build script to fix DATABASE_URL encoding
// This runs before Prisma generate

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
      
      // Update process.env
      process.env.DATABASE_URL = fixedUrl;
      
      console.log('✅ Fixed DATABASE_URL encoding (encoded # as %23)');
    }
  }
}

// Execute the command with the fixed environment
const { execSync } = require('child_process');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('No command provided');
  process.exit(1);
}

const command = args.join(' ');
try {
  execSync(command, {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
} catch (error) {
  process.exit(error.status || 1);
}

