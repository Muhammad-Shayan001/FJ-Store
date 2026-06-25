import { Loader2 } from "lucide-react";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-surface rounded-lg animate-pulse"></div>
            <div className="h-4 w-48 bg-surface/50 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-64 bg-surface rounded-lg animate-pulse"></div>
            <div className="h-12 w-32 bg-surface rounded-lg animate-pulse"></div>
            <div className="h-12 w-24 bg-surface rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border/50 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-black/5 dark:bg-white/5"></div>
              <div className="p-5 space-y-3">
                <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded"></div>
                <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                <div className="h-4 w-1/4 bg-accent-gold/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
