"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { useProductStore } from "@/lib/store/useProductStore";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: (f: any) => void;
}

export function FilterPanel({ isOpen, onClose, filters, setFilters }: FilterPanelProps) {
  const { categories, fetchCategories } = useProductStore();
  const [localPriceParams, setLocalPriceParams] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 2000,
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    filters.categoryIds || []
  );

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    setLocalPriceParams({ min: filters.minPrice || 0, max: filters.maxPrice || 2000 });
    setSelectedCategoryIds(filters.categoryIds || []);
  }, [filters, isOpen]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    setFilters({
      ...filters,
      categoryIds: selectedCategoryIds,
      minPrice: localPriceParams.min,
      maxPrice: localPriceParams.max,
      page: 1,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategoryIds([]);
    setLocalPriceParams({ min: 0, max: 2000 });
    setFilters({ ...filters, categoryIds: [], minPrice: 0, maxPrice: 2000, page: 1 });
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-border z-50 overflow-y-auto"
            >
              <div className="p-6 sticky top-0 bg-surface/90 backdrop-blur z-10 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-heading text-lg">
                  <SlidersHorizontal size={20} />
                  <h2>Filters</h2>
                </div>
                <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-foreground font-medium mb-4 uppercase tracking-wider text-sm">
                    Categories
                  </h3>
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => toggleCategory(cat.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategoryIds.includes(cat.id) ? "bg-accent-gold border-accent-gold" : "border-border group-hover:border-accent-gold/50"}`}
                        >
                          {selectedCategoryIds.includes(cat.id) && (
                            <Check size={14} className="text-black" />
                          )}
                        </div>
                        <span className="text-muted group-hover:text-foreground transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-foreground font-medium mb-4 uppercase tracking-wider text-sm">
                    Max Price
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={localPriceParams.max}
                      onChange={(e) =>
                        setLocalPriceParams({ ...localPriceParams, max: parseInt(e.target.value) })
                      }
                      className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent-gold"
                    />
                    <div className="flex items-center justify-between text-foreground font-medium text-sm">
                      <span>${localPriceParams.min}</span>
                      <span>${localPriceParams.max}+</span>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="pt-6 border-t border-border flex gap-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-surface-secondary text-foreground rounded hover:bg-hover-bg transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApply}
                    className="flex-1 py-3 bg-accent-gold text-black font-semibold rounded hover:bg-accent-gold/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
