"use client";

import { useState } from "react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Sparkles, Copy, Loader2 } from "lucide-react";

export default function SeoGenerator({
  productName,
  productDescription,
  onClose,
}: {
  productName: string;
  productDescription: string;
  onClose?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState("");

  const generateSeo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/seo-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productDescription,
          category,
          keywords,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Failed to generate SEO content");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (!result) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-accent-gold font-heading">AI SEO Generator</h3>
            {onClose && (
              <button onClick={onClose} className="text-muted hover:text-foreground dark:text-white">
                ✕
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground dark:text-white">Category (Optional)</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Cosmetics, Jewelry"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground dark:text-white">Keywords (Optional)</label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Comma-separated keywords"
            />
          </div>

          <Button
            variant="luxury"
            onClick={generateSeo}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" /> Generate SEO Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-accent-gold font-heading">SEO Content Generated</h3>
          {onClose && (
            <button onClick={() => { setResult(null); onClose(); }} className="text-muted hover:text-foreground dark:text-white">
              ✕
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-surface/50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted">Meta Title ({result.meta_title.length}/60)</p>
              <button onClick={() => copyToClipboard(result.meta_title)} className="text-xs text-accent-gold hover:text-accent-gold/80">
                <Copy size={14} />
              </button>
            </div>
            <p className="text-foreground dark:text-white">{result.meta_title}</p>
          </div>

          <div className="bg-surface/50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted">Meta Description ({result.meta_description.length}/155)</p>
              <button onClick={() => copyToClipboard(result.meta_description)} className="text-xs text-accent-gold hover:text-accent-gold/80">
                <Copy size={14} />
              </button>
            </div>
            <p className="text-foreground dark:text-white text-sm">{result.meta_description}</p>
          </div>

          <div className="bg-surface/50 p-4 rounded-lg">
            <p className="text-xs text-muted mb-2">Open Graph Title</p>
            <p className="text-foreground dark:text-white text-sm">{result.og_title}</p>
          </div>

          <div className="bg-surface/50 p-4 rounded-lg">
            <p className="text-xs text-muted mb-2">Open Graph Description</p>
            <p className="text-foreground dark:text-white text-sm">{result.og_description}</p>
          </div>

          <div className="bg-surface/50 p-4 rounded-lg">
            <p className="text-xs text-muted mb-2">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {result.seo_keywords?.map((k: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs rounded">
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface/50 p-4 rounded-lg">
            <p className="text-xs text-muted mb-2">Search Snippet</p>
            <p className="text-foreground dark:text-white text-sm">{result.search_snippet}</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setResult(null)}
          className="w-full"
        >
          Generate New
        </Button>
      </CardContent>
    </Card>
  );
}
