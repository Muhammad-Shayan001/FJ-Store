"use client";

import { useEffect, useState } from "react";

export default function EmailDebugPage() {
  const [config, setConfig] = useState<{
    smtpEmail: boolean;
    smtpPassword: boolean;
    smtpSenderName: boolean;
    supabaseUrl: boolean;
  } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Check what config is available (from a debug endpoint)
    const checkConfig = async () => {
      try {
        const res = await fetch("/api/email/debug");
        const data = await res.json();
        setConfig(data.config);
      } catch (error) {
        console.error("Failed to check config:", error);
      }
    };
    checkConfig();
  }, []);

  const handleTest = async () => {
    if (!testEmail) {
      alert("Please enter an email");
      return;
    }

    setTesting(true);
    setResult(null);

    try {
      console.log("Sending test email to:", testEmail);
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await response.json();
      console.log("Response:", data);
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-surface rounded-lg border border-border p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white mb-2">Email Debug</h1>
            <p className="text-muted text-sm">
              Check email configuration and test Gmail SMTP
            </p>
          </div>

          {/* Configuration Status */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground dark:text-white">
              Configuration Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded border border-border">
                <span className="text-foreground dark:text-white">SMTP_EMAIL</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    config?.smtpEmail
                      ? "bg-success/20 text-success"
                      : "bg-error/20 text-error"
                  }`}
                >
                  {config?.smtpEmail ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded border border-border">
                <span className="text-foreground dark:text-white">SMTP_PASSWORD</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    config?.smtpPassword
                      ? "bg-success/20 text-success"
                      : "bg-error/20 text-error"
                  }`}
                >
                  {config?.smtpPassword ? "✓ Set" : "✗ Missing"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded border border-border">
                <span className="text-foreground dark:text-white">SMTP_SENDER_NAME</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    config?.smtpSenderName
                      ? "bg-success/20 text-success"
                      : "bg-warning/20 text-warning"
                  }`}
                >
                  {config?.smtpSenderName ? "✓ Set" : "⚠ Missing (using default)"}
                </span>
              </div>
            </div>
          </div>

          {/* Test Email */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground dark:text-white">Send Test Email</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-4 py-2 bg-black/5 dark:bg-white/5 border border-border rounded text-foreground dark:text-white placeholder-muted focus:outline-none focus:border-accent-gold"
                />
              </div>
              <button
                onClick={handleTest}
                disabled={testing || !config?.smtpEmail || !config?.smtpPassword}
                className="w-full px-4 py-2 bg-accent-gold text-black font-semibold rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testing ? "Sending..." : "Send Test Email"}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`p-4 rounded border ${
                result.success
                  ? "bg-success/10 border-success"
                  : "bg-error/10 border-error"
              }`}
            >
              <p
                className={`font-medium mb-2 ${
                  result.success ? "text-success" : "text-error"
                }`}
              >
                {result.success ? "✓ Success!" : "✗ Failed"}
              </p>
              <p className="text-sm text-foreground dark:text-white mb-2">{result.message}</p>
              {result.error && (
                <details className="text-xs text-muted">
                  <summary className="cursor-pointer font-mono">Error Details</summary>
                  <pre className="mt-2 p-2 bg-black/20 rounded overflow-auto">
                    {typeof result.error === "string"
                      ? result.error
                      : JSON.stringify(result.error, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="pt-4 border-t border-border space-y-4 text-sm text-muted">
            <div>
              <p className="font-semibold text-foreground dark:text-white mb-2">Troubleshooting:</p>
              <ul className="space-y-2 ml-4">
                <li>• Check .env.local has SMTP_EMAIL and SMTP_PASSWORD</li>
                <li>• Restart dev server after .env changes</li>
                <li>• App password must be from Google Account settings</li>
                <li>• Check server console for detailed error messages</li>
                <li>• Test email may take a few seconds to arrive</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
