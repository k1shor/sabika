"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/Container";

export function DashboardLoading() {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-red-200 border-t-[#DC143C]"
        />
        <p className="text-xs font-semibold text-slate-400">Loading your dashboard...</p>
      </div>
    </Container>
  );
}

export function DashboardLoginPrompt() {
  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-5 py-32 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-[#DC143C]/10 to-[#003893]/10 text-4xl">
          NN
        </div>
        <div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">You are not logged in</p>
          <p className="mt-1 text-sm text-slate-500">Login to access your nursing dashboard.</p>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-[#DC143C] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-red-900/20 transition hover:bg-[#c01232] hover:shadow-lg"
        >
          Login to continue
        </Link>
      </motion.div>
    </Container>
  );
}
