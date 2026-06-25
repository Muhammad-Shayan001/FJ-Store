"use client";

import { useState } from "react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Sparkles, Copy, Loader2 } from "lucide-react";

export default function MarketingAssistant() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [campaignType, setCampaignType] = useState("email");
  const [products, setProducts] = useState("");
  const [tone, setTone] = useState("professional");

  const generateCampaign = async () => {
    if (!products) {
      alert("Please enter at least one product");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/marketing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignType,
          products: products.split(",").map((p) => p.trim()),
          tone,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Failed to generate marketing content");
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
          <h3 className="text-accent-gold font-heading mb-4">✉️ AI Marketing Assistant</h3>

          <div className="space-y-2">
            <label className="text-sm text-foreground dark:text-white">Campaign Type</label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
            >
              <option value="email">Email Campaign</option>
              <option value="newsletter">Newsletter</option>
              <option value="flash_sale">Flash Sale</option>
              <option value="launch">Product Launch</option>
              <option value="seasonal">Seasonal Promotion</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground dark:text-white">Products (Comma separated)</label>
            <Input
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              placeholder="e.g. Gold Bangle, Lipstick Red, Face Serum"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground dark:text-white">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="luxury">Luxury</option>
              <option value="casual">Casual</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <Button
            variant="luxury"
            onClick={generateCampaign}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" /> Generate Campaign
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-accent-gold font-heading">Campaign Generated</h3>
          <button onClick={() => setResult(null)} className="text-muted hover:text-foreground dark:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-surface/50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted">Subject Line</p>
              <button
                onClick={() => copyToClipboard(result.subject_line)}
                className="text-xs text-accent-gold hover:text-accent-gold/80"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="text-foreground dark:text-white font-medium">{result.subject_line}</p>
          </div>

          <div className="bg-surface/50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted">Headline</p>
              <button
                onClick={() => copyToClipboard(result.headline)}
                className="text-xs text-accent-gold hover:text-accent-gold/80"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="text-foreground dark:text-white text-lg font-heading">{result.headline}</p>
          </div>

          <div className="bg-surface/50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted">Email Body</p>
              <button
                onClick={() => copyToClipboard(result.body)}
                className="text-xs text-accent-gold hover:text-accent-gold/80"
              >
                <Copy size={14} />
              </button>
            </div>
            <div
              className="text-foreground dark:text-white text-sm prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: result.body }}
            />
          </div>

          <div className="bg-surface/50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-muted">CTA Button Text</p>
              <button
                onClick={() => copyToClipboard(result.cta_text)}
                className="text-xs text-accent-gold hover:text-accent-gold/80"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="text-foreground dark:text-white">{result.cta_text}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface/50 p-4 rounded-lg">
              <p className="text-xs text-muted mb-2">Banner Text</p>
              <p className="text-foreground dark:text-white text-sm">{result.banner_text}</p>
            </div>
            <div className="bg-surface/50 p-4 rounded-lg">
              <p className="text-xs text-muted mb-2">Social Post</p>
              <p className="text-foreground dark:text-white text-sm">{result.social_post}</p>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={() => setResult(null)} className="w-full">
          Generate New
        </Button>
      </CardContent>
    </Card>
  );
}
