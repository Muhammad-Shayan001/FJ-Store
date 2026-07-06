"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, Gem, RefreshCw, Headphones, Star, Award } from "lucide-react";

const features = [
  {
    icon: <Truck size={24} />,
    title: "Fast Delivery",
    description: "Complimentary express shipping on all luxury orders within Pakistan.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Secure Payments",
    description: "Bank-grade encrypted transactions for your peace of mind.",
  },
  {
    icon: <Gem size={24} />,
    title: "Premium Quality",
    description: "Sourced from the finest artisans and globally renowned brands.",
  },
  {
    icon: <RefreshCw size={24} />,
    title: "Easy Returns",
    description: "Hassle-free 14-day return policy on all eligible items.",
  },
  {
    icon: <Headphones size={24} />,
    title: "24/7 Support",
    description: "Dedicated concierge service available around the clock.",
  },
  {
    icon: <Award size={24} />,
    title: "Trusted Store",
    description: "Over 50,000 satisfied customers and counting.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-semibold tracking-widest text-accent-gold uppercase mb-4">
              The FJ Standard
            </h2>
            <h3 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Why Choose Us
            </h3>
            <p className="text-text-muted leading-relaxed">
              We don't just deliver products; we deliver an experience. Discover the unparalleled standards that make us Pakistan's premier luxury destination.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-3xl bg-surface/50 border border-border/50 hover:bg-surface hover:border-accent-gold/30 hover:shadow-2xl hover:shadow-accent-gold/5 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 text-accent-gold flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent-gold group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-heading font-semibold text-foreground mb-3">
                {feature.title}
              </h4>
              <p className="text-text-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
