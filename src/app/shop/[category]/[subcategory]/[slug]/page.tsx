import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductContent from "./ProductContent";

export const revalidate = 3600; // ISR Revalidation every 1 hour

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, short_description, product_images(url)")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Product Not Found" };

  const defaultImage = product.product_images?.[0]?.url || "";

  return {
    title: `${product.name} | FJ Store`,
    description: product.short_description || `Buy ${product.name} at FJ Store.`,
    openGraph: {
      title: product.name,
      description: product.short_description || `Buy ${product.name} at FJ Store.`,
      images: defaultImage ? [{ url: defaultImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.short_description || `Buy ${product.name} at FJ Store.`,
      images: defaultImage ? [defaultImage] : [],
    },
  };
}


export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ category: string; subcategory: string; slug: string }> 
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories(name, slug),
      subcategories(name, slug),
      product_images(url, is_thumbnail),
      product_variants(name, value, additional_price),
      reviews(*)
    `)
    .eq("slug", slug)
    .single();

  if (!product) return notFound();

  // Generate JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.product_images?.map((img: any) => img.url),
    description: product.full_description || product.short_description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "FJ Store",
    },
    offers: {
      "@type": "Offer",
      url: `https://fj-store.com/shop/${product.categories?.slug}/${product.subcategories?.slug}/${product.slug}`,
      priceCurrency: "USD",
      price: product.sale_price || product.regular_price,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-24 pb-12">
        <ProductContent product={product} />
      </div>
    </>
  );
}
