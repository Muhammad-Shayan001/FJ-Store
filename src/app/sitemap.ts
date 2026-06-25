import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fj-store.com';
  const supabase = await createClient();

  // Fetch dynamic routes
  const { data: categories } = await supabase.from('categories').select('slug');
  const { data: products } = await supabase.from('products').select('slug, updated_at, categories(slug), subcategories(slug)');

  const categoryUrls = (categories || []).map((cat) => ({
    url: `${baseUrl}/shop/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const productUrls = (products || []).map((prod: any) => ({
    url: `${baseUrl}/shop/${prod.categories?.slug || 'category'}/${prod.subcategories?.slug || 'subcategory'}/${prod.slug}`,
    lastModified: new Date(prod.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
