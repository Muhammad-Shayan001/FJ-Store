"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Eleanor V.",
      role: "Verified Buyer",
      text: "The quality is simply unmatched. I've never experienced such premium packaging and product formulation before.",
      rating: 5,
    },
    {
      id: 2,
      name: "Sophie M.",
      role: "Verified Buyer",
      text: "A truly luxurious shopping experience from start to finish. The customer service team is exceptional.",
      rating: 5,
    },
    {
      id: 3,
      name: "Clara T.",
      role: "Verified Buyer",
      text: "My go-to for all premium cosmetics. The shades perfectly match my skin tone, and the wear time is incredible.",
      rating: 4,
    },
  ];

  return (
    <section className="py-24 bg-surface border-y border-border relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-accent-gold/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            A Legacy of Excellence
          </h2>
          <p className="text-muted">
            Discover what our esteemed clientele has to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-background border border-border p-8 rounded-2xl hover:border-accent-gold/30 transition-colors"
            >
              <div className="flex gap-1 text-accent-gold mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-muted leading-relaxed mb-8 italic">"{t.text}"</p>
              <div>
                <div className="text-foreground font-medium">{t.name}</div>
                <div className="text-muted text-xs uppercase tracking-wider mt-1">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
