"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FAQItem
 *
 * Reusable accordion item. Can be used in:
 *  - The homepage FAQSection
 *  - A dedicated /faq page
 *  - Any help or support section
 *
 * @param {string}  q       — question text
 * @param {string}  a       — answer text
 * @param {number}  index   — stagger index for entrance animation
 */
export default function FAQItem({ q, a, index = 0 }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="border-b border-slate-200 last:border-0"
    >
      <button
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4 shrink-0 text-blue-600 text-lg font-light"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}