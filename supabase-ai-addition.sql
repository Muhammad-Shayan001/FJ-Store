-- FJ Store: AI Features Addition
-- Execute this in Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create index for fast similarity search
CREATE INDEX IF NOT EXISTS products_embedding_idx ON products 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 4. Create match_products RPC function for semantic search
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  short_description text,
  regular_price numeric,
  sale_price numeric,
  brand text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.short_description,
    p.regular_price,
    p.sale_price,
    p.brand,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE p.is_published = true
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
