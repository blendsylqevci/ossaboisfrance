const sharp = require('sharp');
const path = require('path');

const dir = '/Users/blendsylqevci/Desktop/Projects/ossaboisfrance/public/images/houses/Elegance Comble';

async function check() {
  const img5 = await sharp(path.join(dir, 'elegance comble 5.jpg')).metadata();
  const img7 = await sharp(path.join(dir, 'elegance comble 7.jpg')).metadata();

  console.log('Image 5:', img5.width, 'x', img5.height, 'format:', img5.format);
  console.log('Image 7:', img7.width, 'x', img7.height, 'format:', img7.format);
}

check().catch(console.error);
