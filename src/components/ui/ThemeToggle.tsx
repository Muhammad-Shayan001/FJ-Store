"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useEffect, useState } from "react";

function ThemeToggleContent() {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-14 h-7 rounded-full bg-gradient-to-r transition-all duration-500 flex items-center px-1 hover:shadow-lg"
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
            : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      }}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
      aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
    >
      {/* Animated background circles */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, rgba(30, 58, 138, 0.3), rgba(59, 130, 246, 0.3))"
                : "linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))",
          }}
        />
      </div>

      {/* Animated toggle slider */}
      <div
        className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 flex items-center justify-center z-10"
        style={{
          transform: theme === "dark" ? "translateX(0)" : "translateX(28px)",
        }}
      >
        {theme === "dark" ? (
          <Moon size={12} className="text-blue-600" />
        ) : (
          <Sun size={12} className="text-amber-600" />
        )}
      </div>

      {/* Icons for visual feedback */}
      <div
        className="absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300"
        style={{ opacity: theme === "dark" ? 1 : 0 }}
      >
        <Moon size={14} className="text-amber-600 dark:text-foreground dark:text-white" />
      </div>
      <div
        className="absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300"
        style={{ opacity: theme === "light" ? 1 : 0 }}
      >
        <Sun size={14} className="text-blue-600 dark:text-foreground dark:text-white" />
      </div>
    </button>
  );
}

export function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render the button after hydration to prevent context errors
  if (!isMounted) {
    return (
      <div className="w-14 h-7 rounded-full bg-gray-300 animate-pulse" />
    );
  }

  return <ThemeToggleContent />;
}
