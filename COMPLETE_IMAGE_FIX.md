# 🖼️ Complete Image Display Fix - Step-by-Step

## Problem
Images aren't showing because the `product_images` table exists but is **empty** - products need to be re-uploaded with images.

## Step 1: Verify Database is Ready (Run in Supabase SQL Editor)

Go to **https://app.supabase.com** → Your Project → **SQL Editor** → **New Query**

Paste this SQL to verify everything is set up:

```sql
-- 1. Check if product_images table exists
SELECT EXISTS(
  SELECT FROM information_schema.tables 
  WHERE table_name = 'product_images'
);

-- 2. Check product_images table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;

-- 3. Check for RLS policies
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'product_images';

-- 4. Count existing images
SELECT COUNT(*) as image_count FROM public.product_images;
```

Click **Run** ✅

### Expected Results:
- ✅ `EXISTS` = true (table exists)
- ✅ Columns include: id, product_id, url, is_thumbnail, display_order, provider, public_id, file_size, mime_type
- ✅ Policies include one for SELECT (public read)
- ✅ `image_count` = 0 (empty table initially)

---

## Step 2: Fix RLS Policies (if needed)

If the RLS check shows issues, run this:

```sql
-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public read policy
DROP POLICY IF EXISTS "Allow public read access to product_images" ON public.product_images;
CREATE POLICY "Allow public read access to product_images" 
ON public.product_images 
FOR SELECT 
USING (true);

-- Admin write policy
DROP POLICY IF EXISTS "Allow authenticated users to manage product images" ON public.product_images;
CREATE POLICY "Allow authenticated users to manage product images" 
ON public.product_images 
FOR INSERT, UPDATE, DELETE 
WITH CHECK (true);
```

---

## Step 3: Upload Products with Images

### Method A: Use Admin Products UI (RECOMMENDED)
1. Go to **http://localhost:3000/admin/products** (or your site URL)
2. Click **"+ Add New Product"**
3. Fill in product details
4. **IMPORTANT**: Upload images in the image uploader
5. Click **Save**

**Result**: Images saved to `product_images` table with full metadata (provider, public_id, file_size, mime_type)

### Method B: Use API to Upload Existing Products
If you have products but no images, use this curl command:

```bash
curl -X PUT http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "id": "PRODUCT_ID_HERE",
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "is_thumbnail": true,
        "display_order": 0,
        "provider": "url"
      }
    ]
  }'
```

Replace `PRODUCT_ID_HERE` with actual product ID.

---

## Step 4: Verify Images Display

### In Frontend
1. Go to **http://localhost:3000/shop**
2. You should see product images
3. Images load from `/api/products?...` → `product_images(*)` relation

### In Database
Run this to verify images were saved:

```sql
SELECT 
  p.id,
  p.name,
  COUNT(pi.id) as image_count,
  pi.url,
  pi.provider
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE pi.url IS NOT NULL
GROUP BY p.id, p.name, pi.url, pi.provider
LIMIT 10;
```

---

## Step 5: Image Upload Architecture (How It Works)

### Upload Flow
```
User adds image in /admin/products
        ↓
Image sent to Cloudinary (via /api/upload)
        ↓
Cloudinary returns URL
        ↓
Product saved with images array via /api/products
        ↓
Images inserted into product_images table
        ↓
Frontend fetches via /api/products?slug=...
        ↓
product_images(*) relation joins to products
        ↓
ProductCard displays image from product.images[0].url
```

### Image Storage Providers (Priority Order)
1. **Cloudinary** (Primary) - URL + metadata stored
2. **ImageKit** (Fallback) - URL + metadata stored  
3. **Data URL** (Emergency) - Base64 inline

---

## Troubleshooting

### Images still not showing?

**Check 1: Are images in the database?**
```sql
SELECT COUNT(*) FROM product_images;
```
- If 0: Go to Step 3, upload a product with images

**Check 2: Are RLS policies blocking SELECT?**
```sql
SELECT * FROM product_images LIMIT 1;
-- If error: Run Step 2 SQL
```

**Check 3: Is frontend receiving images?**
- Open browser DevTools (F12)
- Go to Network tab
- Make request to `/api/products`
- Check response JSON for `"images":` array
- If empty array: No images in database (Step 3)
- If populated: Frontend issue (check ProductCard.tsx)

**Check 4: ProductCard component using correct property?**
- ProductCard looks for `product.images` (aliased in query)
- Should show: `product.images?.[0]?.url`
- Check [src/components/shop/ProductCard.tsx](src/components/shop/ProductCard.tsx#L12)

---

## Quick Test Script

Run this in browser console to test image loading:

```javascript
// Test image fetch
fetch('/api/products?limit=1')
  .then(r => r.json())
  .then(d => {
    console.log('Products:', d.products);
    console.log('First product images:', d.products[0]?.images);
    console.log('Image URL:', d.products[0]?.images?.[0]?.url);
  });
```

If `Image URL` shows a valid URL → images are loaded → frontend rendering issue
If `Image URL` is undefined → no images in database → need Step 3

---

## Summary

| Component | Status | Action |
|-----------|--------|--------|
| ✅ product_images table | Created | Run Step 1 to verify |
| ✅ RLS policies | Configured | Check Step 2 if needed |
| ❌ Images data | **EMPTY** | **← YOU ARE HERE** |
| ⚠️ Frontend display | Works if data exists | Automatic once images uploaded |

**Next Action**: Go to `/admin/products`, add a product with images, and images will display!

