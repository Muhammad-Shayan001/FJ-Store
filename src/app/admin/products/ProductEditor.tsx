"use client";

import { useState } from "react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { ArrowLeft, Save, Sparkles, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ProductImage } from "@/lib/types/product";

type ProductLike = {
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  category_id?: string;
  short_description?: string;
  full_description?: string;
  brand?: string;
  regular_price?: number;
  sale_price?: string | number | null;
  cost_price?: string | number | null;
  tax_rate?: number;
  stock_quantity?: number;
  stock_status?: string;
  warehouse?: string;
  is_published?: boolean;
  skin_type?: string[] | null;
  shade?: string;
  expiry_date?: string | null;
  calories?: string | number | null;
  stone_type?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[] | null;
  tags?: string[] | null;
};

type CategoryLike = {
  id?: string;
  name?: string;
};

type AiPreviewData = {
  title?: string;
  short_description?: string;
  full_description?: string;
  seo_title?: string;
  seo_description?: string;
  keywords?: string[];
  tags?: string[];
};

type ProductFormData = {
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  short_description: string;
  full_description: string;
  brand: string;
  regular_price: number;
  sale_price: string;
  cost_price: string;
  tax_rate: number;
  stock_quantity: number;
  stock_status: string;
  warehouse: string;
  is_published: boolean;
  skin_type: string;
  shade: string;
  expiry_date: string;
  calories: string;
  stone_type: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  tags: string;
  images: ProductImage[];
};

export default function ProductEditor({
  product,
  categories,
  onClose,
}: {
  product?: ProductLike;
  categories: CategoryLike[];
  onClose: (refresh?: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    category_id: product?.category_id || "",
    short_description: product?.short_description || "",
    full_description: product?.full_description || "",
    brand: product?.brand || "",
    regular_price: product?.regular_price || 0,
    sale_price: product?.sale_price != null ? String(product.sale_price) : "",
    cost_price: product?.cost_price != null ? String(product.cost_price) : "",
    tax_rate: product?.tax_rate || 0,
    stock_quantity: product?.stock_quantity || 0,
    stock_status: product?.stock_status || "in_stock",
    warehouse: product?.warehouse || "",
    is_published: product?.is_published || false,
    // Conditional
    skin_type: product?.skin_type?.join(", ") || "",
    shade: product?.shade || "",
    expiry_date: product?.expiry_date || "",
    calories: product?.calories != null ? String(product.calories) : "",
    stone_type: product?.stone_type || "",
    // SEO Fields
    seo_title: product?.seo_title || "",
    seo_description: product?.seo_description || "",
    seo_keywords: product?.seo_keywords?.join(", ") || "",
    tags: product?.tags?.join(", ") || "",
    images: (product as any)?.images || [],
  });

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState<AiPreviewData | null>(null);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const formatNoticeMessage = (message: string) => {
    const normalized = message.toLowerCase();
    if (normalized.includes("service role") || normalized.includes("service-role")) {
      return "Product actions are currently unavailable because the Supabase service-role credentials are not configured. Please contact the site administrator to enable backend product syncing.";
    }

    return message;
  };

  const handleAiGenerate = async () => {
    if (!formData.name) {
      setNotice({ type: "error", message: "Please enter a product name first." });
      return;
    }
    setNotice(null);
    setAiLoading(true);
    try {
      const categoryName = categories.find((c) => c.id === formData.category_id)?.name || "";
      const res = await fetch("/api/ai/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          category: categoryName,
          brand: formData.brand,
          features: formData.short_description,
          material: formData.stone_type,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setNotice({ type: "error", message: formatNoticeMessage(data.error) });
      } else {
        setNotice(null);
        setAiPreviewData(data);
        setShowAiPreview(true);
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "error", message: "We could not generate AI content right now. Please try again in a moment." });
    }
    setAiLoading(false);
  };

  const acceptAiGeneration = () => {
    if (aiPreviewData) {
      setFormData((prev) => ({
        ...prev,
        name: aiPreviewData.title || prev.name,
        short_description: aiPreviewData.short_description || prev.short_description,
        full_description: aiPreviewData.full_description || prev.full_description,
        seo_title: aiPreviewData.seo_title || prev.seo_title,
        seo_description: aiPreviewData.seo_description || prev.seo_description,
        seo_keywords: aiPreviewData.keywords?.join(", ") || prev.seo_keywords,
        tags: aiPreviewData.tags?.join(", ") || prev.tags,
        slug: (aiPreviewData.title || prev.name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
      setShowAiPreview(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const payload: Record<string, unknown> = { ...formData };
      payload.skin_type =
        typeof payload.skin_type === "string" && payload.skin_type
          ? payload.skin_type.split(",").map((s) => s.trim())
          : null;
      payload.tags =
        typeof payload.tags === "string" && payload.tags
          ? payload.tags.split(",").map((s) => s.trim())
          : null;
      payload.seo_keywords =
        typeof payload.seo_keywords === "string" && payload.seo_keywords
          ? payload.seo_keywords.split(",").map((s) => s.trim())
          : null;
      if (typeof payload.sale_price === "string" && payload.sale_price.trim()) {
        const parsedSalePrice = Number.parseFloat(payload.sale_price);
        payload.sale_price = Number.isNaN(parsedSalePrice) ? null : parsedSalePrice;
      } else {
        payload.sale_price = null;
      }
      if (typeof payload.cost_price === "string" && payload.cost_price.trim()) {
        const parsedCostPrice = Number.parseFloat(payload.cost_price);
        payload.cost_price = Number.isNaN(parsedCostPrice) ? null : parsedCostPrice;
      } else {
        payload.cost_price = null;
      }
      if (!payload.expiry_date) payload.expiry_date = null;
      if (typeof payload.calories === "string" && payload.calories.trim()) {
        const parsedCalories = Number.parseFloat(payload.calories);
        payload.calories = Number.isNaN(parsedCalories) ? null : parsedCalories;
      } else if (!payload.calories) {
        payload.calories = null;
      }

      const response = await fetch("/api/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: product?.id, images: formData.images }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to save product.");
      }

      setNotice({ type: "success", message: "Product saved successfully." });
      window.setTimeout(() => {
        onClose(true);
      }, 800);
    } catch (error) {
      console.error(error);
      setNotice({
        type: "error",
        message: formatNoticeMessage(error instanceof Error ? error.message : "Failed to save product."),
      });
    }
    setSaving(false);
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "images", label: "Images" },
    { id: "content", label: "Content & Description" },
    { id: "pricing", label: "Pricing & Inventory" },
    { id: "seo", label: "SEO & Tags" },
    { id: "specifics", label: "Conditional Specs" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-surface/50 p-4 rounded-xl border border-border/50">
        <Button variant="ghost" onClick={() => onClose()}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <div className="font-heading font-medium text-foreground dark:text-white">
          {product ? "Edit Product" : "New Product"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAiGenerate} disabled={aiLoading}>
            {aiLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Sparkles size={16} className="mr-2" />}
            {aiLoading ? "Generating..." : "AI Generate ✨"}
          </Button>
          <Button variant="luxury" onClick={handleSave} disabled={saving}>
            <Save size={16} className="mr-2" /> {saving ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-2xl border px-4 py-3 shadow-sm ${notice.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {notice.type === "error" ? <AlertCircle size={18} className="mt-0.5" /> : <CheckCircle2 size={18} className="mt-0.5" />}
              <div>
                <p className="font-semibold">
                  {notice.type === "error" ? "We hit a snag" : "Everything looks good"}
                </p>
                <p className="text-sm opacity-90">{notice.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded-full p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-border/50 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.id ? "bg-accent-gold/20 text-accent-gold" : "text-muted hover:text-foreground dark:text-white hover:bg-black/5 dark:bg-white/5"}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {activeTab === "basic" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Product Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\\s+/g, "-"),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">SKU</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Brand</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Category</label>
                <select
                  className="w-full h-10 px-3 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">No Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Short Description</label>
                <textarea
                  className="w-full h-20 p-3 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief 1-2 sentence description"
                />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  id="pub"
                />
                <label htmlFor="pub" className="text-foreground dark:text-white">
                  Publish Product (Visible to Customers)
                </label>
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-foreground dark:text-white mb-2">Product Gallery</h3>
              <ImageUpload
                multiple
                existingImages={formData.images}
                onUploadSuccess={(img) => setFormData(prev => ({ ...prev, images: [...prev.images, img] }))}
                onRemove={(url) => setFormData(prev => ({ ...prev, images: prev.images.filter((i) => i.url !== url) }))}
              />
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Full Description (HTML)</label>
                <textarea
                  className="w-full h-48 p-3 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold font-mono text-xs"
                  value={formData.full_description}
                  onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                  placeholder="HTML formatted description with <p>, <ul>, <li> tags"
                />
              </div>
              <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-lg p-4">
                <p className="text-xs text-muted mb-2">Preview:</p>
                <div
                  className="text-sm text-foreground dark:text-white prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.full_description }}
                />
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <h3 className="text-accent-gold mb-2 font-medium">Pricing</h3>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Regular Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.regular_price}
                  onChange={(e) =>
                    setFormData({ ...formData, regular_price: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Sale Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Cost Price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  placeholder="Internal use"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Tax Rate (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="col-span-2 mt-6">
                <h3 className="text-accent-gold mb-2 font-medium">Inventory</h3>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Stock Quantity</label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Stock Status</label>
                <select
                  className="w-full h-10 px-3 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
                  value={formData.stock_status}
                  onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                >
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="backorder">On Backorder</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Warehouse Location</label>
                <Input
                  value={formData.warehouse}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  placeholder="e.g. Rack A-12"
                />
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">SEO Title</label>
                <Input
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  placeholder="Max 60 characters"
                  maxLength={60}
                />
                <p className="text-xs text-muted">{formData.seo_title.length}/60 characters</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">SEO Description</label>
                <textarea
                  className="w-full h-24 p-3 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  placeholder="Max 155 characters"
                  maxLength={155}
                />
                <p className="text-xs text-muted">{formData.seo_description.length}/155 characters</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">SEO Keywords (Comma separated)</label>
                <Input
                  value={formData.seo_keywords}
                  onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground dark:text-white">Product Tags (Comma separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3, tag4, tag5"
                />
              </div>
            </div>
          )}

          {activeTab === "specifics" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 text-muted text-sm mb-2">
                Fill only fields relevant to this product type.
              </div>

              <div className="space-y-4 p-4 border border-border/50 rounded-xl bg-white/2">
                <h4 className="text-accent-blue font-medium">Cosmetics</h4>
                <div className="space-y-2">
                  <label className="text-sm text-foreground dark:text-white">Shade</label>
                  <Input
                    value={formData.shade}
                    onChange={(e) => setFormData({ ...formData, shade: e.target.value })}
                    placeholder="e.g. Crimson Red"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground dark:text-white">Skin Type (Comma separated)</label>
                  <Input
                    value={formData.skin_type}
                    onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                    placeholder="e.g. Oily, Dry, All"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 border border-border/50 rounded-xl bg-white/2">
                <h4 className="text-success font-medium">Food / Edibles</h4>
                <div className="space-y-2">
                  <label className="text-sm text-foreground dark:text-white">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground dark:text-white">Calories</label>
                  <Input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="per serving"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 border border-border/50 rounded-xl bg-white/2 col-span-2 md:col-span-1">
                <h4 className="text-accent-gold font-medium">Jewelry / Bangles</h4>
                <div className="space-y-2">
                  <label className="text-sm text-foreground dark:text-white">Stone Type</label>
                  <Input
                    value={formData.stone_type}
                    onChange={(e) => setFormData({ ...formData, stone_type: e.target.value })}
                    placeholder="e.g. Diamond, Ruby"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Preview Modal */}
      {showAiPreview && aiPreviewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-heading text-accent-gold">AI Generated Content Preview</h3>
                <button
                  onClick={() => setShowAiPreview(false)}
                  className="text-muted hover:text-foreground dark:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 border-b border-border/50 pb-4">
                <div>
                  <p className="text-xs text-muted mb-1">Title</p>
                  <p className="text-foreground dark:text-white font-medium">{aiPreviewData.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Short Description</p>
                  <p className="text-foreground dark:text-white text-sm">{aiPreviewData.short_description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Full Description</p>
                  <div
                    className="text-foreground dark:text-white text-sm prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: aiPreviewData.full_description || "" }}
                  />
                </div>
              </div>

              <div className="space-y-3 border-b border-border/50 pb-4">
                <div>
                  <p className="text-xs text-muted mb-1">SEO Title</p>
                  <p className="text-foreground dark:text-white text-sm">{aiPreviewData.seo_title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">SEO Description</p>
                  <p className="text-foreground dark:text-white text-sm">{aiPreviewData.seo_description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {aiPreviewData.keywords?.map((k: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs rounded">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {aiPreviewData.tags?.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-accent-blue/20 text-accent-blue text-xs rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAiPreview(false)}>
                  Cancel
                </Button>
                <Button variant="luxury" onClick={acceptAiGeneration}>
                  Accept & Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
