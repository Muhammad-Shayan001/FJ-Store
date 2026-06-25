"use client";

import { useEffect, useState } from "react";

export default function EmailTestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const handleTest = async () => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-surface rounded-lg border border-border p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">Email Test</h1>
            <p className="text-muted text-sm">
              Send a test email to verify Gmail SMTP configuration
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground dark:text-white">
              Your Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@gmail.com"
              className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 border border-border rounded text-foreground dark:text-white placeholder-muted focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full px-4 py-2 bg-accent-gold text-black font-semibold rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending..." : "Send Test Email"}
          </button>

          {result && (
            <div
              className={`p-4 rounded border ${
                result.success
                  ? "bg-success/10 border-success text-success"
                  : "bg-error/10 border-error text-error"
              }`}
            >
              <p className="font-medium mb-2">{result.message}</p>
              {result.error && (
                <p className="text-sm opacity-80 font-mono break-words">
                  {result.error}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-border space-y-3 text-sm text-muted">
            <p>
              <strong>What happens:</strong> A test email will be sent to the
              address you provide.
            </p>
            <p>
              <strong>Check your:</strong> Inbox, Spam, or Promotions folder
            </p>
            <p>
              <strong>Subject:</strong> "FJ Store - Email Configuration Test ✓"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
