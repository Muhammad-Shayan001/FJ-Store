"use client";

import { useState } from "react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Sparkles, Copy, Loader2 } from "lucide-react";

export default function SupportTools() {
  const [toolType, setToolType] = useState<"suggested_reply" | "faq_generation" | "ticket_summary">(
    "suggested_reply"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [context, setContext] = useState("");

  const generateTool = async () => {
    if (!context) {
      alert("Please enter content");
      return;
    }
    setLoading(true);
    try {
      let body: any = { toolType };

      if (toolType === "suggested_reply") {
        body.context = { customerMessage: context };
      } else if (toolType === "faq_generation") {
        body.context = { topic: context };
      } else if (toolType === "ticket_summary") {
        body.context = { ticketContent: context };
      }

      const res = await fetch("/api/ai/support-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Failed to generate support content");
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  if (result) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-accent-gold font-heading">Generated Content</h3>
            <button onClick={() => setResult(null)} className="text-muted hover:text-foreground dark:text-white">
              ✕
            </button>
          </div>

          {toolType === "suggested_reply" && (
            <>
              <div className="bg-surface/50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs text-muted">Suggested Reply</p>
                  <button
                    onClick={() => copyToClipboard(result.reply)}
                    className="text-xs text-accent-gold hover:text-accent-gold/80"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-foreground dark:text-white text-sm">{result.reply}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface/50 p-4 rounded-lg">
                  <p className="text-xs text-muted mb-2">Tone</p>
                  <p className="text-foreground dark:text-white">{result.tone}</p>
                </div>
                <div className="bg-surface/50 p-4 rounded-lg">
                  <p className="text-xs text-muted mb-2">Next Steps</p>
                  <p className="text-foreground dark:text-white text-sm">{result.next_steps}</p>
                </div>
              </div>
            </>
          )}

          {toolType === "faq_generation" && (
            <div className="space-y-3">
              {result.faqs?.map((faq: any, i: number) => (
                <div key={i} className="bg-surface/50 p-4 rounded-lg">
                  <p className="text-accent-blue font-medium mb-2">{faq.question}</p>
                  <p className="text-foreground dark:text-white text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {toolType === "ticket_summary" && (
            <>
              <div className="bg-surface/50 p-4 rounded-lg">
                <p className="text-xs text-muted mb-2">Summary</p>
                <p className="text-foreground dark:text-white">{result.summary}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface/50 p-4 rounded-lg">
                  <p className="text-xs text-muted mb-2">Priority</p>
                  <p className="text-foreground dark:text-white font-medium">{result.priority}</p>
                </div>
                <div className="bg-surface/50 p-4 rounded-lg">
                  <p className="text-xs text-muted mb-2">Category</p>
                  <p className="text-foreground dark:text-white font-medium">{result.category}</p>
                </div>
                <div className="bg-surface/50 p-4 rounded-lg">
                  <p className="text-xs text-muted mb-2">Resolution</p>
                  <p className="text-foreground dark:text-white text-sm">{result.suggested_resolution}</p>
                </div>
              </div>
            </>
          )}

          <Button variant="outline" onClick={() => setResult(null)} className="w-full">
            Generate New
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-accent-gold font-heading mb-4">🛠️ AI Support Tools</h3>

        <div className="space-y-2">
          <label className="text-sm text-foreground dark:text-white">Tool Type</label>
          <select
            value={toolType}
            onChange={(e) => setToolType(e.target.value as any)}
            className="w-full px-3 py-2 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
          >
            <option value="suggested_reply">Suggested Customer Reply</option>
            <option value="faq_generation">FAQ Generator</option>
            <option value="ticket_summary">Ticket Summary</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-foreground dark:text-white">
            {toolType === "suggested_reply"
              ? "Customer Message"
              : toolType === "faq_generation"
              ? "Topic"
              : "Ticket Content"}
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={
              toolType === "suggested_reply"
                ? "Paste customer message here..."
                : toolType === "faq_generation"
                ? "Enter topic or question..."
                : "Paste ticket content..."
            }
            className="w-full h-32 p-3 rounded-md bg-surface/50 border border-border text-foreground dark:text-white focus:outline-none focus:border-accent-gold"
          />
        </div>

        <Button
          variant="luxury"
          onClick={generateTool}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" /> Generate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
