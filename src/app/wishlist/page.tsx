"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Heart, Package, Trash2, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type WishlistProduct = {
  name?: string;
  slug?: string;
  regular_price?: number;
  sale_price?: number;
  product_images?: { url: string }[];
  categories?: { slug: string };
  subcategories?: { slug: string };
};

type WishlistItem = {
  id: string;
  products?: WishlistProduct;
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        setUserEmail(null);
        setWishlist([]);
        setLoading(false);
        return;
      }

      setUserEmail(user.email || null);
      const { data, error } = await supabase
        .from<WishlistItem>("wishlists")
        .select("id, products(name, slug, regular_price, sale_price, product_images(url), categories (slug), subcategories (slug))")
        .eq("user_id", user.id);

      if (!error && data) {
        setWishlist(data);
      } else if (error) {
        console.error("[WISHLIST] Failed to load wishlist", error);
      }

      setLoading(false);
    };

    loadWishlist();
  }, []);

  const handleRemove = async (id: string) => {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("wishlists").delete().eq("id", id);
    if (!error) {
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent-gold">Wishlist</p>
          <h1 className="mt-3 text-4xl font-heading font-bold text-foreground">Your saved items</h1>
          <p className="mt-3 max-w-2xl text-muted">Items you have saved for later are listed below. Remove or view product details from any card.</p>
        </div>
        <Link href="/shop">
          <Button variant="secondary" className="w-full sm:w-auto">
            <ShoppingBag size={16} /> Browse products
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-surface/60 p-12 text-center text-muted">Loading your wishlist...</div>
      ) : !userEmail ? (
        <div className="rounded-3xl border border-border bg-surface/60 p-12 text-center">
          <p className="text-lg font-semibold text-foreground">Please sign in to view your wishlist.</p>
          <p className="text-sm text-muted mt-2">Your saved items are stored securely in your account.</p>
          <Link href="/login">
            <Button variant="secondary" className="mt-6">Sign In</Button>
          </Link>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface/60 p-12 text-center">
          <Heart size={36} className="mx-auto mb-4 text-accent-gold" />
          <p className="text-lg font-semibold text-foreground">Your wishlist is empty.</p>
          <p className="text-sm text-muted mt-2">Add items from the shop to keep track of them here.</p>
          <Link href="/shop">
            <Button variant="secondary" className="mt-6">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {wishlist.map((item) => {
            const product = item.products;
            const productUrl = product?.slug && product?.categories?.slug && product?.subcategories?.slug
              ? `/shop/${product.categories.slug}/${product.subcategories.slug}/${product.slug}`
              : "/shop";

            return (
              <Card key={item.id}>
                <CardHeader className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>{product?.name || "Saved Item"}</CardTitle>
                    <p className="text-sm text-muted">{product?.sale_price ? formatCurrency(product.sale_price) : formatCurrency(product?.regular_price || 0)}</p>
                  </div>
                  <Badge className="bg-accent-gold/15 text-accent-gold border-accent-gold/40">Saved</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="min-w-[110px] h-[110px] rounded-3xl overflow-hidden bg-surface border border-border relative">
                    {product?.product_images?.[0]?.url ? (
                      <Image
                        src={product.product_images[0].url}
                        alt={product.name || "Product image"}
                        width={110}
                        height={110}
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted"><Package size={36} /></div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={productUrl} className="text-sm font-semibold text-accent-gold hover:underline">View product</Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href={productUrl}>Go to product</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-error" onClick={() => handleRemove(item.id)}>
                        <Trash2 size={14} className="mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
