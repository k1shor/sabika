"use client";

import ScrollReveal from "@/components/shared/ScrollReveal";

/**
 * AudienceCard (About variant)
 *
 * Different from the home version — this one has a coloured top accent bar
 * and a longer description text. Used in the "Who is this for" grid on the
 * About page. Could also work on a landing or Press page.
 *
 * @param {string}  icon    — emoji
 * @param {string}  title   — card heading
 * @param {string}  desc    — short description paragraph
 * @param {string}  accent  — Tailwind gradient classes for the top bar (e.g. "from-blue-500 to-blue-400")
 * @param {number}  index   — stagger index
 */
export default function AudienceCard({ icon, title, desc, accent, index = 0 }) {
  return (
    <ScrollReveal
      variant="lift"
      margin="-50px"
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, boxShadow: "0 16px 32px -8px rgba(0,0,0,0.10)" }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5
        dark:border-blue-400/20 dark:bg-blue-950/30"
    >
      <div className={`absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-linear-to-r ${accent}`} />
      <div className="mt-2 text-2xl">{icon}</div>
      <div className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">{title}</div>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">{desc}</p>
    </ScrollReveal>
  );
}
