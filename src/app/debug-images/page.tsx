"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Debug page to diagnose image display issues
 * Shows: database state, API response, rendering details
 * URL: /debug-images
 */
export default function DebugImagesPage() {
  const [status, setStatus] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Check database status
        const statusRes = await fetch("/api/debug/image-status?action=status");
        const statusData = await statusRes.json();
        setStatus(statusData);

        // 2. Fetch products from API
        const productsRes = await fetch("/api/products?limit=100&published=true");
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);

        console.log("Debug Info:", { statusData, productsData });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-foreground mb-8">🔍 Image Debug Dashboard</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 text-red-600">
          Error: {error}
        </div>
      )}

      {/* Database Status */}
      <section className="mb-12 bg-surface border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">📊 Database Status</h2>
        {status && (
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span>Total Products (published):</span>
              <span className="font-bold text-accent-gold">{status.stats?.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Images in DB:</span>
              <span className="font-bold text-accent-gold">{status.stats?.totalImages || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Products with Images:</span>
              <span className="font-bold text-accent-gold">{status.stats?.productsWithImages || 0}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-muted">Analysis:</p>
              <p className="text-foreground mt-2">{status.issue}</p>
            </div>
          </div>
        )}
      </section>

      {/* Products List */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">📦 Products from API ({products.length})</h2>

        {products.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-600">
            ⚠️ No products found. Need to create products with images first.
          </div>
        ) : (
          <div className="space-y-6">
            {products.slice(0, 5).map((product: any) => (
              <div key={product.id} className="bg-surface border border-border rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted">ID: {product.id}</p>
                  <p className="text-sm text-muted">Slug: {product.slug}</p>
                </div>

                {/* Images Section */}
                <div className="mt-4">
                  <h4 className="font-bold text-foreground mb-2">🖼️ Images ({product.images?.length || 0}):</h4>
                  {product.images && product.images.length > 0 ? (
                    <div className="space-y-3">
                      {product.images.map((img: any, idx: number) => (
                        <div key={idx} className="bg-background rounded p-3 border border-border">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-sm text-muted">
                                <span className="font-mono">URL:</span> {img.url?.substring(0, 60)}...
                              </p>
                              <p className="text-sm text-muted">
                                <span className="font-mono">Thumbnail:</span> {img.is_thumbnail ? "✅ Yes" : "❌ No"}
                              </p>
                              <p className="text-sm text-muted">
                                <span className="font-mono">Provider:</span> {img.provider || "unknown"}
                              </p>
                            </div>
                            <a
                              href={img.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-accent-gold/20 text-accent-gold rounded text-sm hover:bg-accent-gold/30"
                            >
                              View Image
                            </a>
                          </div>
                          {/* Attempt to show image */}
                          <div className="mt-3 bg-gray-200 rounded aspect-square max-w-xs overflow-hidden">
                            <img
                              src={img.url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const elem = e.target as HTMLImageElement;
                                elem.style.background = "#fee";
                                elem.style.display = "flex";
                                elem.style.alignItems = "center";
                                elem.style.justifyContent = "center";
                                elem.innerHTML = "❌ Image failed to load";
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">❌ No images linked to this product</p>
                  )}
                </div>

                {/* Full Product JSON */}
                <details className="mt-4 cursor-pointer">
                  <summary className="text-sm text-muted hover:text-foreground">Show full product JSON</summary>
                  <pre className="mt-2 bg-background rounded p-3 text-xs overflow-auto max-h-64 text-muted">
                    {JSON.stringify(product, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Instructions */}
      <section className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-4">📝 Next Steps</h2>
        <ol className="space-y-2 text-sm text-foreground list-decimal list-inside">
          <li>If "Total Images in DB" = 0: Run SQL to insert sample products</li>
          <li>If products show but images = 0: Images not linked in database</li>
          <li>If images show in API but not on /shop: Check ProductCard component</li>
          <li>
            Click "View Image" links above to verify image URLs are accessible
          </li>
        </ol>
      </section>
    </div>
  );
}
