# How to Generate ENCRYPTION_KEY

## Method 1: Using Node.js (Recommended)

### If you have Node.js installed:

1. Open your terminal/command prompt
2. Run this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Copy the output** - it will be a long string of 64 hex characters (letters and numbers)
   - Example: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`
4. Use this as your `ENCRYPTION_KEY` in Vercel

### If you're already in the project directory:

```bash
cd /Users/ronhart/social-app/shop-crazy-market
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Method 2: Using Online Generator

1. Go to: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
2. Select:
   - **Encryption key**: 256 bits
   - **Character set**: Hexadecimal (0-9, A-F)
3. Click "Generate"
4. **Copy the generated key** (should be 64 characters long)
5. Use this as your `ENCRYPTION_KEY` in Vercel

## Method 3: Using Python

If you have Python installed:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Method 4: Using OpenSSL

If you have OpenSSL installed:

```bash
openssl rand -hex 32
```

## What the Key Should Look Like

- **Length**: Exactly 64 characters
- **Format**: Hexadecimal (only contains 0-9 and a-f)
- **Example**: `3f7a9b2e1c4d8e6f0a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f`

## Important Notes

⚠️ **Keep this key secret and secure!**
- Don't share it publicly
- Don't commit it to Git
- Only add it to Vercel environment variables

⚠️ **Don't change the key later!**
- If you change the key after creating connections, you won't be able to decrypt existing tokens
- Only generate a new key if you're starting fresh

## Quick Test

After generating a key, verify it's the right format:
- Should be 64 characters long
- Should only contain: 0-9, a-f, A-F
- No spaces or special characters
