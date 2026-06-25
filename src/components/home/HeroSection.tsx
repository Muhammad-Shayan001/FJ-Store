"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const highlights = ["Luxury cosmetics", "Handcrafted elegance", "Gourmet indulgence"];

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(0,240,255,0.12),_transparent_35%)] pt-20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(0,240,255,0.12),_transparent_35%)]">
      <div className="absolute inset-0 z-0 overflow-hidden bg-background/95">
        <div className="absolute -top-[20%] -right-[8%] h-[60vw] w-[60vw] rounded-full bg-accent-gold/15 blur-[140px]" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[58vw] w-[58vw] rounded-full bg-accent-blue/10 blur-[140px]" />
      </div>

      <div className="container relative z-10 mx-auto grid items-center gap-12 px-4 py-16 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24">
        <div className="relative z-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:border-accent-gold/20 dark:bg-[#121212]/80"
            >
              <Sparkles className="h-4 w-4 text-accent-gold" />
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-accent-gold">
                The Epitome of Elegance
              </span>
            </motion.div>

            <h1 className="mb-6 font-heading text-5xl font-bold leading-[0.95] text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
              Curated for <br />
              <span className="bg-gradient-to-r from-accent-gold via-amber-300 to-accent-gold bg-300% bg-clip-text text-transparent animate-gradient">
                Modern Luxury
              </span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl">
              Discover a refined edit of premium cosmetics, artisan jewelry, and indulgent delicacies—crafted with purpose, elegance, and justice in every detail.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/shop" className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition hover:scale-[1.01] sm:w-auto">
                Shop The Collection
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/category/cosmetics" className="inline-flex items-center justify-center rounded-full border border-border bg-white/80 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition hover:border-accent-gold/60 hover:text-accent-gold dark:bg-[#121212]/80">
                Explore Curated Edit
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-border/70 bg-white/70 px-3 py-2 text-sm text-text-secondary shadow-sm backdrop-blur dark:bg-[#121212]/70">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 mt-6 w-full lg:mt-0">
          <motion.div
            className="mx-auto max-w-[600px]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
          >
            <div className="absolute inset-0 -translate-x-3 -translate-y-3 rounded-[2.2rem] bg-gradient-to-tr from-accent-gold/20 via-transparent to-accent-blue/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-border/70 bg-white/75 p-3 shadow-[0_24px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-accent-gold/20 dark:bg-[#121212]/80">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/20">
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <img
                  src="/Firefly Create a premium luxury animated hero video for -FJ Store – For Justice- that focuses ONLY o.gif"
                  alt="FJ Store premium luxury showcase"
                  className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-6">
                  <div className="max-w-[16rem] rounded-2xl border border-white/20 bg-black/45 p-4 backdrop-blur-md">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-accent-gold">
                      Exclusive Drop
                    </p>
                    <p className="text-lg font-semibold text-white">FJ Signature Collection</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
