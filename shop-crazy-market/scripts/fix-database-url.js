// Script to fix DATABASE_URL encoding before Prisma runs
// This automatically encodes # as %23 in the password
// This script modifies process.env which persists in the same Node process

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  
  // Check if password contains unencoded #
  // Pattern: postgresql://user:password#@host
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = url.match(urlPattern);
  
  if (match) {
    const [, prefix, password, suffix] = match;
    
    // If password has # but not %23, encode it
    if (password.includes('#') && !password.includes('%23')) {
      const encodedPassword = password.replace(/#/g, '%23');
      const fixedUrl = `${prefix}${encodedPassword}${suffix}`;
      // Update the environment variable so Prisma can read it
      process.env.DATABASE_URL = fixedUrl;
      console.log('✅ Fixed DATABASE_URL encoding (encoded # as %23)');
      console.log('   Original:', url.substring(0, 50) + '...');
      console.log('   Fixed:   ', fixedUrl.substring(0, 50) + '...');
    } else {
      console.log('✅ DATABASE_URL encoding is correct');
    }
  } else {
    console.log('⚠️  Could not parse DATABASE_URL format');
  }
} else {
  console.log('⚠️  DATABASE_URL not set');
}

// The environment variable is now fixed in process.env
// Prisma will read it from process.env when it runs

