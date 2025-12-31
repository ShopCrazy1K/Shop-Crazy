const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/logo.png');
const ICONS_DIR = path.join(__dirname, '../public/icons');
const SPLASH_DIR = path.join(__dirname, '../public/splash');

// Ensure directories exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}
if (!fs.existsSync(SPLASH_DIR)) {
  fs.mkdirSync(SPLASH_DIR, { recursive: true });
}

// Icon sizes for iOS and Android
const iconSizes = [
  57, 60, 72, 76, 96, 114, 120, 128, 144, 152, 180, 192, 384, 512
];

// Splash screen sizes: [width, height, filename]
// iOS and Android splash screens
const splashSizes = [
  // iPhone sizes
  [750, 1334, 'iphone-6-7-8.png'],           // iPhone 6/7/8
  [1242, 2208, 'iphone-6-7-8-plus.png'],     // iPhone 6/7/8 Plus
  [1125, 2436, 'iphone-x-xs.png'],           // iPhone X/XS
  [828, 1792, 'iphone-xr.png'],              // iPhone XR
  [1242, 2688, 'iphone-xs-max.png'],         // iPhone XS Max
  [1170, 2532, 'iphone-12-13.png'],          // iPhone 12/13
  [1284, 2778, 'iphone-12-13-pro-max.png'],  // iPhone 12/13 Pro Max
  [1290, 2796, 'iphone-14-pro-max.png'],     // iPhone 14 Pro Max
  // iPad sizes
  [1536, 2048, 'ipad.png'],                  // iPad
  [2048, 2732, 'ipad-pro.png'],              // iPad Pro
  // Android sizes (common)
  [1080, 1920, 'android-1080x1920.png'],     // Android standard
  [1440, 2560, 'android-1440x2560.png'],     // Android high-res
];

async function generateIcons() {
  console.log('🖼️  Generating app icons from logo...');
  
  if (!fs.existsSync(LOGO_PATH)) {
    console.error('❌ Logo not found at:', LOGO_PATH);
    process.exit(1);
  }

  // Generate icons
  for (const size of iconSizes) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    try {
      await sharp(LOGO_PATH)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating icon-${size}x${size}.png:`, error.message);
    }
  }
  
  console.log('✅ All icons generated successfully!');
}

async function generateSplashScreens() {
  console.log('\n🎨 Generating splash screens...');
  
  if (!fs.existsSync(LOGO_PATH)) {
    console.error('❌ Logo not found at:', LOGO_PATH);
    process.exit(1);
  }

  // Get logo dimensions to calculate scaling
  const logoMetadata = await sharp(LOGO_PATH).metadata();
  const logoAspectRatio = logoMetadata.width / logoMetadata.height;

  for (const [width, height, filename] of splashSizes) {
    const outputPath = path.join(SPLASH_DIR, filename);
    try {
      // Create a canvas with the splash screen size
      // Use a gradient background (purple theme matching the app)
      const canvas = sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: { r: 147, g: 51, b: 234, alpha: 1 } // Purple theme color #9333ea
        }
      });

      // Calculate logo size to fit nicely (80% of the smaller dimension)
      const maxLogoSize = Math.min(width, height) * 0.8;
      const logoWidth = Math.round(maxLogoSize);
      const logoHeight = Math.round(maxLogoSize / logoAspectRatio);

      // Center position
      const x = Math.round((width - logoWidth) / 2);
      const y = Math.round((height - logoHeight) / 2);

      // Composite the logo onto the canvas
      await canvas
        .composite([
          {
            input: await sharp(LOGO_PATH)
              .resize(logoWidth, logoHeight, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
              })
              .toBuffer(),
            left: x,
            top: y,
          }
        ])
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${filename} (${width}x${height})`);
    } catch (error) {
      console.error(`❌ Error generating ${filename}:`, error.message);
    }
  }
  
  console.log('✅ All splash screens generated successfully!');
}

async function main() {
  try {
    await generateIcons();
    await generateSplashScreens();
    console.log('\n🎉 All icons and splash screens generated successfully!');
    console.log(`📁 Icons saved to: ${ICONS_DIR}`);
    console.log(`📁 Splash screens saved to: ${SPLASH_DIR}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

