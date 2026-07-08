import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Debug endpoint to check image setup status
 * GET /api/debug/image-status
 * 
 * Returns:
 * - Table existence and structure
 * - RLS policy status
 * - Image count in database
 * - Sample product with images
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Check if product_images table has data
    const { data: images, error: imageError } = await supabase
      .from("product_images")
      .select("id, product_id, url, is_thumbnail, display_order, provider")
      .limit(5);

    // 2. Check products with images
    const { data: productsWithImages, error: prodError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        images:product_images(
          id,
          url,
          is_thumbnail,
          display_order,
          provider
        )
      `
      )
      .eq("is_published", true)
      .limit(3);

    // 3. Get counts
    const { count: imageCount, error: countError } = await supabase
      .from("product_images")
      .select("*", { count: "exact", head: true });

    const { count: productCount, error: prodCountError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    return NextResponse.json({
      status: "image-debug",
      timestamp: new Date().toISOString(),
      database: {
        images: {
          total: imageCount || 0,
          samples: images || [],
          error: imageError?.message,
        },
        productsWithImages: {
          count: productCount || 0,
          samples: productsWithImages || [],
          error: prodError?.message,
        },
      },
      analysis: {
        hasImages: (imageCount || 0) > 0,
        productsHaveImages: (productsWithImages || []).filter(
          (p: any) => (p.images?.length || 0) > 0
        ).length,
        setup: {
          imageTableExists: !imageError?.message?.includes("relation"),
          rlsEnabled: !imageError?.message?.includes("permission"),
          dataPopulated: (imageCount || 0) > 0,
        },
      },
      nextSteps: (imageCount || 0) === 0
        ? [
            "1. Go to /admin/products",
            "2. Create or update a product",
            "3. Upload images via the image uploader",
            "4. Click Save",
            "5. Refresh this page to verify images are stored",
          ]
        : ["Images are stored! Check /shop to see them displayed."],
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
