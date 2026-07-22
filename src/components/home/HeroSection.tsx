"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-transparent">
        <div className="absolute top-[-30%] right-[-10%] h-[70vw] w-[70vw] rounded-full bg-accent-gold/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[60vw] w-[60vw] rounded-full bg-accent-blue/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-accent-gold/10 via-background to-background" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* LEFT SIDE: Copy & CTA */}
        <div className="max-w-2xl relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-gold/30 bg-accent-gold/10 backdrop-blur-sm mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <span className="text-accent-gold tracking-[0.2em] text-xs uppercase font-medium">
                The Epitome of Elegance
              </span>
            </motion.div>
            
            <h1 className="mb-6 font-heading text-5xl font-bold leading-tight text-foreground md:text-7xl lg:text-8xl">
              Redefining <br />
              <span className="animate-gradient bg-300% bg-linear-to-r from-accent-gold via-yellow-200 to-accent-gold bg-clip-text text-transparent">
                Luxury
              </span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted mb-10 leading-relaxed font-sans max-w-xl">
              Immerse yourself in a world of premium cosmetics, handcrafted masterpieces, and gourmet delicacies. Experience FJ Store—where justice is done to true luxury.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link href="/shop" className="relative group inline-block w-full sm:w-auto">
                <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-accent-gold via-yellow-400 to-accent-gold opacity-40 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                <div className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-accent-gold/40 bg-foreground px-10 py-4 font-medium text-background shadow-2xl transition-all hover:scale-[1.02] hover:border-accent-gold sm:w-auto">
                  Shop The Collection
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
              <Link href="/category/cosmetics" className="group text-foreground hover:text-accent-gold font-medium flex items-center gap-2 transition-colors">
                Explore Categories
                <div className="ml-2 h-px w-8 bg-foreground transition-colors group-hover:bg-accent-gold" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Premium Video Showcase */}
        <div className="relative z-10 mt-12 h-[500px] w-full perspective-1000 md:h-[600px] lg:mt-0 lg:h-[700px]">
          <motion.div
            className="absolute left-1/2 top-1/2 h-full max-h-[600px] w-full max-w-[600px] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          >
            {/* Decorative elements behind the video */}
            <div className="absolute -inset-4 animate-pulse rounded-full bg-linear-to-tr from-accent-gold/20 via-transparent to-accent-blue/20 blur-3xl" style={{ animationDuration: "4s" }}></div>
            
            {/* The Video/GIF Container */}
            <div className="group relative h-full w-full overflow-hidden rounded-4xl border border-accent-gold/30 bg-surface shadow-[0_0_50px_rgba(212,175,55,0.15)]">
              {/* Overlay gradient for depth */}
              <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-background/90 via-background/20 to-transparent"></div>
              
              <Image 
                src="/Firefly Create a premium luxury animated hero video for -FJ Store – For Justice- that focuses ONLY o.gif" 
                alt="FJ Store Premium Luxury" 
                fill
                priority
                unoptimized
                className="absolute inset-0 object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Floating badges/elements over the video to make it dynamic */}
              <motion.div 
                className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <div className="bg-surface/80 backdrop-blur-md border border-accent-gold/30 p-5 rounded-2xl shadow-2xl">
                  <p className="text-accent-gold text-xs font-bold uppercase tracking-wider mb-1">Exclusive</p>
                  <p className="text-foreground text-lg font-medium">FJ Signature Collection</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-20 flex hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="text-foreground/50 text-xs tracking-widest uppercase">Scroll to Explore</span>
        <div className="relative h-12 w-px overflow-hidden bg-foreground/20">
          <motion.div
            className="absolute top-0 left-0 w-full h-1/2 bg-accent-gold"
            animate={{ y: [0, 48, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
