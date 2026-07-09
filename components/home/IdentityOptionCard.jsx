"use client";

import { motion } from "framer-motion";

export default function IdentityOptionCard({ icon, title, color, points, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-950/25"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
        >
          {icon}
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
      </div>

      <ul className="space-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm text-slate-600 dark:text-blue-100/70">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: color }}
            />
            {point}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}