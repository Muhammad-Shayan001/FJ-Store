-- EXECUTE THIS IN SUPABASE SQL EDITOR TO FIX IMAGE UPLOADS
-- This adds the missing columns to the product_images table

BEGIN;

-- Add missing columns to product_images table
ALTER TABLE public.product_images 
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'url',
  ADD COLUMN IF NOT EXISTS public_id TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'image/jpeg';

-- Create index on product_id for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- Create index on is_thumbnail for faster filtering
CREATE INDEX IF NOT EXISTS idx_product_images_thumbnail ON public.product_images(is_thumbnail) WHERE is_thumbnail = true;

COMMIT;

-- After running this, your images should display properly on the products list
-- Images uploaded before this fix may not have provider/public_id data, but will still display via 'url' column
