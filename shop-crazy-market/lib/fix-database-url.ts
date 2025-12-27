// Utility to fix DATABASE_URL encoding issues
// This ensures # characters in passwords are properly encoded as %23

export function fixDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  // Check if password contains unencoded #
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = url.match(urlPattern);

  if (match) {
    const [, prefix, password, suffix] = match;

    // If password has # but not %23, encode it
    if (password.includes('#') && !password.includes('%23')) {
      const encodedPassword = password.replace(/#/g, '%23');
      return `${prefix}${encodedPassword}${suffix}`;
    }
  }

  return url;
}

// Fix DATABASE_URL on module load (only if it exists)
// This runs at module load time, so we wrap it in try-catch to avoid breaking builds
if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
  try {
    const fixed = fixDatabaseUrl(process.env.DATABASE_URL);
    if (fixed !== process.env.DATABASE_URL) {
      process.env.DATABASE_URL = fixed;
      console.log('✅ Fixed DATABASE_URL encoding (encoded # as %23)');
    }
  } catch (error) {
    // Don't throw during module load - just log
    console.error('Error fixing DATABASE_URL:', error);
  }
}

