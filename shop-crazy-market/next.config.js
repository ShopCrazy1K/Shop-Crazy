/** @type {import('next').NextConfig} */
// Fix DATABASE_URL encoding before Prisma runs
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  // Check if password contains unencoded special characters
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = url.match(urlPattern);
  if (match) {
    const [, prefix, password, suffix] = match;
    let needsEncoding = false;
    let encodedPassword = password;
    
    // Encode # if not already encoded
    if (password.includes('#') && !password.includes('%23')) {
      encodedPassword = encodedPassword.replace(/#/g, '%23');
      needsEncoding = true;
    }
    
    // Encode $ if not already encoded
    if (password.includes('$') && !password.includes('%24')) {
      encodedPassword = encodedPassword.replace(/\$/g, '%24');
      needsEncoding = true;
    }
    
    if (needsEncoding) {
      const fixedUrl = `${prefix}${encodedPassword}${suffix}`;
      process.env.DATABASE_URL = fixedUrl;
      console.log('✅ Fixed DATABASE_URL encoding in next.config.js (special chars)');
    }
  }
}

const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig

