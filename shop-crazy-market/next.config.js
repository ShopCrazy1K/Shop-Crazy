/** @type {import('next').NextConfig} */
// Fix DATABASE_URL encoding and format before Prisma runs
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  
  // Step 1: Remove query parameters and hash fragments (Prisma doesn't accept these)
  url = url.split('?')[0].split('#')[0];
  
  // Step 2: Remove surrounding quotes and whitespace
  url = url.trim().replace(/^["']|["']$/g, '');
  
  // Step 3: Ensure it starts with postgresql:// (not postgres://)
  if (url.startsWith('postgres://')) {
    url = url.replace('postgres://', 'postgresql://');
  }
  
  // Step 4: Check if password contains unencoded special characters
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = url.match(urlPattern);
  if (match) {
    const [, prefix, password, suffix] = match;
    let needsEncoding = false;
    let encodedPassword = password;
    
    // Encode special characters if not already encoded
    const specialChars = {
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
      url = `${prefix}${encodedPassword}${suffix}`;
    }
  }
  
  // Step 5: Update the environment variable
  if (url !== process.env.DATABASE_URL) {
    process.env.DATABASE_URL = url;
    console.log('✅ Fixed DATABASE_URL in next.config.js (removed query params, encoded special chars)');
  }
}

const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig

