"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from "@/components/ui";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import ProductEditor from "./ProductEditor";

export default function ProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const supabase = createBrowserClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get("action");

  // Sync action parameter with state
  useEffect(() => {
    if (action === "add" && !isEditorOpen) {
      setEditingProduct(null);
      setIsEditorOpen(true);
    }
  }, [action, isEditorOpen]);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
    ]);

    if (prodRes.data) setProducts(prodRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditor = (prod: any = null) => {
    setEditingProduct(prod);
    setIsEditorOpen(true);
  };

  const closeEditor = (refresh = false) => {
    setIsEditorOpen(false);
    setEditingProduct(null);
    router.replace("/admin/products");
    if (refresh) fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchData();
    }
  };

  if (isEditorOpen) {
    return <ProductEditor product={editingProduct} categories={categories} onClose={closeEditor} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground dark:text-white">Products</h2>
          <p className="text-muted text-sm mt-1">
            Manage inventory, pricing, and specific product data.
          </p>
        </div>
        <Button variant="luxury" onClick={() => openEditor()}>
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-accent-gold" size={32} />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name & SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted py-8">
                  No products found.
                </TableCell>
              </TableRow>
            )}
            {products.map((prod) => (
              <TableRow key={prod.id}>
                <TableCell>
                  <div className="font-medium text-foreground dark:text-white">{prod.name}</div>
                  <div className="text-xs text-muted">SKU: {prod.sku || "N/A"}</div>
                </TableCell>
                <TableCell className="text-muted">
                  {prod.categories?.name || "Uncategorized"}
                </TableCell>
                <TableCell className="text-foreground dark:text-white">${prod.regular_price?.toFixed(2)}</TableCell>
                <TableCell>
                  {prod.stock_quantity > 0 ? (
                    <span className="text-foreground dark:text-white">{prod.stock_quantity}</span>
                  ) : (
                    <span className="text-error">Out of Stock</span>
                  )}
                </TableCell>
                <TableCell>
                  {prod.is_published ? (
                    <Badge variant="success">Published</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditor(prod)}>
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-error hover:text-error hover:bg-error/10"
                    onClick={() => deleteProduct(prod.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
