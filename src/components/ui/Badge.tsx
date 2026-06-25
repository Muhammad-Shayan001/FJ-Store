"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-foreground text-background hover:bg-foreground/80",
        luxury:
          "border-transparent bg-accent-gold/20 text-accent-gold border border-accent-gold/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]",
        neon: "border-transparent bg-accent-blue/10 text-accent-blue border border-accent-blue/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]",
        success: "border-transparent bg-success/20 text-success border border-success/50",
        destructive: "border-transparent bg-error/20 text-error border border-error/50",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
