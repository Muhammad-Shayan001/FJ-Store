import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Diagnostic endpoint for image display issues
 * GET /api/debug/image-status?action=status - Check status
 * GET /api/debug/image-status?action=create-sample - Create sample product with image
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "status";

    if (action === "status") {
      // Count images and products
      const { count: imageCount } = await supabase
        .from("product_images")
        .select("*", { count: "exact", head: true });

      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      // Get sample products with images
      const { data: productsWithImages } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          is_published,
          images:product_images(
            id,
            url,
            is_thumbnail
          )
        `
        )
        .eq("is_published", true)
        .limit(5);

      const productsHavingImages = (productsWithImages || []).filter(
        (p: any) => (p.images?.length || 0) > 0
      );

      return NextResponse.json({
        status: "ok",
        stats: {
          totalProducts: productCount || 0,
          totalImages: imageCount || 0,
          productsWithImages: productsHavingImages.length,
        },
        issue:
          (imageCount || 0) === 0
            ? "❌ NO IMAGES IN DATABASE - Need to upload products with images"
            : productsHavingImages.length === 0
              ? "❌ IMAGES EXIST BUT NOT LINKED TO PRODUCTS"
              : "✅ Images exist and are linked",
        samples: productsHavingImages.slice(0, 2),
        actions: [
          imageCount === 0
            ? "1. Go to /admin/products"
            : "1. Images exist, checking frontend...",
          "2. Add/edit a product",
          "3. Upload images",
          "4. Click Save",
          "5. Check /shop",
        ],
      });
    }

    if (action === "create-sample") {
      try {
        const adminClient = await createServiceRoleClient();

        const { data: product, error: prodErr } = await adminClient
          .from("products")
          .insert({
            name: "Sample Luxury Item",
            slug: "sample-luxury-item-" + Date.now(),
            short_description: "Beautiful sample product",
            brand: "FJ Store",
            regular_price: 99.99,
            currency: "USD",
            is_published: true,
            stock_quantity: 100,
            stock_status: "in_stock",
          })
          .select()
          .single();

        if (prodErr) throw prodErr;

        const { error: imgErr } = await adminClient
          .from("product_images")
          .insert({
            product_id: product.id,
            url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=600&fit=crop",
            is_thumbnail: true,
            display_order: 0,
            provider: "unsplash",
          });

        if (imgErr) throw imgErr;

        return NextResponse.json({
          status: "created",
          product: product,
          message: "✅ Sample product created! Go to /shop to see it.",
        });
      } catch (err) {
        return NextResponse.json(
          {
            status: "error",
            error: err instanceof Error ? err.message : "Failed to create sample",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Use ?action=status or ?action=create-sample" },
      { status: 400 }
    );
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
