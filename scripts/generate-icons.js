const sharp = require('sharp');
const fs = require('fs');

const sizes = [192, 256, 384, 512];
const inputFile = 'public/icons/base-icon.svg';

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);
  }
}

generateIcons().catch(console.error); 