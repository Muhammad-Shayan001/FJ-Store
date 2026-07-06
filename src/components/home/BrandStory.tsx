"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BrandStory() {
  return (
    <section className="py-24 bg-surface overflow-hidden border-y border-border/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/20 z-10" />
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
                alt="FJ Store Brand Story"
                className="w-full h-full object-cover"
              />
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute bottom-8 right-8 z-20 bg-background/90 backdrop-blur-md p-6 rounded-2xl border border-accent-gold/30 shadow-xl max-w-xs"
              >
                <p className="text-accent-gold font-heading font-bold text-2xl mb-1">Est. 2026</p>
                <p className="text-foreground text-sm font-medium">Redefining luxury standards in Pakistan.</p>
              </motion.div>
            </motion.div>
            
            {/* Decorative Element */}
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-accent-gold/10 rounded-full blur-[50px] -z-10" />
          </div>

          {/* Text Side */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-sm font-semibold tracking-widest text-accent-gold uppercase mb-4">
                Our Heritage
              </h2>
              <h3 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-8 leading-tight">
                Crafting Excellence, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-yellow-200">
                  Delivering Justice
                </span>
              </h3>
              
              <div className="space-y-6 text-text-muted text-lg leading-relaxed mb-10">
                <p>
                  At FJ Store, we believe that true luxury is not just about the price tag—it's about the uncompromising quality, the artisanal craftsmanship, and the story behind every piece.
                </p>
                <p>
                  Founded with a vision to bring world-class elegance to Pakistan, we meticulously curate our collections. From the rarest cosmetic formulations to heritage bangles and gourmet delicacies, every item is selected to meet our exacting standards.
                </p>
                <p>
                  We are more than a marketplace; we are a destination for those who refuse to settle for anything less than extraordinary.
                </p>
              </div>

              <Link href="/about" className="group inline-flex items-center gap-3 px-8 py-4 bg-background border border-accent-gold/30 rounded-xl text-foreground font-medium hover:bg-accent-gold hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-accent-gold/20">
                Discover Our Story
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
