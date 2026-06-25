-- FJ Store Update: APPEND ONLY - Do not overwrite previous blocks.
-- Execute this block in the Supabase SQL editor to add the storage bucket.

-- Create documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage (Documents)
-- Allow users to upload to their own folder: invoices/[user_id]/[order_id].pdf
DROP POLICY IF EXISTS "Users can upload their own invoices" ON storage.objects;
CREATE POLICY "Users can upload their own invoices"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to view their own invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON storage.objects;
CREATE POLICY "Users can view their own invoices"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow admins to view all documents (assuming admins bypass RLS or we add a role check)
-- For simplicity, if role system is simple:
DROP POLICY IF EXISTS "Admins can view all invoices" ON storage.objects;
CREATE POLICY "Admins can view all invoices"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'documents' 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
