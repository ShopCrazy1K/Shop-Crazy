#!/bin/bash
# Fix DATABASE_URL encoding before Prisma runs
# Automatically encodes # as %23 in password

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set"
  exit 0
fi

# Check if password contains unencoded #
if [[ "$DATABASE_URL" == *"#"* ]] && [[ "$DATABASE_URL" != *"%23"* ]]; then
  # Extract parts of the URL
  # Pattern: postgresql://user:password#@host:port/db
  if [[ "$DATABASE_URL" =~ ^(postgresql://[^:]+:)([^@]+)(@.+)$ ]]; then
    PREFIX="${BASH_REMATCH[1]}"
    PASSWORD="${BASH_REMATCH[2]}"
    SUFFIX="${BASH_REMATCH[3]}"
    
    # Encode # as %23
    ENCODED_PASSWORD="${PASSWORD//#/%23}"
    FIXED_URL="${PREFIX}${ENCODED_PASSWORD}${SUFFIX}"
    
    # Export the fixed URL
    export DATABASE_URL="$FIXED_URL"
    echo "✅ Fixed DATABASE_URL encoding (encoded # as %23)"
  else
    echo "⚠️  Could not parse DATABASE_URL format"
  fi
else
  echo "✅ DATABASE_URL encoding is correct"
fi

