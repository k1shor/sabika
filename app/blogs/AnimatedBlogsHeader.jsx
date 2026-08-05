"use client";

import { motion } from "framer-motion";

export default function CompactBlogsHeader({ postsCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-[#D3E9FE] p-8 md:p-12 lg:p-14 shadow-sm dark:bg-[#0D0F14]"
    >
      {/* Vintage vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(224,164,88,0.10), transparent 55%), radial-gradient(circle at 85% 90%, rgba(11,60,107,0.06), transparent 50%)",
        }}
      />

      {/* Brand Accent Bar */}
      <div className="absolute left-0 right-0 top-0 h-1.5 bg-linear-to-r from-[#0B3C6B] via-[#E0A458] to-[#C8102E] dark:from-[#5B9BD5] dark:via-[#F0BE7A] dark:to-[#E85D6B]" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0B3C6B]/10 px-4 py-1 text-xs font-medium text-[#0B3C6B] dark:bg-[#5B9BD5]/15 dark:text-[#5B9BD5]">
            <motion.span
              className="h-2 w-2 rounded-full bg-[#0B3C6B] dark:bg-[#5B9BD5]"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Knowledge Hub
          </div>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[#1C1B29] dark:text-[#F2F0E9]">
            Nursing Articles & Insights
          </h1>

          <p className="text-sm md:text-base leading-relaxed text-[#6B6A5C] dark:text-[#A8A69A]">
            Practical clinical guidance, exam strategies, care plans, and real experience stories from nurses across Nepal.
          </p>
        </div>

        {/* Flexible Stat Badge */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="shrink-0 rounded-2xl bg-white p-5 text-center shadow-xs dark:bg-[#14151A] min-w-40"
        >
          <span className="block font-serif text-3xl md:text-4xl font-medium text-[#0B3C6B] dark:text-[#5B9BD5]">
            {postsCount}+
          </span>
          <span className="mt-1 block text-xs font-medium text-[#6B6A5C] dark:text-[#A8A69A]">
            Total Articles
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}