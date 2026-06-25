"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent } from "@/components/ui";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

export default function ReviewAnalysisDashboard({ productId }: { productId?: string }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(productId || "");

  const analyzeReviews = async () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      alert("Failed to analyze reviews");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-accent-gold font-heading">AI Review Analysis</h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground dark:text-white">Select Product ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                placeholder="Enter product ID"
                className="flex-1 px-3 py-2 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
              />
              <Button
                variant="luxury"
                onClick={analyzeReviews}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted mb-2">Summary</p>
                <p className="text-foreground dark:text-white text-sm">{analysis.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-accent-blue mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold text-accent-blue">{analysis.totalReviews || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-accent-gold mb-1">Average Rating</p>
                  <p className="text-2xl font-bold text-accent-gold">{analysis.averageRating?.toFixed(1) || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="text-accent-gold font-heading mb-4">✓ Positive Points</h4>
                <ul className="space-y-2">
                  {analysis.positive?.map((p: string, i: number) => (
                    <li key={i} className="text-sm text-foreground dark:text-white flex gap-2">
                      <span className="text-success">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="text-error font-heading mb-4">✗ Negative Points</h4>
                <ul className="space-y-2">
                  {analysis.negative?.map((n: string, i: number) => (
                    <li key={i} className="text-sm text-foreground dark:text-white flex gap-2">
                      <span className="text-error">✗</span> {n}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="text-accent-blue font-heading mb-4">🌟 Common Praise</h4>
                <div className="space-y-2">
                  {analysis.commonPraise?.map((p: string, i: number) => (
                    <span
                      key={i}
                      className="inline-block px-3 py-1 bg-success/20 text-success text-xs rounded-full mr-2 mb-2"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="text-accent-blue font-heading mb-4">⚠️ Common Complaints</h4>
                <div className="space-y-2">
                  {analysis.commonComplaints?.map((c: string, i: number) => (
                    <span
                      key={i}
                      className="inline-block px-3 py-1 bg-error/20 text-error text-xs rounded-full mr-2 mb-2"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            variant="outline"
            onClick={() => setAnalysis(null)}
            className="w-full"
          >
            <RefreshCw size={16} className="mr-2" /> Analyze Another Product
          </Button>
        </>
      )}
    </div>
  );
}
