const https = require('https');

const SHOP = 'copper-cat-systems.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const collections = [
  { title: 'Manual Steering Racks', handle: 'manual-steering-racks' },
  { title: 'Rebuilt Cylinder Heads', handle: 'rebuilt-cylinder-heads' }
];

async function createCollection(collection) {
  return new Promise((resolve) => {
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
        } else if (res.statusCode === 422) {
          console.log(`- Skipped: ${collection.title} (already exists)`);
        } else {
          console.log(`✗ Failed: ${collection.title} - ${res.statusCode}: ${body}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => console.error(e));
    req.write(data);
    req.end();
  });
}

(async () => {
  for (const collection of collections) {
    await createCollection(collection);
  }
})();
