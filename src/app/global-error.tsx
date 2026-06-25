"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Top-level global error logging
    console.error("Caught by Global Error Boundary:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-[#0B0B0C] text-foreground dark:text-white flex items-center justify-center min-h-screen p-4`}
      >
        <div className="bg-[#1E1E22] border border-border rounded-2xl p-8 max-w-sm w-full text-center flex flex-col items-center">
          <img src="/Dark-BG.png" alt="Logo" width={140} height={36} className="mb-6 justify-center" />
          <h2 className="text-xl font-bold mb-4 text-[#D4AF37]">Critical Error</h2>
          <p className="text-neutral-400 text-sm mb-6">
            A critical failure occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => reset()}
            className="w-full bg-[#D4AF37] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
