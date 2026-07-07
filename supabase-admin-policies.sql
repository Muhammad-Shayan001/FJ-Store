-- Run this script in the Supabase SQL Editor to grant Admins full access to all tables

-- 1. Create a helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add Policies for Categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories 
  FOR ALL USING (public.is_admin());

-- 3. Add Policies for Subcategories
DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.subcategories;
CREATE POLICY "Admins can manage subcategories" ON public.subcategories 
  FOR ALL USING (public.is_admin());

-- 4. Add Policies for Products
-- Allow admins to see ALL products (even unpublished)
DROP POLICY IF EXISTS "Admins can see all products" ON public.products;
CREATE POLICY "Admins can see all products" ON public.products 
  FOR SELECT USING (public.is_admin());

-- Allow admins to insert/update/delete products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products 
  FOR ALL USING (public.is_admin());

-- 5. Add Policies for Product Variants
DROP POLICY IF EXISTS "Admins can manage product_variants" ON public.product_variants;
CREATE POLICY "Admins can manage product_variants" ON public.product_variants 
  FOR ALL USING (public.is_admin());

-- 6. Add Policies for Product Images
DROP POLICY IF EXISTS "Admins can manage product_images" ON public.product_images;
CREATE POLICY "Admins can manage product_images" ON public.product_images 
  FOR ALL USING (public.is_admin());

-- 7. Add Policies for Orders and Order Items (Admins can view and manage all orders)
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders 
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items" ON public.order_items 
  FOR ALL USING (public.is_admin());

-- 8. Add Policies for Users/Profiles (Admins can view all users)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles 
  FOR SELECT USING (public.is_admin());
