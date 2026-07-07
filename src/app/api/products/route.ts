import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getServiceRoleClient() {
  return await createClient();
}

function sanitizeProductPayload(payload: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};

  const allowedColumns = [
    "id",
    "category_id",
    "subcategory_id",
    "name",
    "slug",
    "short_description",
    "full_description",
    "brand",
    "sku",
    "barcode",
    "tags",
    "regular_price",
    "sale_price",
    "cost_price",
    "tax_rate",
    "currency",
    "is_published",
    "expiry_date",
    "manufacturing_date",
    "calories",
    "ingredients",
    "is_halal",
    "allergy_info",
    "skin_type",
    "is_chemical_free",
    "is_dermatologist_tested",
    "handmade",
    "bridal",
    "stone_type",
    "stock_quantity",
    "stock_status",
    "warehouse",
    "shade",
    "video_url",
    "image_360_urls",
  ];

  for (const key of allowedColumns) {
    if (key in payload) {
      const value = payload[key];
      if (value === "" || value === undefined) {
        if (key === "category_id" || key === "subcategory_id") {
          normalized[key] = null;
        } else if (key === "sale_price" || key === "cost_price") {
          normalized[key] = null;
        } else if (key === "expiry_date" || key === "manufacturing_date") {
          normalized[key] = null;
        } else if (key === "calories") {
          normalized[key] = null;
        } else if (Array.isArray(value)) {
          normalized[key] = value;
        }
        continue;
      }
      normalized[key] = value;
    }
  }

  if (!normalized.slug && normalized.name) {
    normalized.slug = String(normalized.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  if (!normalized.currency) {
    normalized.currency = "USD";
  }

  return normalized;
}

export async function GET(request: Request) {
  try {
    const supabase = await getServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const published = searchParams.get("published") !== "false";
    const includeDrafts = searchParams.get("includeDrafts") === "true";
    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "12", 10);

    let query: any = supabase
      .from("products")
      .select(
        `
          *,
          images:product_images(*),
          variants:product_variants(*),
          category:categories(*)
        `,
        { count: "exact" }
      );

    if (!includeDrafts && published) {
      query = query.eq("is_published", true);
    }

    if (slug) {
      query = query.eq("slug", slug).single();
      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ product: data });
    }

    if (keyword) {
      query = query.ilike("name", `%${keyword}%`);
    }

    if (category) {
      query = query.eq("category.slug", category);
    }

    if (minPrice) {
      query = query.gte("regular_price", Number(minPrice));
    }

    if (maxPrice) {
      query = query.lte("regular_price", Number(maxPrice));
    }

    if (sort === "price_asc") {
      query = query.order("regular_price", { ascending: true });
    } else if (sort === "price_desc") {
      query = query.order("regular_price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data || [], totalCount: count || 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load products.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return saveProduct(request, "insert");
}

export async function PUT(request: Request) {
  return saveProduct(request, "update");
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Product id is required." }, { status: 400 });
    const supabase = await getServiceRoleClient();
    // Delete related images first
    await supabase.from("product_images").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

async function saveProduct(request: Request, mode: "insert" | "update") {
  try {
    const body = await request.json().catch(() => ({}));
    const payload = sanitizeProductPayload(body || {});
    const images = Array.isArray(body.images) ? body.images : [];

    if (mode === "update") {
      if (!payload.id) {
        return NextResponse.json({ error: "Product id is required for updates." }, { status: 400 });
      }
    }

    const supabase = await getServiceRoleClient();

    let response: { error: { message?: string } | null; data: any };
    if (mode === "update") {
      response = await supabase.from("products").update(payload).eq("id", payload.id).select().single();
    } else {
      response = await supabase.from("products").insert(payload).select().single();
    }

    if (response?.error) {
      return NextResponse.json({ error: response.error?.message || "Failed to save product." }, { status: 500 });
    }

    const productId = response.data.id;

    // Handle product images
    if (productId) {
      // Clear existing images for this product
      await supabase.from("product_images").delete().eq("product_id", productId);

      // Insert new images
      if (images.length > 0) {
        const imagePayloads = images.map((img: any, index: number) => ({
          product_id: productId,
          url: img.url,
          is_thumbnail: img.is_thumbnail ?? (index === 0),
          display_order: img.display_order ?? index,
          provider: img.provider || "url",
          public_id: img.public_id || null,
          file_size: img.file_size || null,
          mime_type: img.mime_type || null,
        }));
        const imageRes = await supabase.from("product_images").insert(imagePayloads);
        if (imageRes.error) {
          console.error("Failed to save product images:", imageRes.error);
        }
      }
    }

    return NextResponse.json({ product: response?.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
