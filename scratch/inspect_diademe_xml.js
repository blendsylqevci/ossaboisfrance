const fs = require('fs');
const path = require('path');

const xmlPath = '/Users/blendsylqevci/Desktop/Projects/ossaboisfrance/sources/ossaboiskit.WordPress.2026-05-19.xml';

function inspect() {
  if (!fs.existsSync(xmlPath)) {
    console.error('XML file not found');
    return;
  }

  const content = fs.readFileSync(xmlPath, 'utf8');
  
  // Find <wp:post_name><![CDATA[diademe-toiture-terrasse]]></wp:post_name> or just 'diademe'
  // Let's find all occurrences of <item> containing diademe
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let count = 0;

  while ((match = itemRegex.exec(content)) !== null) {
    const itemContent = match[1];
    if (itemContent.includes('diademe') || itemContent.includes('Diademe')) {
      console.log(`\n=== ITEM ${++count} ===`);
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const nameMatch = itemContent.match(/<wp:post_name>([\s\S]*?)<\/wp:post_name>/);
      const idMatch = itemContent.match(/<wp:post_id>(\d+)<\/wp:post_id>/);
      const statusMatch = itemContent.match(/<wp:status>([\s\S]*?)<\/wp:status>/);
      const postTypeMatch = itemContent.match(/<wp:post_type>([\s\S]*?)<\/wp:post_type>/);

      console.log('Title:', titleMatch ? titleMatch[1] : 'N/A');
      console.log('Post Name:', nameMatch ? nameMatch[1] : 'N/A');
      console.log('ID:', idMatch ? idMatch[1] : 'N/A');
      console.log('Status:', statusMatch ? statusMatch[1] : 'N/A');
      console.log('Type:', postTypeMatch ? postTypeMatch[1] : 'N/A');

      // If it's a house, print the meta keys starting with 'perdhesa' or 'windows' or 'price'
      if (itemContent.includes('<wp:post_type><![CDATA[houses]]></wp:post_type>') || itemContent.includes('<wp:post_type>houses</wp:post_type>')) {
        const metaRegex = /<wp:postmeta>[\s\S]*?<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/g;
        let metaMatch;
        console.log('--- House Meta ---');
        while ((metaMatch = metaRegex.exec(itemContent)) !== null) {
          const key = metaMatch[1];
          const val = metaMatch[2];
          if (
            key.startsWith('perdhesa') || 
            key.startsWith('windows') || 
            key.includes('price') || 
            key.includes('enable') ||
            key.startsWith('house_layers')
          ) {
            console.log(`  ${key} => ${val}`);
          }
        }
      }
    }
  }
}

inspect();
