"use client";

import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1000);
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-surface/50 border border-border p-8 md:p-16 rounded-3xl text-center relative overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-gold/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-blue/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-border text-accent-gold">
              <Mail size={24} />
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Join the Inner Circle
            </h2>
            <p className="text-muted mb-8 text-lg">
              Subscribe to receive exclusive access to limited collections, private sales, and
              insider news.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
                <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                  className="flex-1 bg-background border border-border rounded-lg px-6 py-4 text-foreground focus:outline-none focus:border-accent-gold transition-colors text-center sm:text-left"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="bg-accent-gold text-black font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-accent-gold/90 transition-colors disabled:opacity-70"
              >
                {status === "loading"
                  ? "Subscribing..."
                  : status === "success"
                    ? "Subscribed!"
                    : "Subscribe"}
                {status === "idle" && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
