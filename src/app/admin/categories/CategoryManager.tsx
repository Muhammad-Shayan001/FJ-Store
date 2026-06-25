"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
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
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  // Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Form State
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", category_id: "" });

  const fetchData = async () => {
    setLoading(true);
    const [catRes, subRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("subcategories").select("*").order("name"),
    ]);

    if (catRes.data) setCategories(catRes.data);
    if (subRes.data) setSubcategories(subRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCategoryModal = (cat: Category | null = null) => {
    setEditingCat(cat);
    setFormData({ name: cat?.name || "", slug: cat?.slug || "", category_id: "" });
    setIsCatModalOpen(true);
  };

  const openSubcategoryModal = (sub: Subcategory | null = null, catId = "") => {
    setEditingSub(sub);
    setFormData({
      name: sub?.name || "",
      slug: sub?.slug || "",
      category_id: sub?.category_id || catId,
    });
    setIsSubModalOpen(true);
  };

  const saveCategory = async () => {
    try {
      if (editingCat) {
        await supabase
          .from("categories")
          .update({ name: formData.name, slug: formData.slug })
          .eq("id", editingCat.id);
      } else {
        await supabase.from("categories").insert({ name: formData.name, slug: formData.slug });
      }
      setIsCatModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const saveSubcategory = async () => {
    try {
      if (editingSub) {
        await supabase
          .from("subcategories")
          .update({ name: formData.name, slug: formData.slug, category_id: formData.category_id })
          .eq("id", editingSub.id);
      } else {
        await supabase
          .from("subcategories")
          .insert({ name: formData.name, slug: formData.slug, category_id: formData.category_id });
      }
      setIsSubModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm("Delete this category? This will delete all subcategories and unlink products.")) {
      await supabase.from("categories").delete().eq("id", id);
      fetchData();
    }
  };

  const deleteSubcategory = async (id: string) => {
    if (confirm("Delete this subcategory?")) {
      await supabase.from("subcategories").delete().eq("id", id);
      fetchData();
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
      {/* Categories Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold text-foreground dark:text-foreground dark:text-white">Categories</h2>
          <Button variant="luxury" onClick={() => openCategoryModal()}>
            <Plus size={16} className="mr-2" /> Add Category
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted py-8">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium text-foreground dark:text-foreground dark:text-white">{cat.name}</TableCell>
                <TableCell className="text-muted">{cat.slug}</TableCell>
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
                    onClick={() => deleteCategory(cat.id)}
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
          <h2 className="text-2xl font-heading font-bold text-foreground dark:text-foreground dark:text-white">Subcategories</h2>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted py-8">
                  No subcategories found.
                </TableCell>
              </TableRow>
            )}
            {subcategories.map((sub) => {
              const parent = categories.find((c) => c.id === sub.category_id);
              return (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-foreground dark:text-foreground dark:text-white">{sub.name}</TableCell>
                  <TableCell className="text-accent-gold">{parent?.name || "Unknown"}</TableCell>
                  <TableCell className="text-muted">{sub.slug}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openSubcategoryModal(sub)}>
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-error hover:text-error hover:bg-error/10"
                      onClick={() => deleteSubcategory(sub.id)}
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

      {/* Modals */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCat ? "Edit Category" : "Add Category"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Name</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              placeholder="e.g. Cosmetics"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Slug</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. cosmetics"
              className="mt-1"
            />
          </div>
          <Button variant="luxury" className="w-full mt-4" onClick={saveCategory}>
            Save Category
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title={editingSub ? "Edit Subcategory" : "Add Subcategory"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Parent Category</label>
            <select
              className="w-full mt-1 bg-surface/50 border border-border rounded-md h-10 px-3 text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
            <label className="text-sm font-medium text-foreground dark:text-white">Name</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              placeholder="e.g. Lipsticks"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Slug</label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. lipsticks"
              className="mt-1"
            />
          </div>
          <Button
            variant="luxury"
            className="w-full mt-4"
            onClick={saveSubcategory}
            disabled={!formData.category_id}
          >
            Save Subcategory
          </Button>
        </div>
      </Modal>
    </div>
  );
}
