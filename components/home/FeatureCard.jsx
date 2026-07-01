"use client";

import { motion } from "framer-motion";
import ScrollReveal from "@/components/shared/ScrollReveal";

/**
 * FeatureCard
 *
 * Reusable — works in any feature/capability grid.
 * Could be dropped into a blog detail page sidebar,
 * an About page, or a pricing page feature list.
 *
 * @param {string}  icon    — emoji or icon character
 * @param {string}  title   — card heading
 * @param {string}  desc    — short description
 * @param {string}  color   — accent hex (e.g. "#1d4ed8")
 * @param {number}  index   — stagger index for entrance animation
 */
export default function FeatureCard({ icon, title, desc, color, index = 0 }) {
  return (
    <ScrollReveal
      margin="-60px"
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm cursor-default"
    >
      <div className="relative z-10">
        <div
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl"
          style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
        >
          {icon}
        </div>
        <h3 className="mt-4 font-bold text-slate-800 text-[15px] leading-snug">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>

      {/* Animated bottom accent bar on hover */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 w-0"
        style={{ background: color }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </ScrollReveal>
  );
}
