const fs = require('fs');
const path = require('path');

function findFile(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        findFile(fullPath, pattern);
      }
    } else if (file.toLowerCase().includes(pattern.toLowerCase())) {
      console.log(`Found: ${fullPath}`);
    }
  }
}

findFile('.', 'calme-me-atike');
findFile('.', 'calme_atike');
