-- FJ Store: Complete Fix - Add Missing Columns + Insert Images
-- Run this in Supabase SQL Editor

-- Step 1: Add missing columns to product_images table
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'url';
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS public_id TEXT;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'image/jpeg';

-- Step 2: Verify columns exist
-- This will show all columns in product_images table
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_images' ORDER BY ordinal_position;

-- Step 3: Now insert images with all columns
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

-- Step 4: Verify images were added
SELECT 
  p.name,
  p.slug,
  COUNT(pi.id) as image_count,
  pi.url,
  pi.provider
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
WHERE p.slug IN ('fj-store-biryani', 'bangels')
GROUP BY p.id, p.name, p.slug, pi.url, pi.provider;

-- Expected result after running this:
-- name             | slug              | image_count | url                                          | provider
-- FJ Store Biryani | fj-store-biryani  | 1           | https://images.unsplash.com/.../photo-1512... | unsplash
-- Bangels          | bangels           | 1           | https://images.unsplash.com/.../photo-1599... | unsplash
