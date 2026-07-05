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
      className="relative overflow-hidden rounded-3xl border-2 border-slate-200/50 dark:border-blue-500/30 bg-linear-to-br from-white/80 via-blue-50/30 to-red-50/20 dark:from-slate-900/80 dark:via-blue-950/40 dark:to-red-950/20 backdrop-blur-2xl shadow-2xl p-8 md:p-12"
    >
      <AnimatedBackground />

      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600/50 bg-blue-600/10 backdrop-blur-xl px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-300 w-fit"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-linear-to-r from-blue-600 to-red-600"
            />
            Help Center
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            FAQ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-2 text-slate-600 dark:text-blue-100/75 max-w-xl"
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
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:shadow-2xl transition-all"
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
