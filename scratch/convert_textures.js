const sharp = require('sharp');
const path = require('path');

const rawDir = path.join(__dirname, '../public/textures-raw');
const targetDir = path.join(__dirname, '../public/media');

const files = [
  { src: 'folia dhe listelat.png', dest: 'folia-dhe-listelat.webp' },
  { src: 'konstruksioni.png', dest: 'konstruksioni.webp' }
];

async function convert() {
  for (const file of files) {
    const srcPath = path.join(rawDir, file.src);
    const destPath = path.join(targetDir, file.dest);
    console.log(`Converting ${srcPath} to ${destPath}...`);
    try {
      await sharp(srcPath)
        .webp({ quality: 85 })
        .toFile(destPath);
      console.log(`Successfully converted ${file.src} to ${file.dest}`);
    } catch (err) {
      console.error(`Failed to convert ${file.src}:`, err);
    }
  }
}

convert();
