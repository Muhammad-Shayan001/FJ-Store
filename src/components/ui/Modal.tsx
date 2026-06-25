"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className={cn(
                "pointer-events-auto relative w-full max-w-lg rounded-2xl border border-border bg-surface/90 backdrop-blur-xl p-6 shadow-2xl overflow-hidden",
                className
              )}
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-hover-bg hover:text-foreground transition-colors"
              >
                <X size={20} />
                <span className="sr-only">Close</span>
              </button>

              {(title || description) && (
                <div className="mb-6">
                  {title && (
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{title}</h2>
                  )}
                  {description && <p className="text-sm text-muted">{description}</p>}
                </div>
              )}

              <div className="relative z-10">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
