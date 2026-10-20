#!/usr/bin/env node

/**
 * Import products from local data to Shopify
 * Usage: node scripts/import-to-shopify.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_NAME;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_API_KEY;

if (!SHOPIFY_STORE || !SHOPIFY_TOKEN) {
  console.error('❌ Missing SHOPIFY_STORE_NAME or SHOPIFY_ADMIN_API_KEY in .env.local');
  process.exit(1);
}

const graphqlEndpoint = `https://${SHOPIFY_STORE}/admin/api/2024-01/graphql.json`;

async function createProduct(product) {
  const mutation = `
    mutation CreateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      title: product.title,
      productType: product.productType || 'Hardware',
      vendor: product.vendor,
      tags: product.tags || [],
      handle: product.handle || product.title.toLowerCase().replace(/\s+/g, '-'),
      status: 'ACTIVE',
    },
  };

  try {
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error(`❌ GraphQL Error: ${data.errors[0].message}`);
      return null;
    }

    if (data.data.productCreate.userErrors.length > 0) {
      console.error(`❌ Product Error: ${data.data.productCreate.userErrors[0].message}`);
      return null;
    }

    console.log(`✅ Created: ${product.title}`);
    return data.data.productCreate.product;
  } catch (error) {
    console.error(`❌ Failed to create product: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting Shopify Product Import...\n');

  try {
    // Import local product data
    const productsPath = path.join(__dirname, '../src/lib/data/products.ts');
    const imouPath = path.join(__dirname, '../src/lib/data/imou-products.ts');

    // Read the files to extract product arrays
    let productData = [];

    if (fs.existsSync(productsPath)) {
      console.log('📦 Reading products from products.ts...');
      const content = fs.readFileSync(productsPath, 'utf-8');

      // Extract bestSellingProducts array
      const bestSellingMatch = content.match(/export const bestSellingProducts.*?=\s*\[([\s\S]*?)\];/);
      if (bestSellingMatch) {
        console.log('   Found bestSellingProducts');
      }
    }

    if (fs.existsSync(imouPath)) {
      console.log('📦 Reading products from imou-products.ts...');
    }

    console.log('\n⚠️  Manual Import Steps Required:\n');
    console.log('1. Export your product data to CSV format with these columns:');
    console.log('   Title, Description, Vendor, Product Type, SKU, Barcode, Image URLs');
    console.log('   Badge (In Stock/Pre-Order/New), Icon Type (nas/drive/server/etc), Stock Qty');
    console.log('\n2. Go to Shopify Admin → Products → Import Products');
    console.log('\n3. Upload the CSV file');
    console.log('\n4. Map columns and complete import\n');

    console.log('📝 Sample CSV format:');
    console.log('Title,Vendor,ProductType,SKU,Badge,IconType');
    console.log('"WD Red 1TB NAS Drive","Western Digital","Hard Drive","WD1003FFBX","In Stock","drive"');
    console.log('"IMOU Bullet Zip 2K NVR","IMOU","Surveillance","IPC-S22FP","New","monitor"\n');

    console.log('✅ Setup Complete! Next steps:');
    console.log('1. Prepare CSV file with your products');
    console.log('2. Import to Shopify manually');
    console.log('3. Create collections in Shopify Admin');
    console.log('4. Add banner content to Sanity Studio\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
