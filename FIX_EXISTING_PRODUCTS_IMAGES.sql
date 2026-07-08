-- FJ Store: Link Images to Existing Products
-- Run this SQL in Supabase SQL Editor to add images to your products

-- Step 1: Add images to existing products
INSERT INTO public.product_images (product_id, url, is_thumbnail, display_order, provider, mime_type)
SELECT 
  p.id,
  CASE p.slug
    WHEN 'fj-store-biryani' THEN 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop'
    WHEN 'bangels' THEN 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
  END,
  true,
  0,
  'unsplash',
  'image/jpeg'
FROM public.products p
WHERE p.slug IN ('fj-store-biryani', 'bangels')
  AND p.id NOT IN (SELECT DISTINCT product_id FROM public.product_images)
ON CONFLICT DO NOTHING;

-- Step 2: Verify images were added
SELECT 
  p.name,
  p.slug,
  COUNT(pi.id) as image_count
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
WHERE p.slug IN ('fj-store-biryani', 'bangels')
GROUP BY p.id, p.name, p.slug;

-- Expected result:
-- name             | slug              | image_count
-- FJ Store Biryani | fj-store-biryani  | 1
-- Bangels          | bangels           | 1
