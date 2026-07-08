-- FJ Store Update: Fix product_images table
-- Add missing columns needed for image upload functionality
-- Execute this in Supabase SQL Editor

ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'url';
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS public_id TEXT;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'image/jpeg';

-- Verify the table structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'product_images' ORDER BY ordinal_position;
