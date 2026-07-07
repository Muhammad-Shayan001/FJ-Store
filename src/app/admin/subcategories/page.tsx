"use client";

import { useEffect, useState, useRef } from "react";
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

type Notice = { type: "error" | "success"; message: string };

export default function AdminSubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", category_id: "" });
  const hasFetched = useRef(false);

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
    } catch {
      showNotice("error", "Failed to load data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, []);

  const openModal = (sub: Subcategory | null = null) => {
    setEditingSub(sub);
    setFormData({
      name: sub?.name || "",
      slug: sub?.slug || "",
      category_id: sub?.category_id || "",
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim() || !formData.category_id) {
      showNotice("error", "Name, slug, and parent category are required.");
      return;
    }
    setSaving(true);
    try {
      const method = editingSub ? "PUT" : "POST";
      const body = editingSub ? { id: editingSub.id, ...formData } : formData;
      const res = await fetch("/api/subcategories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      showNotice("success", `Subcategory "${formData.name}" saved!`);
      setIsOpen(false);
      fetchData();
    } catch (e: any) {
      showNotice("error", e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface/80 to-surface/40 border border-accent-gold/10 px-6 md:px-10 py-8 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground dark:text-white mb-2">Subcategories</h1>
          <p className="text-muted">Manage product subcategories and parents.</p>
        </div>
        <Button variant="luxury" onClick={() => openModal()}>
          <Plus size={16} className="mr-2" /> Add Subcategory
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
        <div className="max-w-7xl mx-auto">
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
                    No subcategories found. Add your first one!
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
                      <Badge variant={sub.is_active ? "success" : "outline"}>{sub.is_active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openModal(sub)}>
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-error hover:text-error hover:bg-error/10"
                        onClick={() => handleDelete(sub.id, sub.name)}
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
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingSub ? "Edit Subcategory" : "Add Subcategory"}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Parent Category *</label>
            <select
              className="w-full mt-1 bg-surface/50 border border-border rounded-md h-10 px-3 text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                })
              }
              placeholder="e.g. Lipsticks"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground dark:text-white">Slug *</label>
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
            onClick={handleSave}
            disabled={saving || !formData.category_id || !formData.name}
          >
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            {saving ? "Saving..." : "Save Subcategory"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
