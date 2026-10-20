#!/usr/bin/env node

/**
 * Extract products from data files and convert to CSV for Shopify import
 * Usage: node scripts/products-to-csv.js
 * Output: products-import.csv
 */

const fs = require('fs');
const path = require('path');

// Map icon types to proper categories
const iconToCategoryMap = {
  nas: { type: 'NAS Storage', category: 'Storage' },
  drive: { type: 'Hard Drive', category: 'Storage' },
  server: { type: 'Server', category: 'Servers' },
  tablet: { type: 'Drawing Tablet', category: 'Accessories' },
  network: { type: 'Networking', category: 'Networking' },
  monitor: { type: 'Monitor', category: 'Accessories' },
  filter: { type: 'Screen Filter', category: 'Accessories' },
  camera: { type: 'Camera', category: 'Surveillance' },
};

// Map badge to Shopify format
const badgeMap = {
  'In Stock': 'In Stock',
  'Pre-Order': 'Pre-Order',
  'New': 'New',
};

// Sample products structure
// This will be replaced with your actual products
const sampleProducts = [
  {
    id: '1',
    name: 'WD Red 1TB NAS Drive',
    category: 'Hard Drives',
    badge: 'In Stock',
    icon: 'drive',
    vendor: 'Western Digital',
    description: 'Reliable NAS storage solution',
    sku: 'WD1003FFBX',
    stock: 50,
  },
  {
    id: '2',
    name: 'IMOU Bullet Zip 2K Camera',
    category: 'IMOU',
    badge: 'New',
    icon: 'camera',
    vendor: 'IMOU',
    description: '2K resolution surveillance camera',
    sku: 'IPC-S22FP',
    stock: 25,
  },
  {
    id: '3',
    name: 'Seagate Barracuda Pro 8TB',
    category: 'Hard Drives',
    badge: 'In Stock',
    icon: 'drive',
    vendor: 'Seagate',
    description: 'High-performance enterprise drive',
    sku: 'ST8000DM004',
    stock: 30,
  },
];

function convertToCsv(products) {
  // CSV headers
  const headers = [
    'Title',
    'Vendor',
    'Product Type',
    'SKU',
    'Badge',
    'Icon Type',
    'Stock',
    'Description',
  ];

  // Convert products to CSV rows
  const rows = products.map((product) => [
    `"${product.name.replace(/"/g, '""')}"`, // Escape quotes
    `"${product.vendor.replace(/"/g, '""')}"`,
    `"${iconToCategoryMap[product.icon]?.type || product.category}"`,
    `"${product.sku}"`,
    `"${badgeMap[product.badge] || product.badge}"`,
    `"${product.icon}"`,
    product.stock || '0',
    `"${(product.description || '').replace(/"/g, '""')}"`,
  ]);

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return csvContent;
}

function main() {
  console.log('📦 Converting products to CSV format...\n');

  try {
    // TODO: Read actual products from your data files
    // For now, using sample products
    // Uncomment and modify based on your actual data structure

    /*
    const productsPath = path.join(__dirname, '../src/lib/data/products.ts');
    const content = fs.readFileSync(productsPath, 'utf-8');

    // Parse products from TypeScript file
    // This is a basic example - adjust based on your actual data structure
    */

    const csvContent = convertToCsv(sampleProducts);

    // Write to file
    const outputPath = path.join(__dirname, '../products-import.csv');
    fs.writeFileSync(outputPath, csvContent);

    console.log('✅ CSV file created successfully!\n');
    console.log(`📁 File: ${outputPath}\n`);
    console.log('📋 Next Steps:');
    console.log('1. Open products-import.csv in Excel or Google Sheets');
    console.log('2. Replace sample products with your actual product data');
    console.log('3. Add more rows for all 200+ products');
    console.log('4. Save the file');
    console.log('5. Go to Shopify Admin → Products → Import');
    console.log('6. Upload the CSV file\n');

    console.log('📝 CSV Preview (first 5 rows):');
    console.log('---');
    const preview = csvContent.split('\n').slice(0, 6).join('\n');
    console.log(preview);
    console.log('---\n');

  } catch (error) {
    console.error('❌ Error creating CSV:', error.message);
    process.exit(1);
  }
}

main();
