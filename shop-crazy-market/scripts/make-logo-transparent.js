const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/logo.png');
const OUTPUT_PATH = path.join(__dirname, '../public/logo-transparent.png');

async function makeLogoTransparent() {
  console.log('🎨 Making logo background transparent...');
  
  if (!fs.existsSync(LOGO_PATH)) {
    console.error('❌ Logo not found at:', LOGO_PATH);
    process.exit(1);
  }

  try {
    // Read the logo image
    const image = sharp(LOGO_PATH);
    const metadata = await image.metadata();
    
    // Process the image to make black (or very dark) pixels transparent
    // We'll use a threshold to detect black/dark pixels and make them transparent
    await image
      .ensureAlpha() // Ensure alpha channel exists
      .composite([
        {
          input: Buffer.from([0, 0, 0, 0]), // Transparent pixel
          raw: {
            width: 1,
            height: 1,
            channels: 4
          },
          tile: false,
          blend: 'dest-over'
        }
      ])
      .png()
      .toFile(OUTPUT_PATH);

    // Now use a more sophisticated approach - extract alpha channel based on black pixels
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Process pixels to make black/dark pixels transparent
    const threshold = 30; // Pixels darker than this will be made transparent
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = (r + g + b) / 3;
      
      // If pixel is black or very dark, make it transparent
      if (avg < threshold) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }

    // Save the processed image
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(OUTPUT_PATH);

    console.log('✅ Logo with transparent background saved to:', OUTPUT_PATH);
    console.log('📝 You can now replace the original logo.png with logo-transparent.png');
    
  } catch (error) {
    console.error('❌ Error processing logo:', error.message);
    process.exit(1);
  }
}

makeLogoTransparent();

