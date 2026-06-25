"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
  noPaddingTop?: boolean;
  noPaddingBottom?: boolean;
}

export function PageContainer({
  children,
  className,
  maxWidth = "xl",
  padding = true,
  noPaddingTop = false,
  noPaddingBottom = false,
}: PageContainerProps) {
  const maxWidthClasses: Record<string, string> = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
    "2xl": "max-w-full",
    full: "w-full",
  };

  return (
    <div
      className={cn(
        // Base layout
        "min-h-screen bg-transparent",
        // Padding (standardized for all pages)
        padding && !noPaddingTop && "pt-24",
        padding && !noPaddingBottom && "pb-12",
        className
      )}
    >
      <div
        className={cn(
          "container mx-auto px-4 md:px-8",
          maxWidthClasses[maxWidth]
        )}
      >
        {children}
      </div>
    </div>
  );
}
