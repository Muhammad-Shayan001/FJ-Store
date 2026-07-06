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

    try {
      const params = new URLSearchParams({
        published: "true",
        page: String(filters?.page || 1),
        limit: String(filters?.limit || 12),
        sort: filters?.sort || "newest",
      });

      if (filters?.keyword) {
        params.set("keyword", filters.keyword);
      }
      if (filters?.category) {
        params.set("category", filters.category);
      }
      if (filters?.minPrice !== undefined) {
        params.set("minPrice", String(filters.minPrice));
      }
      if (filters?.maxPrice !== undefined) {
        params.set("maxPrice", String(filters.maxPrice));
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load products.");
      }

      set({ products: data.products as Product[], totalCount: data.totalCount || 0 });
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
