const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public');

// Favicon sizes needed
const faviconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // Apple touch icon
];

// ICO format for favicon.ico (16x16, 32x32, 48x48)
const icoSizes = [16, 32, 48];

async function generateFavicons() {
  try {
    console.log('🎨 Generating favicon files from logo.png...');

    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ logo.png not found at:', logoPath);
      process.exit(1);
    }

    // Generate PNG favicons with optimized settings for colorful logos
    for (const { size, name } of faviconSizes) {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
          kernel: sharp.kernel.lanczos3, // Better quality for small sizes
        })
        .png({
          quality: 100,
          compressionLevel: 9,
          adaptiveFiltering: true,
        })
        .toFile(path.join(outputDir, name));
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (multi-size ICO file)
    // Note: sharp doesn't support ICO directly, so we'll create a 32x32 PNG and rename it
    // Most browsers will accept a PNG as favicon.ico
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3, // Better quality for small sizes
      })
      .png({
        quality: 100,
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('✅ Generated favicon.ico (32x32 PNG format)');

    // Generate site.webmanifest entry
    const manifest = {
      name: 'Shop Crazy Market',
      short_name: 'Shop Crazy',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: '#9333ea',
      background_color: '#ffffff',
      display: 'standalone',
    };

    fs.writeFileSync(
      path.join(outputDir, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Generated site.webmanifest');

    console.log('\n🎉 All favicon files generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add favicon links to your app/layout.tsx');
    console.log('2. The favicon.ico will be automatically served from /public');
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

