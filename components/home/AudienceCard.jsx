"use client";

import ScrollReveal from "@/components/shared/ScrollReveal";

/**
 * AudienceCard
 *
 * Reusable — can be used on the homepage WhoWeServe section,
 * an About page, or any "who is this for" grid.
 *
 * @param {string}  emoji   — display emoji
 * @param {string}  label   — short label text
 * @param {string}  color   — accent hex (e.g. "#1d4ed8")
 * @param {number}  index   — used to stagger the entrance animation
 */
export default function AudienceCard({ emoji, label, color, index = 0 }) {
  return (
    <ScrollReveal
      variant="pop"
      margin="-40px"
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-5 text-center backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-950/25"
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">{label}</span>
      <span className="h-1 w-8 rounded-full" style={{ background: color }} />
    </ScrollReveal>
  );
}