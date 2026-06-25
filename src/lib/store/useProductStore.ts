import { create } from "zustand";
import { Product, Category } from "@/lib/types/product";
import { createClient } from "../supabase/client";

interface ProductState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  totalCount: number;
  fetchCategories: () => Promise<void>;
  fetchProducts: (filters?: any) => Promise<void>;
  getProductBySlug: (slug: string) => Promise<Product | null>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  totalCount: 0,
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from("categories").select("*").eq("is_active", true);

    if (error) {
      console.error(error);
      return;
    }
    set({ categories: data as Category[] });
  },

  fetchProducts: async (filters) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    try {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          images:product_images(*),
          variants:product_variants(*),
          category:categories(*)
        `,
          { count: "exact" }
        )
        .eq("is_published", true);

      // Apply basic filters if any
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in("category.name", filters.categories); /* if using names, better id, wait */
      } else if (filters?.category) {
        query = query.eq("category.slug", filters.category);
      }

      if (filters?.keyword) {
        query = query.ilike("name", `%${filters.keyword}%`);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte("regular_price", filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("regular_price", filters.maxPrice);
      }

      if (filters?.sort === "price_asc") {
        query = query.order("regular_price", { ascending: true });
      } else if (filters?.sort === "price_desc") {
        query = query.order("regular_price", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false }); // Newest default
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;
      set({ products: data as unknown as Product[], totalCount: count || 0 });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  getProductBySlug: async (slug: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        images:product_images(*),
        variants:product_variants(*),
        category:categories(*)
      `
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) return null;
    return data as unknown as Product;
  },
}));
