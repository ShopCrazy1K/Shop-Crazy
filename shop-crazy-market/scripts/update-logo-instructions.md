# How to Update Your Logo

## Quick Steps:

1. **Save your colorful "Shop CRAZY Market" logo** as a PNG file
   - Recommended: At least 512x512 pixels
   - Format: PNG with transparent background (or your dark background)
   - Name it: `logo.png`

2. **Replace the existing logo file:**
   ```bash
   # Copy your new logo.png to:
   cp /path/to/your/logo.png public/logo.png
   ```
   
   Or manually:
   - Navigate to: `/Users/ronhart/social-app/shop-crazy-market/public/`
   - Replace the existing `logo.png` with your new one

3. **Regenerate all favicon files:**
   ```bash
   node scripts/generate-favicon.js
   ```

4. **Copy favicons to app directory:**
   ```bash
   cp public/favicon.ico app/favicon.ico
   cp public/favicon-32x32.png app/icon.png
   cp public/apple-touch-icon.png app/apple-icon.png
   ```

5. **Clear browser cache and hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)

## File Location:
- Logo source: `public/logo.png`
- Generated favicons: `public/favicon-*.png`
- App favicons: `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`
