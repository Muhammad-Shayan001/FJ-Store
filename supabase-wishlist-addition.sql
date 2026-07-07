-- FJ Store Update: APPEND ONLY - Do not overwrite previous blocks.
-- Execute this block in the Supabase SQL editor to add the missing wishlist table.

-- Wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their own wishlist items" ON public.wishlists;
CREATE POLICY "Users can manage their own wishlist items" 
ON public.wishlists 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
