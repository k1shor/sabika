"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "./dashboardUtils";

export default function WelcomeBanner({ user }) {
  return (
    <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl shadow-md">
      <div className="absolute inset-0 bg-linear-to-br from-[#ECFDF5] via-[#D1FAE5] to-[#F0FDF4] dark:from-emerald-950/40 dark:via-blue-950/30 dark:to-slate-950" />
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#E35D6A]/10 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-40 w-60 rounded-full bg-[#4A6FA5]/10 blur-2xl" />
      <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-[#4A6FA5] via-[#E35D6A] to-[#4A6FA5]" />

      <div className="relative px-8 py-10">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Welcome, <span className="text-[#E35D6A]">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-blue-100/70">Your nursing community in Nepal awaits.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/blogs" className="rounded-xl bg-[#E35D6A] px-5 py-2 text-sm font-bold text-white hover:bg-[#d14c59]">
            Browse Articles
          </Link>
          <Link href="/writers/posts" className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-white/60 dark:border-blue-400/30 dark:text-blue-100 dark:hover:bg-blue-950/40">
            Write new post
          </Link>
        </div>
      </div>
    </motion.div>
  );
}