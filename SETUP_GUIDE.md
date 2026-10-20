# Elite Store - Shopify & Sanity CMS Setup Guide

This guide walks through Phase 2 of the Shopify migration: setting up infrastructure and populating content.

---

## 📋 Checklist - Complete in Order

### ✅ Part 1: Shopify Store Setup (15 min)

- [ ] Go to [shopify.com](https://shopify.com)
- [ ] Create account and store
- [ ] Navigate to **Apps and Integrations → App and sales channel settings**
- [ ] Click **Develop apps → Create an app**
- [ ] Name: `Elite Store API`
- [ ] Go to **Configuration** tab
- [ ] Click **Admin API scopes** and enable:
  - [ ] `read_products`
  - [ ] `read_collections`
  - [ ] `read_metafields`
- [ ] Click **Save**
- [ ] Copy three tokens:
  - [ ] Admin API access token
  - [ ] API key  
  - [ ] Store name (from URL)
- [ ] Add to `.env.local`:
  ```env
  SHOPIFY_STORE_NAME=your-store.myshopify.com
  SHOPIFY_STOREFRONT_API_KEY=your-api-key
  SHOPIFY_ADMIN_API_KEY=your-admin-token
  ```

**✨ Result:** Shopify store ready with API access

---

### ✅ Part 2: Sanity CMS Setup (10 min)

- [ ] Go to [sanity.io](https://sanity.io)
- [ ] Sign up (free account)
- [ ] Create new project: `Elite Store`
- [ ] Choose dataset: `production`
- [ ] Choose free tier
- [ ] Go to **Manage** → Click project
- [ ] Go to **API** tab
- [ ] Click **Add new API token**
  - [ ] Name: `Next.js API`
  - [ ] Permissions: **Editor**
  - [ ] Click **Save**
- [ ] Copy token
- [ ] Find Project ID in **Settings**
- [ ] Copy Project ID
- [ ] Add to `.env.local`:
  ```env
  NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
  NEXT_PUBLIC_SANITY_DATASET=production
  SANITY_API_TOKEN=your-token
  ```

**✨ Result:** Sanity workspace ready with API token

---

### ✅ Part 3: Deploy Schemas to Sanity (5 min)

**Option A: Using Sanity CLI (Recommended)**
```bash
npm install -g @sanity/cli
sanity init
# Follow prompts, use your project ID
```

**Option B: Manual Deploy**
1. Go to your Sanity dashboard
2. Click **Vision** (top left)
3. Create content types manually or import schemas

- [ ] Schemas deployed to Sanity
- [ ] Sanity Studio accessible at `yourproject.sanity.studio`

**✨ Result:** Ready to create content

---

### ✅ Part 4: Install Project Dependencies (2 min)

```bash
cd /Users/qubryxshanif/Projects/Shanif/Elite_store
npm install next-sanity sanity @sanity/image-url
```

- [ ] Dependencies installed

**✨ Result:** Project has Sanity SDK

---

### ✅ Part 5: Populate Sanity Content (30 min)

Go to **yourproject.sanity.studio**

#### 5.1 Create Hero Banners (3 items)
- [ ] Navigate to **Hero Banner** collection
- [ ] Create 3 new documents:
  - [ ] Banner 1: Upload `banner1.jpg`, Order: 1
  - [ ] Banner 2: Upload `banner2.jpg`, Order: 2
  - [ ] Banner 3: Upload `banner3.jpg`, Order: 3

#### 5.2 Create Side Banners (4 items)
- [ ] Navigate to **Side Banner** collection
- [ ] Create 4 new documents:
  - [ ] Side 1: Upload `sidebanner1.jpeg`, Order: 1
  - [ ] Side 2: Upload `sidebanner2.jpeg`, Order: 2
  - [ ] Side 3: Upload `sidebanner3.jpeg`, Order: 3
  - [ ] Side 4: Upload `sidebanner4.jpeg`, Order: 4

#### 5.3 Create Promo Banners (2 items)
- [ ] Navigate to **Promo Banner** collection
- [ ] Create 2 documents:
  - [ ] Promo 1:
    - Eyebrow: "Limited Time"
    - Heading: "Special Offer"
    - Subheading: "Save up to 40%"
    - Link: `/collections/hard-drives-ssds`
    - Gradient: `from-blue-600 to-blue-800`
    - Icon: `Zap`
  - [ ] Promo 2:
    - Eyebrow: "New Arrivals"
    - Heading: "Latest Tech"
    - Subheading: "Check out our newest products"
    - Link: `/collections/new-products`
    - Gradient: `from-purple-600 to-pink-800`
    - Icon: `Star`

#### 5.4 Create Sub Banners (5 items)
- [ ] Navigate to **Sub Banner** collection
- [ ] Create 5 documents with your sub-banner images:
  - [ ] Upload `subbanner-1.png`, Order: 1
  - [ ] Upload `subbanner-1.1.png`, Order: 2
  - [ ] Upload `subbanner-1.2.png`, Order: 3
  - [ ] Upload `subbanner-2.png`, Order: 4
  - [ ] Upload `subbanner-3.png`, Order: 5

#### 5.5 Create Site Settings (1 item)
- [ ] Navigate to **Site Settings** collection
- [ ] Create 1 document with:
  - [ ] Site Name: `Secure Tech Oman`
  - [ ] Tagline: `Hardware You Can Rely On`
  - [ ] Site URL: `https://securetechoman.com`
  - [ ] Contact Info:
    - [ ] Phone: Your phone
    - [ ] Email: Your email
    - [ ] Address: Your address
  - [ ] Social Links:
    - [ ] Facebook: Your Facebook URL
    - [ ] Instagram: Your Instagram URL
    - [ ] LinkedIn: Your LinkedIn URL
  - [ ] Marquee Partners (22 brands):
    - [ ] Add all brands from your current `brands.ts` with IDs and order
  - [ ] Category Navigation (6 items):
    - [ ] Add all categories with URLs

**✨ Result:** All content in Sanity Studio

---

### ✅ Part 6: Prepare Products for Shopify Import (15 min)

**Create CSV file** (`products-import.csv`) with these columns:

```
Title,Vendor,ProductType,SKU,Badge,IconType,Stock,Description
"WD Red 1TB NAS Drive","Western Digital","Hard Drive","WD1003FFBX","In Stock","drive",50,"Reliable NAS storage"
"IMOU Bullet Zip 2K Camera","IMOU","Surveillance Camera","IPC-S22FP","New","camera",25,"2K resolution camera"
```

**Steps:**
1. Export all products from `/src/lib/data/products.ts`
2. Create CSV with required columns
3. Save as `products-import.csv`

- [ ] CSV file prepared with all products

**✨ Result:** Ready to import to Shopify

---

### ✅ Part 7: Import Products to Shopify (20 min)

1. Log into Shopify Admin
2. Go to **Products**
3. Click **Import products**
4. Upload your `products-import.csv` file
5. Map columns to Shopify fields
6. Review and import

- [ ] Products imported to Shopify
- [ ] Verify: Go to Products → See your items

**✨ Result:** 200+ products in Shopify

---

### ✅ Part 8: Create Collections in Shopify (10 min)

In Shopify Admin, go to **Products → Collections**

Create these 6 collections:

- [ ] "Storage Devices"
  - [ ] Assign products with badge "Hard Drive" or type "NAS"
- [ ] "NAS Storage"
  - [ ] Assign products with type "NAS"
- [ ] "Hard Drives & SSDs"
  - [ ] Assign hard drive products
- [ ] "Servers & Workstations"
  - [ ] Assign server products
- [ ] "Drawing Tablets"
  - [ ] Assign tablet products
- [ ] "IMOU Surveillance"
  - [ ] Assign IMOU vendor products
- [ ] "Screen Filters"
  - [ ] Assign filter products
- [ ] "Best Sellers" (smart collection)
  - [ ] Auto-filter by tag "bestselling"
- [ ] "Featured Products" (smart collection)
  - [ ] Auto-filter by tag "featured"
- [ ] "New Products" (smart collection)
  - [ ] Auto-filter by tag "new"

**✨ Result:** Collections organized in Shopify

---

## ✅ Phase 2 Complete!

**Verification Checklist:**

- [ ] Shopify store has 200+ products
- [ ] All 6+ collections created
- [ ] Sanity Studio has all banner content
- [ ] Site Settings entry complete
- [ ] `.env.local` has all tokens:
  - [ ] `SHOPIFY_STORE_NAME`
  - [ ] `SHOPIFY_STOREFRONT_API_KEY`
  - [ ] `SHOPIFY_ADMIN_API_KEY`
  - [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_SANITY_DATASET`
  - [ ] `SANITY_API_TOKEN`

---

## 🚀 Next: Phase 3 - Code Implementation

Once Phase 2 is complete, we'll:
1. Create Shopify API service layer
2. Create API routes for products/collections
3. Update components to fetch from APIs
4. Remove hardcoded data files

See `/Users/qubryxshanif/.claude/plans/here-i-need-to-whimsical-oasis.md` for full implementation plan.

---

## 🆘 Troubleshooting

**Q: Sanity schemas not showing in Studio?**
A: Run `sanity deploy` to push schemas, then refresh studio URL

**Q: Shopify API token not working?**
A: Verify permissions are enabled and token is copied correctly

**Q: Product import fails?**
A: Check CSV format - ensure vendor names match exactly with Shopify vendors

**Q: Sanity queries returning empty?**
A: Verify documents are published (not drafts) in Sanity Studio

---

**Questions?** Refer to the plan file at `/Users/qubryxshanif/.claude/plans/here-i-need-to-whimsical-oasis.md`
