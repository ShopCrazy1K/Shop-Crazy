// Setup script that fixes DATABASE_URL and writes to .env.local
// This is called by postinstall to ensure Prisma has the correct URL

const fs = require('fs');
const path = require('path');

function fixDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set - skipping fix');
    return false;
  }

  const url = process.env.DATABASE_URL;
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = url.match(urlPattern);

  if (match) {
    const [, prefix, password, suffix] = match;

    // If password has # but not %23, encode it
    if (password.includes('#') && !password.includes('%23')) {
      const encodedPassword = password.replace(/#/g, '%23');
      const fixedUrl = `${prefix}${encodedPassword}${suffix}`;

      // Write to .env.local so Prisma can read it
      const envPath = path.join(process.cwd(), '.env.local');
      fs.writeFileSync(envPath, `DATABASE_URL="${fixedUrl}"\n`, 'utf8');

      // Also update process.env
      process.env.DATABASE_URL = fixedUrl;

      console.log('✅ Fixed DATABASE_URL encoding (encoded # as %23)');
      console.log('   Written to .env.local');
      return true;
    } else {
      // Still write to .env.local even if already correct
      const envPath = path.join(process.cwd(), '.env.local');
      fs.writeFileSync(envPath, `DATABASE_URL="${url}"\n`, 'utf8');
      console.log('✅ DATABASE_URL encoding is correct');
      return true;
    }
  }
  return false;
}

// Run fix, but don't exit on error (for postinstall)
try {
  fixDatabaseUrl();
} catch (error) {
  console.error('Error fixing DATABASE_URL:', error.message);
  // Don't exit - let the build continue
}

