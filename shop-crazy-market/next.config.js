/** @type {import('next').NextConfig} */
// Fix DATABASE_URL encoding before Prisma runs
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  // Check if password contains unencoded #
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = url.match(urlPattern);
  if (match) {
    const [, prefix, password, suffix] = match;
    if (password.includes('#') && !password.includes('%23')) {
      const encodedPassword = password.replace(/#/g, '%23');
      const fixedUrl = `${prefix}${encodedPassword}${suffix}`;
      process.env.DATABASE_URL = fixedUrl;
      console.log('✅ Fixed DATABASE_URL encoding in next.config.js');
    }
  }
}

const nextConfig = {
  reactStrictMode: true,
  // Skip static generation for admin routes
  experimental: {
    dynamicIO: true,
  },
}

module.exports = nextConfig

