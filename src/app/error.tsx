"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service securely
    console.error("Caught by App Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-background">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-3">Something went wrong!</h2>
        <p className="text-muted text-sm mb-8">
          We apologize for the inconvenience. An unexpected error occurred while loading this page.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="flex-1 bg-surface-secondary text-foreground font-medium py-3 rounded-lg hover:bg-hover-bg transition-colors"
          >
            Try again
          </button>
          <Link href="/" className="flex-1">
            <button className="w-full bg-accent-gold text-black font-semibold py-3 rounded-lg hover:bg-accent-gold/90 transition-colors">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
