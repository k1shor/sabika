"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "./dashboardUtils";

export default function QuickStats({ role, posts }) {
  if (role === "visitor") return null;

  const stats = role === "blog_writer"
    ? [
        { label: "Published", value: posts.filter((post) => post.status === "approved").length, icon: "OK", color: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400" },
        { label: "Pending", value: posts.filter((post) => post.status === "pending").length, icon: "...", color: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400" },
        { label: "Drafts", value: posts.filter((post) => post.status === "draft").length, icon: "DR", color: "border-slate-200 bg-slate-50 dark:border-slate-500/20 dark:bg-slate-900/20", text: "text-slate-600 dark:text-slate-400" },
      ]
    : [
        { label: "Total Blogs", value: "-", icon: "BL", color: "border-red-200 bg-red-50/60 dark:border-red-500/20 dark:bg-red-950/20", text: "text-[#DC143C] dark:text-red-400" },
        { label: "Total Users", value: "-", icon: "US", color: "border-blue-200 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-950/20", text: "text-[#003893] dark:text-blue-400" },
        { label: "Pending Review", value: "-", icon: "RV", color: "border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400" },
      ];

  return (
    <motion.div variants={stagger} className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={fadeUp} whileHover={{ y: -4 }} className={`rounded-2xl border ${stat.color} p-4 shadow-sm`}>
          <div className="mb-1 text-xs font-extrabold">{stat.icon}</div>
          <div className={`text-3xl font-extrabold ${stat.text}`}>{stat.value}</div>
          <div className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}
