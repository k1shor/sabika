"use client";

import { motion } from "framer-motion";

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-600/40 to-blue-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 50, -30, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tl from-red-600/40 to-red-500/20 rounded-full blur-3xl"
        animate={{ x: [0, -50, 30, 0], y: [0, 50, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-linear-to-br from-blue-500/15 to-red-500/15 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 0.9, 1], opacity: [0.3, 0.5, 0.2, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}


export default function FaqHeader({ isAdmin, onAddClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-[#D3E9FE] dark:bg-[#0D0F14] shadow-sm p-8 md:p-12"
    >
      {/* Subtle vignette instead of animated blue/red orbs */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30"
        style={{
          background:
            "radial-gradient(circle at 25% 20%, rgba(11,60,107,0.08), transparent 55%), radial-gradient(circle at 85% 85%, rgba(200,16,46,0.05), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#0B3C6B]/10 px-4 py-2 text-sm font-medium text-[#0B3C6B] dark:bg-[#5B9BD5]/15 dark:text-[#5B9BD5] w-fit"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-[#0B3C6B] dark:bg-[#5B9BD5]"
            />
            Help Center
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-4 font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#1C1B29] dark:text-[#F2F0E9]"
          >
            FAQ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-2 text-[#6B6A5C] dark:text-[#A8A69A] max-w-xl"
          >
            Everything you need to know about Nursing Nepal and how we can help you.
          </motion.p>
        </motion.div>

        {isAdmin && (
          <motion.button
            onClick={onAddClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-xl bg-[#C8102E] px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#A80D26] transition-colors dark:bg-[#E85D6B] dark:text-[#14151A] dark:hover:bg-[#D94D5B]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add FAQ
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}