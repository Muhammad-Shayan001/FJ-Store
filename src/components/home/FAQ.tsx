"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How long does shipping take within Pakistan?",
    answer: "We offer express luxury shipping nationwide. Orders to major cities (Lahore, Karachi, Islamabad) typically arrive within 24-48 hours. Other regions may take 3-5 business days."
  },
  {
    question: "Do you guarantee the authenticity of your cosmetics?",
    answer: "Absolutely. Every cosmetic product is sourced directly from authorized distributors or the brands themselves. We provide a 100% authenticity guarantee on our entire catalog."
  },
  {
    question: "What is your return and refund policy?",
    answer: "We offer a hassle-free 14-day return policy for unused items in their original luxury packaging. For hygienic reasons, opened cosmetics and food items cannot be returned unless defective."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, direct bank transfers, and Cash on Delivery (COD) for orders up to PKR 50,000. All online transactions are protected by bank-grade encryption."
  },
  {
    question: "Can I track my luxury order?",
    answer: "Yes, once your order is dispatched, you will receive a tracking link via SMS and email. You can also track your order directly through your account dashboard."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-semibold tracking-widest text-accent-gold uppercase mb-4">
              Need Assistance?
            </h2>
            <h3 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h3>
            <p className="text-text-muted leading-relaxed">
              Find answers to common questions about our products, shipping, and luxury services.
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-surface/80 shadow-lg border-accent-gold/30' : 'bg-surface/30 hover:bg-surface/50'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-medium font-heading text-lg ${isOpen ? 'text-accent-gold' : 'text-foreground'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-accent-gold text-white' : 'bg-background text-text-muted border border-border'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-text-muted leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
