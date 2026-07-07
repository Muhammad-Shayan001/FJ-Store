"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Modal,
  Input,
  Badge,
} from "@/components/ui";
import { Loader2, Plus, Edit, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ProductImage } from "@/lib/types/product";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type Notice = { type: "error" | "success"; message: string };

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Form State
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "", image_url: "" });
  const [catImages, setCatImages] = useState<ProductImage[]>([]);
  const [subForm, setSubForm] = useState({ name: "", slug: "", category_id: "" });

  const showNotice = (type: "error" | "success", message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, subRes] = await Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/subcategories").then((r) => r.json()),
      ]);
      if (catRes.categories) setCategories(catRes.categories);
      if (subRes.subcategories) setSubcategories(subRes.subcategories);
    } catch (e) {
      showNotice("error", "Failed to load data. Check your network.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCategoryModal = (cat: Category | null = null) => {
    setEditingCat(cat);
    setCatForm({
      name: cat?.name || "",
      slug: cat?.slug || "",
      description: cat?.description || "",
      image_url: cat?.image_url || "",
    });
    setCatImages(cat?.image_url ? [{ id: "", product_id: "", url: cat.image_url, is_thumbnail: true, display_order: 0 }] : []);
    setIsCatModalOpen(true);
    setNotice(null);
  };

  const openSubcategoryModal = (sub: Subcategory | null = null) => {
    setEditingSub(sub);
    setSubForm({
      name: sub?.name || "",
      slug: sub?.slug || "",
      category_id: sub?.category_id || "",
    });
    setIsSubModalOpen(true);
    setNotice(null);
  };

  const saveCategory = async () => {
    if (!catForm.name.trim() || !catForm.slug.trim()) {
      showNotice("error", "Name and slug are required.");
      return;
    }
    setSaving(true);
    try {
      const imageUrl = catImages[0]?.url || catForm.image_url || null;
      const payload = { ...catForm, image_url: imageUrl };
      const method = editingCat ? "PUT" : "POST";
      const body = editingCat ? { id: editingCat.id, ...payload } : payload;

      const res = await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save category.");
      showNotice("success", `Category "${catForm.name}" saved successfully!`);
      setIsCatModalOpen(false);
      fetchData();
    } catch (e: any) {
      showNotice("error", e.message);
    }
    setSaving(false);
  };

  const saveSubcategory = async () => {
    if (!subForm.name.trim() || !subForm.slug.trim() || !subForm.category_id) {
      showNotice("error", "Name, slug, and parent category are required.");
      return;
    }
    setSaving(true);
    try {
      const method = editingSub ? "PUT" : "POST";
      const body = editingSub ? { id: editingSub.id, ...subForm } : subForm;
      const res = await fetch("/api/subcategories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save subcategory.");
      showNotice("success", `Subcategory "${subForm.name}" saved successfully!`);
      setIsSubModalOpen(false);
      fetchData();
    } catch (e: any) {
      showNotice("error", e.message);
    }
    setSaving(false);
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will unlink all products.`)) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotice("success", "Category deleted.");
      fetchData();
    } catch (e: any) {
      showNotice("error", e.message || "Delete failed.");
    }
  };

  const deleteSubcategory = async (id: string, name: string) => {
    if (!confirm(`Delete subcategory "${name}"?`)) return;
    try {
      const res = await fetch(`/api/subcategories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotice("success", "Subcategory deleted.");
      fetchData();
    } catch (e: any) {
      showNotice("error", e.message || "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-accent-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Global Notice */}
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

      {/* Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground dark:text-white">Categories</h2>
            <p className="text-muted text-sm mt-1">Manage top-level product categories.</p>
          </div>
          <Button variant="luxury" onClick={() => openCategoryModal()}>
            <Plus size={16} className="mr-2" /> Add Category
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted py-8">
                  No categories yet. Add your first one!
                </TableCell>
              </TableRow>
            )}
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-muted text-xs">No img</div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-foreground dark:text-white">{cat.name}</TableCell>
                <TableCell className="text-muted font-mono text-xs">{cat.slug}</TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openCategoryModal(cat)}>
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-error hover:text-error hover:bg-error/10"
                    onClick={() => deleteCategory(cat.id, cat.name)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Subcategories Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground dark:text-white">Subcategories</h2>
            <p className="text-muted text-sm mt-1">Organize products under their parent categories.</p>
          </div>
          <Button variant="outline" onClick={() => openSubcategoryModal()}>
            <Plus size={16} className="mr-2" /> Add Subcategory
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted py-8">
                  No subcategories yet.
                </TableCell>
              </TableRow>
            )}
            {subcategories.map((sub) => {
              const parent = categories.find((c) => c.id === sub.category_id);
              return (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-foreground dark:text-white">{sub.name}</TableCell>
                  <TableCell className="text-accent-gold font-medium">{parent?.name || "Unknown"}</TableCell>
                  <TableCell className="text-muted font-mono text-xs">{sub.slug}</TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openSubcategoryModal(sub)}>
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-error hover:text-error hover:bg-error/10"
                      onClick={() => deleteSubcategory(sub.id, sub.name)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCat ? "Edit Category" : "Add Category"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Name *</label>
            <Input
              value={catForm.name}
              onChange={(e) =>
                setCatForm({ ...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })
              }
              placeholder="e.g. Cosmetics"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Slug *</label>
            <Input
              value={catForm.slug}
              onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
              placeholder="e.g. cosmetics"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Description</label>
            <textarea
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              placeholder="Optional description"
              className="w-full mt-1 h-20 p-3 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white mb-2 block">Category Image</label>
            <ImageUpload
              multiple={false}
              existingImages={catImages}
              onUploadSuccess={(img) => setCatImages([img])}
              onRemove={() => setCatImages([])}
            />
          </div>
          <Button variant="luxury" className="w-full mt-4" onClick={saveCategory} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            {saving ? "Saving..." : "Save Category"}
          </Button>
        </div>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title={editingSub ? "Edit Subcategory" : "Add Subcategory"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Parent Category *</label>
            <select
              className="w-full mt-1 bg-surface/50 border border-border rounded-md h-10 px-3 text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
              value={subForm.category_id}
              onChange={(e) => setSubForm({ ...subForm, category_id: e.target.value })}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Name *</label>
            <Input
              value={subForm.name}
              onChange={(e) =>
                setSubForm({ ...subForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })
              }
              placeholder="e.g. Lipsticks"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Slug *</label>
            <Input
              value={subForm.slug}
              onChange={(e) => setSubForm({ ...subForm, slug: e.target.value })}
              placeholder="e.g. lipsticks"
              className="mt-1"
            />
          </div>
          <Button
            variant="luxury"
            className="w-full mt-4"
            onClick={saveSubcategory}
            disabled={saving || !subForm.category_id || !subForm.name}
          >
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            {saving ? "Saving..." : "Save Subcategory"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
