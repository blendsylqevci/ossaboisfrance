const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/images/houses/Australe');
const files = fs.readdirSync(dir);

async function optimize() {
  console.log(`Starting image optimization in: ${dir}`);
  for (const file of files) {
    if (file.startsWith('.')) continue;
    const filePath = path.join(dir, file);
    const tempPath = path.join(dir, 'temp_' + file);
    
    const statBefore = fs.statSync(filePath);
    if (statBefore.size < 1000) continue; // Skip very small files
    
    console.log(`Optimizing ${file} (${(statBefore.size / 1024 / 1024).toFixed(2)} MB)...`);
    
    try {
      if (file.endsWith('.png')) {
        // Transparent layers: compress PNG while maintaining quality
        await sharp(filePath)
          .png({ compressionLevel: 9, quality: 80 })
          .toFile(tempPath);
      } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        // Full renders: compress JPEG
        await sharp(filePath)
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(tempPath);
      } else {
        continue;
      }
      
      // Replace original with optimized temp file
      fs.renameSync(tempPath, filePath);
      const statAfter = fs.statSync(filePath);
      console.log(`Saved ${file}: ${(statBefore.size / 1024 / 1024).toFixed(2)} MB -> ${(statAfter.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }
  console.log("Image optimization complete!");
}

optimize().catch(console.error);
