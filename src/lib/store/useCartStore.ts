import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, ProductVariant } from "@/lib/types/product";
import { createClient } from "@/lib/supabase/client";

export interface CartItem {
  id: string; // unique generated ID for cart line item
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  min_order_amount: number;
}

interface CartState {
  items: CartItem[];
  savedItems: CartItem[];
  coupon: Coupon | null;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  applyCoupon: (code: string) => Promise<"success" | "invalid" | "min_not_met" | "error">;
  removeCoupon: () => void;
  clearCart: () => void;
  get subtotal(): number;
  get shipping(): number;
  get discount(): number;
  get total(): number;
  get totalItems(): number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],
      coupon: null,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.variant?.id === variant?.id
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems };
          }

          return {
            items: [
              ...state.items,
              {
                id: Math.random().toString(36).substring(7),
                product,
                variant,
                quantity,
              },
            ],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },

      saveForLater: (id) => {
        set((state) => {
          const itemToSave = state.items.find((item) => item.id === id);
          if (!itemToSave) return state;
          return {
            items: state.items.filter((item) => item.id !== id),
            savedItems: [...state.savedItems, itemToSave],
          };
        });
      },

      moveToCart: (id) => {
        set((state) => {
          const itemToMove = state.savedItems.find((item) => item.id === id);
          if (!itemToMove) return state;

          // Check if already in cart to merge quantities, else add new
          const existingCartIndex = state.items.findIndex(
            (item) =>
              item.product.id === itemToMove.product.id &&
              item.variant?.id === itemToMove.variant?.id
          );

          if (existingCartIndex > -1) {
            const activeItems = [...state.items];
            activeItems[existingCartIndex].quantity += itemToMove.quantity;
            return {
              savedItems: state.savedItems.filter((item) => item.id !== id),
              items: activeItems,
            };
          }

          return {
            savedItems: state.savedItems.filter((item) => item.id !== id),
            items: [...state.items, itemToMove],
          };
        });
      },

      applyCoupon: async (code: string) => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code.toUpperCase())
            .eq("is_active", true)
            .single();

          if (error || !data) return "invalid";

          const subtotal = get().subtotal;
          if (subtotal < (data.min_order_amount || 0)) {
            return "min_not_met";
          }

          set({ coupon: data as Coupon });
          return "success";
        } catch (e) {
          return "error";
        }
      },

      removeCoupon: () => set({ coupon: null }),

      clearCart: () => set({ items: [], coupon: null }),

      get subtotal() {
        return get().items.reduce((total, item) => {
          const price = item.product.sale_price || item.product.regular_price;
          const variantPrice = item.variant?.additional_price || 0;
          return total + (price + variantPrice) * item.quantity;
        }, 0);
      },

      get shipping() {
        if (get().totalItems === 0) return 0;
        if (get().coupon?.discount_type === "free_shipping") return 0;
        return 15; // standard shipping $15
      },

      get discount() {
        const coupon = get().coupon;
        if (!coupon) return 0;
        const sub = get().subtotal;

        if (coupon.discount_type === "percentage") {
          return sub * (coupon.discount_value / 100);
        }
        if (coupon.discount_type === "fixed") {
          return Math.min(sub, coupon.discount_value);
        }
        return 0; // free shipping doesn't affect subtotal discount
      },

      get total() {
        const final = get().subtotal + get().shipping - get().discount;
        return Math.max(0, final);
      },

      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "fj-cart-storage",
    }
  )
);
