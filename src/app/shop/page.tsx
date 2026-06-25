"use client";

import { useEffect, useState } from "react";
import { useProductStore } from "@/lib/store/useProductStore";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { SlidersHorizontal, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ShopPage() {
  const { products, totalCount, isLoading, fetchProducts } = useProductStore();
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    categoryIds: [],
    minPrice: 0,
    maxPrice: 2000,
    sort: "newest",
    page: 1,
    limit: 12,
  });

  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, keyword: searchInput, page: 1 });
  };

  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
              The Collection
            </h1>
            <p className="text-muted">Discover our curated selection of premium items.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-accent-gold transition-colors"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            </form>

            <select
              className="w-full sm:w-auto bg-surface border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-accent-gold transition-colors outline-none cursor-pointer"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-surface border border-border px-6 py-3 rounded-lg text-foreground hover:border-accent-gold transition-colors"
            >
              <SlidersHorizontal size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-accent-gold" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {products.length > 0 ? (
                products.map((product) => <ProductCard key={product.id} product={product} />)
              ) : (
                <div className="col-span-full h-40 flex items-center justify-center text-muted">
                  No products found matching your criteria.
                </div>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-foreground disabled:opacity-30 hover:border-accent-gold transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="text-muted">
                  <span className="text-foreground">{filters.page}</span> / {totalPages}
                </div>
                <button
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-foreground disabled:opacity-30 hover:border-accent-gold transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}
