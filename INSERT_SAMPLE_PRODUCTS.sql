-- FJ Store: Insert Sample Products with Images
-- Run this in your Supabase SQL Editor to populate the database
-- This will create 5 luxury products with beautiful images

-- 1. Insert sample products
INSERT INTO public.products (
  name, slug, short_description, full_description, brand, sku,
  regular_price, currency, is_published, stock_quantity, stock_status
) VALUES
  (
    'Luxury Gold Ring',
    'luxury-gold-ring',
    'Exquisite 18K gold ring with diamond accent',
    'A timeless piece of luxury jewelry crafted from 18K gold with a stunning diamond center stone.',
    'FJ Store',
    'RING-GOLD-001',
    599.99,
    'USD',
    true,
    25,
    'in_stock'
  ),
  (
    'Premium Silk Saree',
    'premium-silk-saree',
    'Hand-woven authentic silk saree',
    'Beautiful hand-woven silk saree with traditional embroidery.',
    'FJ Store',
    'SAREE-SILK-001',
    199.99,
    'USD',
    true,
    15,
    'in_stock'
  ),
  (
    'Luxury Cosmetic Set',
    'luxury-cosmetic-set',
    'Premium beauty collection',
    'Complete luxury beauty set with natural ingredients.',
    'FJ Store',
    'COSMETIC-SET-001',
    149.99,
    'USD',
    true,
    30,
    'in_stock'
  ),
  (
    'Handcrafted Perfume',
    'handcrafted-perfume',
    'Artisan fragrance collection',
    'Exquisite hand-crafted perfume made with premium ingredients.',
    'FJ Store',
    'PERFUME-ART-001',
    89.99,
    'USD',
    true,
    50,
    'in_stock'
  ),
  (
    'Designer Handbag',
    'designer-handbag',
    'Premium leather collection',
    'Elegant leather handbag, perfect for any occasion.',
    'FJ Store',
    'BAG-LEATHER-001',
    349.99,
    'USD',
    true,
    10,
    'in_stock'
  )
ON CONFLICT DO NOTHING;

-- 2. Get the product IDs
-- Run this query to get IDs for next step:
-- SELECT id, name FROM products WHERE slug LIKE 'luxury-%' OR slug LIKE 'premium-%' OR slug LIKE 'handcrafted-%' OR slug LIKE 'designer-%';

-- 3. Insert sample images
-- Note: Replace the UUIDs below with actual product IDs from the query above
INSERT INTO public.product_images (
  product_id, url, is_thumbnail, display_order, provider, mime_type
) 
SELECT 
  p.id, 
  CASE 
    WHEN p.slug = 'luxury-gold-ring' THEN 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
    WHEN p.slug = 'premium-silk-saree' THEN 'https://images.unsplash.com/photo-1599863547263-55c496cb991b?w=600&h=600&fit=crop'
    WHEN p.slug = 'luxury-cosmetic-set' THEN 'https://images.unsplash.com/photo-1596462502278-af3efdc991db?w=600&h=600&fit=crop'
    WHEN p.slug = 'handcrafted-perfume' THEN 'https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=600&h=600&fit=crop'
    WHEN p.slug = 'designer-handbag' THEN 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop'
  END,
  true,
  0,
  'unsplash',
  'image/jpeg'
FROM public.products p
WHERE p.slug IN (
  'luxury-gold-ring',
  'premium-silk-saree',
  'luxury-cosmetic-set',
  'handcrafted-perfume',
  'designer-handbag'
)
AND p.id NOT IN (SELECT DISTINCT product_id FROM public.product_images)
ON CONFLICT DO NOTHING;

-- 4. Verify the data was inserted
SELECT 
  'VERIFICATION' as check,
  COUNT(DISTINCT p.id) as products_created,
  COUNT(DISTINCT pi.id) as images_created
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
WHERE p.slug IN (
  'luxury-gold-ring',
  'premium-silk-saree',
  'luxury-cosmetic-set',
  'handcrafted-perfume',
  'designer-handbag'
);

-- Sample output should show:
-- check | products_created | images_created
-- VERIFICATION | 5 | 5

-- If images_created is 0, it means the product_images table needs the UUID of products.
-- In that case, run this directly:
-- INSERT INTO product_images (product_id, url, is_thumbnail, display_order, provider, mime_type)
-- VALUES 
--   ((SELECT id FROM products WHERE slug = 'luxury-gold-ring'), 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop', true, 0, 'unsplash', 'image/jpeg'),
--   ((SELECT id FROM products WHERE slug = 'premium-silk-saree'), 'https://images.unsplash.com/photo-1599863547263-55c496cb991b?w=600&h=600&fit=crop', true, 0, 'unsplash', 'image/jpeg'),
--   ((SELECT id FROM products WHERE slug = 'luxury-cosmetic-set'), 'https://images.unsplash.com/photo-1596462502278-af3efdc991db?w=600&h=600&fit=crop', true, 0, 'unsplash', 'image/jpeg'),
--   ((SELECT id FROM products WHERE slug = 'handcrafted-perfume'), 'https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=600&h=600&fit=crop', true, 0, 'unsplash', 'image/jpeg'),
--   ((SELECT id FROM products WHERE slug = 'designer-handbag'), 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', true, 0, 'unsplash', 'image/jpeg');
