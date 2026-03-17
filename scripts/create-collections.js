const https = require('https');

const SHOP = 'copper-cat-systems.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const collections = [
  // Classic Mini
  { title: 'Classic Mini', handle: 'classic-mini' },
  { title: 'Mini Cooper (Classic)', handle: 'mini-cooper' },
  { title: 'Mini Cooper S (Classic)', handle: 'mini-cooper-s' },

  // Gen 1 (2002-2006)
  { title: 'R50 One/Cooper', handle: 'r50' },
  { title: 'R52 Convertible', handle: 'r52' },
  { title: 'R52 Convertible S', handle: 'r52-s' },
  { title: 'R53 Cooper S', handle: 'r53' },
  { title: 'R53 GP', handle: 'r53-gp' },

  // Gen 2 (2007-2013)
  { title: 'R55 Clubman', handle: 'r55' },
  { title: 'R55 Clubman S', handle: 'r55-s' },
  { title: 'R56 Hardtop', handle: 'r56' },
  { title: 'R56 Hardtop S/JCW', handle: 'r56-s' },
  { title: 'R56 GP', handle: 'r56-gp' },
  { title: 'R57 Convertible', handle: 'r57' },
  { title: 'R57 Convertible S', handle: 'r57-s' },
  { title: 'R58 Coupe', handle: 'r58' },
  { title: 'R58 Coupe S/JCW', handle: 'r58-s' },
  { title: 'R59 Roadster', handle: 'r59' },
  { title: 'R59 Roadster S/JCW', handle: 'r59-s' },
  { title: 'R60 Countryman', handle: 'r60' },
  { title: 'R60 Countryman S', handle: 'r60-s' },
  { title: 'R61 Paceman', handle: 'r61' },
  { title: 'R61 Paceman S', handle: 'r61-s' },

  // Gen 3 (2014-Present)
  { title: 'F54 Clubman', handle: 'f54' },
  { title: 'F54 Clubman S/JCW', handle: 'f54-s' },
  { title: 'F55 Hardtop 4-Door', handle: 'f55' },
  { title: 'F55 Hardtop 4-Door S', handle: 'f55-s' },
  { title: 'F56 Hardtop 2-Door', handle: 'f56' },
  { title: 'F56 Hardtop S/JCW', handle: 'f56-s' },
  { title: 'F56 GP3', handle: 'f56-gp' },
  { title: 'F57 Convertible', handle: 'f57' },
  { title: 'F57 Convertible S/JCW', handle: 'f57-s' },
  { title: 'F60 Countryman', handle: 'f60' },
  { title: 'F60 Countryman S/JCW', handle: 'f60-s' },

  // Generation collections
  { title: 'Gen 1 Mini Parts', handle: 'gen-1' },
  { title: 'Gen 2 Mini Parts', handle: 'gen-2' },
  { title: 'Gen 3 Mini Parts', handle: 'gen-3' },
  { title: 'All Mini Parts', handle: 'mini-parts' },
];

function createCollection(collection) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      custom_collection: {
        title: collection.title,
        handle: collection.handle,
        published: true
      }
    });

    const options = {
      hostname: SHOP,
      port: 443,
      path: '/admin/api/2024-01/custom_collections.json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log(`✓ Created: ${collection.title} (${collection.handle})`);
          resolve(JSON.parse(body));
        } else if (res.statusCode === 422) {
          console.log(`- Skipped: ${collection.title} (already exists)`);
          resolve(null);
        } else {
          console.log(`✗ Failed: ${collection.title} - ${res.statusCode}: ${body}`);
          reject(new Error(body));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function createAllCollections() {
  console.log('Creating collections...\n');

  for (const collection of collections) {
    try {
      await createCollection(collection);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`Error creating ${collection.title}:`, err.message);
    }
  }

  console.log('\nDone!');
}

createAllCollections();
