"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Loader2, Plus, Edit, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import ProductEditor from "./ProductEditor";

export default function ProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const hasFetched = useRef(false);
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

  const showNotice = (type: "error" | "success", message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?includeDrafts=true&limit=100").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      if (prodRes.products) setProducts(prodRes.products);
      if (catRes.categories) setCategories(catRes.categories);
    } catch {
      showNotice("error", "Failed to load data. Check connection.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
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

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed.");
      }
      showNotice("success", `Product "${name}" deleted.`);
      fetchData();
    } catch (e: any) {
      showNotice("error", e.message);
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
          <p className="text-muted text-sm mt-1">Manage inventory, pricing, and specific product data.</p>
        </div>
        <Button variant="luxury" onClick={() => openEditor()}>
          <Plus size={16} className="mr-2" /> Add Product
        </Button>
      </div>

      {/* Notice */}
      {notice && (
        <div
          className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-medium ${
            notice.type === "error"
              ? "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
          }`}
        >
          {notice.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {notice.message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-accent-gold" size={32} />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
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
                <TableCell colSpan={7} className="text-center text-muted py-8">
                  No products found. Add your first product!
                </TableCell>
              </TableRow>
            )}
            {products.map((prod) => {
              const thumb =
                prod.images?.find((img: any) => img.is_thumbnail)?.url || prod.images?.[0]?.url;
              return (
                <TableRow key={prod.id}>
                  <TableCell>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center text-muted text-xs font-heading">
                        FJ
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground dark:text-white">{prod.name}</div>
                    <div className="text-xs text-muted">SKU: {prod.sku || "N/A"}</div>
                  </TableCell>
                  <TableCell className="text-muted">
                    {prod.category?.name || prod.categories?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell className="text-foreground dark:text-white">
                    PKR {prod.regular_price?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {(prod.stock_quantity ?? 0) > 0 ? (
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
                      onClick={() => deleteProduct(prod.id, prod.name)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
