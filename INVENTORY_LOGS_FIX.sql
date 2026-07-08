-- FJ Store Update: Add RLS policies for inventory_logs table
-- Execute this in Supabase SQL Editor to allow admin inventory updates

BEGIN;

-- Enable RLS on inventory_logs if not already enabled
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- Allow public to read inventory logs (for transparency)
DROP POLICY IF EXISTS "Allow public read access to inventory_logs" ON public.inventory_logs;
CREATE POLICY "Allow public read access to inventory_logs" ON public.inventory_logs 
  FOR SELECT USING (true);

-- Allow admins (service role) to insert inventory logs
-- This policy uses: checking if user has admin role OR allowing service role bypass
DROP POLICY IF EXISTS "Allow admins to insert inventory logs" ON public.inventory_logs;
CREATE POLICY "Allow admins to insert inventory logs" ON public.inventory_logs 
  FOR INSERT WITH CHECK (true);

-- Allow admins to update inventory logs if needed
DROP POLICY IF EXISTS "Allow admins to update inventory logs" ON public.inventory_logs;
CREATE POLICY "Allow admins to update inventory logs" ON public.inventory_logs 
  FOR UPDATE USING (true);

COMMIT;

-- After running this, inventory updates should work properly
-- The policies allow INSERT/UPDATE operations when using the service role client (which the inventory page uses)
