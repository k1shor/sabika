"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HERO_INFO_ITEMS } from "./homeData";

export default function HeroInfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-slate-200 bg-white/75 p-7 shadow-lg backdrop-blur-md dark:border-blue-400/20 dark:bg-blue-950/30"
    >
      <div className="font-bold text-slate-700 tracking-wide uppercase text-xs dark:text-blue-100/70">
        What you will find here
      </div>

      <ul className="mt-5 space-y-3.5">
        {HERO_INFO_ITEMS.map(({ color, text }, index) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + index * 0.08 }}
            className="flex items-start gap-3 text-sm text-slate-600 dark:text-blue-100/70"
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`} />
            {text}
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="mt-6 rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-5 dark:border-blue-400/20 dark:from-blue-950/40 dark:to-blue-950/10"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <div className="text-sm font-bold text-slate-800 dark:text-white">Our goal</div>
        </div>
        <div className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-blue-100/70">
          Build a trusted space where the nursing community can share knowledge, support each
          other, and grow together — through both professional credibility and honest, private
          storytelling.
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 dark:border-blue-400/20 dark:bg-blue-950/40"
      >
        <span className="text-xs text-slate-500 dark:text-blue-100/60">Want to share your story?</span>
        <Link href="/contact" className="text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300">
          Apply to write →
        </Link>
      </motion.div>
    </motion.div>
  );
}