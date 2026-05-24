const fs = require('fs');
const path = require('path');

const dirs = [
  'A frame house me atike',
  'cotage me atike',
  'asebra me atike',
  'Elegance Comble'
];

dirs.forEach((dirName) => {
  const dirPath = path.join(__dirname, '..', 'public', 'images', 'houses', dirName);
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist: ${dirName}`);
    return;
  }
  console.log(`\n=== Directory: ${dirName} ===`);
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')) {
      const stats = fs.statSync(path.join(dirPath, file));
      console.log(`- ${file}: ${stats.size} bytes`);
    }
  });
});
