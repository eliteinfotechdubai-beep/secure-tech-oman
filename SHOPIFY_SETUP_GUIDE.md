# Phase 1: Shopify Setup - Complete Guide

This guide walks you through creating all Metaobjects and populating content in Shopify.

**Time Required:** ~2 hours total

---

## 📋 Checklist - Do in Order

- [ ] Step 1: Create Metaobject Definitions (5 definitions)
- [ ] Step 2: Create Hero Banner Entries (3 items)
- [ ] Step 3: Create Side Banner Entries (4 items)
- [ ] Step 4: Create Promo Banner Entries (2 items)
- [ ] Step 5: Create Sub Banner Entries (5 items)
- [ ] Step 6: Create Site Settings Entry (1 item)
- [ ] Step 7: Prepare Products CSV
- [ ] Step 8: Import Products to Shopify
- [ ] Step 9: Create Collections

---

## ✅ Step 1: Create Metaobject Definitions (15 min)

These are the "templates" for your content.

### How to Access:
1. Log into Shopify Admin: `https://elite-store-rtlyicjk.myshopify.com/admin`
2. Go to **Settings** (bottom left)
3. Click **Metaobjects**
4. Click **Create definition**

---

### Definition 1: Hero Banner

**Click "Create definition"**

Fill in:
```
Name: Hero Banner
Handle: hero_banner (auto-fills)
Description: Main carousel banners on homepage
```

**Click "Add field"** 5 times and add these fields:

**Field 1:**
- Field name: id
- Field type: Single line text
- ✅ This field is required

**Field 2:**
- Field name: image
- Field type: File
- ✅ This field is required

**Field 3:**
- Field name: alt
- Field type: Single line text

**Field 4:**
- Field name: order
- Field type: Number
- ✅ This field is required

**Click "Save"** ✅

---

### Definition 2: Side Banner

**Click "Create definition"**

```
Name: Side Banner
Handle: side_banner
Description: Side banners displayed on homepage
```

**Add 5 fields:**

1. **id** - Single line text (required)
2. **image** - File (required)
3. **alt** - Single line text
4. **href** - Single line text
5. **order** - Number (required)

**Click "Save"** ✅

---

### Definition 3: Promo Banner

**Click "Create definition"**

```
Name: Promo Banner
Handle: promo_banner
Description: Promotional campaign banners
```

**Add 8 fields:**

1. **id** - Single line text (required)
2. **eyebrow** - Single line text
3. **heading** - Single line text (required)
4. **subheading** - Single line text
5. **href** - Single line text (required)
6. **gradient** - Single line text
7. **icon** - Single line text
8. **order** - Number (required)

**Click "Save"** ✅

---

### Definition 4: Sub Banner

**Click "Create definition"**

```
Name: Sub Banner
Handle: sub_banner
Description: Sub-banner promotional images
```

**Add 4 fields:**

1. **id** - Single line text (required)
2. **image** - File (required)
3. **title** - Single line text
4. **order** - Number (required)

**Click "Save"** ✅

---

### Definition 5: Site Settings

**Click "Create definition"**

```
Name: Site Settings
Handle: site_settings
Description: Global site configuration
```

**Add 9 fields:**

1. **siteName** - Single line text (required)
2. **tagline** - Single line text
3. **siteUrl** - Single line text (required)
4. **phone** - Single line text
5. **email** - Single line text
6. **address** - Multi-line text
7. **facebook** - Single line text
8. **instagram** - Single line text
9. **linkedin** - Single line text

**Click "Save"** ✅

---

**✨ Result:** All 5 metaobject definitions created in Shopify!

---

## ✅ Step 2: Create Hero Banner Entries (10 min)

### Go to Hero Banner Collection
1. Shopify Admin → **Settings → Metaobjects**
2. Click **Hero Banner** (from your definitions)
3. Click **Create entry**

### Entry 1: Banner 1

**Fill in:**
```
id: hero-1
image: [Upload or select banner1.jpg from /public/assets/]
alt: Main Banner 1
order: 1
```

**Click "Save"** ✅

### Entry 2: Banner 2

```
id: hero-2
image: banner2.jpg
alt: Main Banner 2
order: 2
```

**Click "Save"** ✅

### Entry 3: Banner 3

```
id: hero-3
image: banner3.jpg
alt: Main Banner 3
order: 3
```

**Click "Save"** ✅

**✨ Result:** 3 hero banners created!

---

## ✅ Step 3: Create Side Banner Entries (10 min)

### Go to Side Banner Collection
1. Shopify Admin → **Settings → Metaobjects**
2. Click **Side Banner**
3. Click **Create entry**

### Entry 1: Side Banner 1

```
id: side-1
image: sidebanner1.jpeg
alt: Side Banner 1
href: /collections/storage-devices
order: 1
```

**Click "Save"** ✅

### Entry 2: Side Banner 2

```
id: side-2
image: sidebanner2.jpeg
alt: Side Banner 2
href: /collections/servers
order: 2
```

**Click "Save"** ✅

### Entry 3: Side Banner 3

```
id: side-3
image: sidebanner3.jpeg
alt: Side Banner 3
href: /collections/drawing-tablets
order: 3
```

**Click "Save"** ✅

### Entry 4: Side Banner 4

```
id: side-4
image: sidebanner4.jpeg
alt: Side Banner 4
href: /collections/imou-surveillance
order: 4
```

**Click "Save"** ✅

**✨ Result:** 4 side banners created!

---

## ✅ Step 4: Create Promo Banner Entries (10 min)

### Go to Promo Banner Collection
1. Shopify Admin → **Settings → Metaobjects**
2. Click **Promo Banner**
3. Click **Create entry**

### Entry 1: Limited Time Offer

```
id: promo-1
eyebrow: Limited Time
heading: Special Offer
subheading: Save up to 40%
href: /collections/hard-drives-ssds
gradient: from-blue-600 to-blue-800
icon: Zap
order: 1
```

**Click "Save"** ✅

### Entry 2: New Arrivals

```
id: promo-2
eyebrow: New Arrivals
heading: Latest Tech
subheading: Check out our newest products
href: /collections/new-products
gradient: from-purple-600 to-pink-800
icon: Star
order: 2
```

**Click "Save"** ✅

**✨ Result:** 2 promo banners created!

---

## ✅ Step 5: Create Sub Banner Entries (10 min)

### Go to Sub Banner Collection
1. Shopify Admin → **Settings → Metaobjects**
2. Click **Sub Banner**
3. Click **Create entry**

### Entry 1-5: Create 5 entries

```
Entry 1:
id: sub-1
image: subbanner-1.png
title: Storage Solutions
order: 1

Entry 2:
id: sub-2
image: subbanner-1.1.png
title: Server Solutions
order: 2

Entry 3:
id: sub-3
image: subbanner-1.2.png
title: Network Solutions
order: 3

Entry 4:
id: sub-4
image: subbanner-2.png
title: Surveillance Solutions
order: 4

Entry 5:
id: sub-5
image: subbanner-3.png
title: Accessory Solutions
order: 5
```

**Click "Save"** after each entry ✅

**✨ Result:** 5 sub banners created!

---

## ✅ Step 6: Create Site Settings Entry (5 min)

### Go to Site Settings Collection
1. Shopify Admin → **Settings → Metaobjects**
2. Click **Site Settings**
3. Click **Create entry**

### Fill in:

```
siteName: Secure Tech Oman
tagline: Hardware You Can Rely On
siteUrl: https://securetechoman.com
phone: +968 XXXX XXXX  [Add your actual phone]
email: sales@securetechoman.com
address: [Add your actual address]
facebook: https://facebook.com/[your-page]
instagram: https://instagram.com/[your-account]
linkedin: https://linkedin.com/company/[your-company]
```

**Click "Save"** ✅

**✨ Result:** Site configuration saved!

---

## ✅ Step 7: Prepare Products CSV (20 min)

You need to create a CSV file with all your products.

### Download Current Product Data

From your project, extract product data from:
- `/src/lib/data/products.ts`
- `/src/lib/data/imou-products.ts`

### Create CSV File

Create file: `products-import.csv`

**Format:**
```
Title,Vendor,Product Type,SKU,Badge,Icon Type,Stock,Description
"WD Red 1TB NAS Drive","Western Digital","Hard Drive","WD1003FFBX","In Stock","drive",50,"Reliable NAS storage solution"
"IMOU Bullet Zip 2K Camera","IMOU","Camera","IPC-S22FP","New","camera",25,"2K resolution surveillance camera"
"Seagate Barracuda Pro 8TB","Seagate","Hard Drive","ST8000DM004","In Stock","drive",30,"High-performance enterprise drive"
```

**Required Columns:**
- Title (product name)
- Vendor (brand name)
- Product Type (category: Hard Drive, Server, Camera, etc.)
- SKU (unique identifier)
- Badge (In Stock, Pre-Order, New)
- Icon Type (drive, server, camera, tablet, monitor, filter, nas, network)
- Stock (quantity)
- Description (optional)

### How to Create CSV:

**Option A: Manual (for small catalog)**
1. Open Excel/Google Sheets
2. Add headers: Title, Vendor, Product Type, SKU, Badge, Icon Type, Stock, Description
3. Add your products row by row
4. Export as CSV

**Option B: Use existing data (recommended)**
1. I'll provide a script to extract from your products.ts files
2. Script converts to CSV format
3. Ready to import!

---

## ✅ Step 8: Import Products to Shopify (15 min)

### Go to Products Import
1. Shopify Admin → **Products**
2. Click **Import products**
3. Upload your `products-import.csv` file
4. Click **Upload file**

### Map Columns
Shopify will ask you to map CSV columns to product fields:
- CSV "Title" → Product "Title"
- CSV "Vendor" → Product "Vendor"
- CSV "Product Type" → Product "Product type"
- CSV "SKU" → Product "SKU"
- CSV "Stock" → Product "Quantity"
- CSV "Badge", "Icon Type", "Description" → Custom fields (if needed)

### Review & Import
1. Review the preview
2. Click **Import**
3. Wait for completion ✅

**✨ Result:** 200+ products in Shopify!

---

## ✅ Step 9: Create Collections (20 min)

Collections are categories for organizing products.

### Go to Collections
1. Shopify Admin → **Products → Collections**
2. Click **Create collection**

### Collection 1: Storage Devices (Parent)

```
Title: Storage Devices
Handle: storage-devices
Description: All storage solutions

Products: [Search and add hard drives, NAS, SSDs]
```

**Save** ✅

### Collection 2: Hard Drives & SSDs

```
Title: Hard Drives & SSDs
Handle: hard-drives-ssds
Description: Hard drives and solid state drives

Products: [Filter by Vendor: Western Digital, Seagate, Kingston, etc.]
```

**Save** ✅

### Collection 3: NAS Storage

```
Title: NAS Storage
Handle: nas-storage
Description: Network attached storage solutions

Products: [Filter products with icon-type: nas]
```

**Save** ✅

### Collection 4: Servers & Workstations

```
Title: Servers & Workstations
Handle: servers
Description: Server and workstation solutions

Products: [Filter by Product Type: Server, Workstation]
```

**Save** ✅

### Collection 5: Drawing Tablets

```
Title: Drawing Tablets
Handle: drawing-tablets
Description: Professional drawing tablets

Products: [Filter by Vendor: WACOM, XP-Pen, etc.]
```

**Save** ✅

### Collection 6: IMOU Surveillance

```
Title: IMOU Surveillance
Handle: imou-surveillance
Description: IMOU surveillance and security products

Products: [Filter by Vendor: IMOU]
```

**Save** ✅

### Collection 7: Screen Filters

```
Title: Screen Filters
Handle: screen-filters
Description: Privacy screen filters

Products: [Filter by Product Type: Screen Filter]
```

**Save** ✅

### Collection 8: Best Sellers (Smart Collection)

```
Title: Best Sellers
Handle: best-sellers
Description: Our top-selling products

Use Smart Collection:
- Condition: Tag is "bestselling"
- Show first: 20 products
```

**Save** ✅

### Collection 9: Featured Products (Smart Collection)

```
Title: Featured Products
Handle: featured-products
Description: Handpicked featured products

Use Smart Collection:
- Condition: Tag is "featured"
- Show first: 10 products
```

**Save** ✅

### Collection 10: New Products (Smart Collection)

```
Title: New Products
Handle: new-products
Description: Recently added products

Use Smart Collection:
- Condition: Tag is "new"
- Show first: 20 products
```

**Save** ✅

**✨ Result:** 10 collections organized!

---

## ✅ Phase 1 Complete!

### Verification Checklist

- [ ] 5 metaobject definitions created in Shopify
- [ ] 3 hero banners created
- [ ] 4 side banners created
- [ ] 2 promo banners created
- [ ] 5 sub banners created
- [ ] 1 site settings entry created
- [ ] 200+ products imported
- [ ] 10 collections created
- [ ] All products assigned to appropriate collections

---

## 📊 Summary

**Content Ready in Shopify:**
- ✅ 20 banner entries
- ✅ 1 site configuration
- ✅ 200+ products
- ✅ 10 organized collections

**Next: Phase 2 - Code Implementation**

Once this is complete, we'll:
1. Create Shopify API service layer
2. Build API routes for fetching all this data
3. Update components to use the APIs
4. Test everything works!

---

## 🆘 Troubleshooting

**Q: Can't find Metaobjects in Settings?**
A: Make sure you enabled Metafields in your Shopify plan. Go to Settings → Check "Metaobjects" is visible

**Q: CSV import not working?**
A: Verify column headers match exactly (Title, Vendor, Product Type, SKU, etc.)

**Q: Can't upload images in metaobjects?**
A: Images must be in Shopify media library first. Upload to Products → Media first, then select in metaobjects

**Q: Collections not showing products?**
A: Make sure products have vendors/types that match collection criteria

---

**Let me know once Phase 1 is complete, and we'll move to Phase 2! 🚀**
