/** @type {import('next').NextConfig} */
// Fix DATABASE_URL encoding and format before Prisma runs
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  
  // Check if pgbouncer parameter exists before cleaning
  const hasPgbouncer = url.includes('pgbouncer=true');
  
  // Step 1: Remove query parameters and hash fragments (but we'll add pgbouncer back if needed)
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
  
  // Step 5: Add pgbouncer=true if it was present or if we're using pooler
  if (hasPgbouncer || url.includes('pooler.supabase.com')) {
    url = `${url}?pgbouncer=true`;
  }
  
  // Step 6: Update the environment variable
  if (url !== process.env.DATABASE_URL) {
    process.env.DATABASE_URL = url;
    console.log('✅ Fixed DATABASE_URL in next.config.js (removed query params, encoded special chars, added pgbouncer)');
  }
}

const { withSentryConfig } = require("@sentry/nextjs");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable PWA in development
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors https://admin.shopify.com https://*.myshopify.com;",
          },
        ],
      },
    ];
  },
}

// Only add Sentry if DSN is configured
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only upload source maps in production
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

// Export the config with PWA and Sentry if DSN is available
let config = withPWA(nextConfig);
config = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  ? withSentryConfig(config, sentryWebpackPluginOptions)
  : config;
// Force fresh deployment - cache cleared
// DEPLOY: ${new Date().toISOString()}
module.exports = config;

