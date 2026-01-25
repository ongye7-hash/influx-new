const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const thumbnailsDir = path.join(__dirname, '../public/thumbnails');

const svgFiles = [
  'youtube-thumb.svg',
  'instagram-thumb.svg',
  'tiktok-thumb.svg',
  'facebook-thumb.svg',
  'twitter-thumb.svg',
  'telegram-thumb.svg',
  'twitch-thumb.svg',
  'discord-thumb.svg',
  'threads-thumb.svg',
  'smm-thumb.svg'
];

async function convertSvgToPng() {
  console.log('Converting SVG thumbnails to PNG...\n');

  for (const svgFile of svgFiles) {
    const svgPath = path.join(thumbnailsDir, svgFile);
    const pngFile = svgFile.replace('.svg', '.png');
    const pngPath = path.join(thumbnailsDir, pngFile);

    try {
      // Read SVG file
      const svgBuffer = fs.readFileSync(svgPath);

      // Convert to PNG with sharp
      await sharp(svgBuffer, { density: 150 })
        .resize(1200, 630)
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(pngPath);

      const stats = fs.statSync(pngPath);
      console.log(`✓ ${svgFile} → ${pngFile} (${Math.round(stats.size / 1024)}KB)`);
    } catch (error) {
      console.error(`✗ ${svgFile}: ${error.message}`);
    }
  }

  console.log('\nDone!');
}

convertSvgToPng();
