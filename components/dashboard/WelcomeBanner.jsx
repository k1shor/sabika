"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function WelcomeBanner({ user }) {
  const shouldReduceMotion = useReducedMotion();
  const firstName = user?.name?.split(" ").slice(0, -1).join(" ") || user?.name || "Member";

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#D3E9FE] dark:bg-[#0D0F14]">
  {/* Top Accent Line */}
  <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-[#0B3C6B] via-[#E0A458] to-[#C8102E] dark:from-[#5B9BD5] dark:via-[#F0BE7A] dark:to-[#E85D6B]" />

  <div className="relative px-6 py-6 md:px-8 md:py-7">
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-4"
    >
      {/* Top Row: Greeting, Role Badge & Modern Medical SVG Badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#0B3C6B]/10 px-3 py-0.5 text-xs font-medium text-[#0B3C6B] dark:bg-[#5B9BD5]/15 dark:text-[#5B9BD5]">
              Community Hub
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-serif text-2xl md:text-3xl font-bold! tracking-tight text-[#346CBC] dark:text-[#5B9BD5]"
          >
            Namaste, <span className="text-[#2f68c1] dark:text-[#E85D6B]">{firstName}</span>
          </motion.h1>
        </div>

        {/* Clean Medical / Stethoscope Community SVG Graphic */}
        <motion.div
          variants={itemVariants}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B3C6B] shadow-xs dark:bg-[#14151A] dark:text-[#5B9BD5]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.8 2.3A.3.3 0 0 0 4.5 2.6V7a5 5 0 0 0 10 0V2.6a.3.3 0 0 0-.3-.3" />
            <path d="M8 12a6 6 0 0 0 12 0V9" />
            <circle cx="20" cy="8" r="2" />
          </svg>
        </motion.div>
      </div>

      {/* Subtitle */}
      <motion.p
        variants={itemVariants}
        className="text-xs md:text-sm text-[#5f656a] dark:text-[#A8A69A] max-w-2xl"
      >
        Welcome back to your community workspace. Explore clinical insights, patient care articles, exam guides, and real shift experiences.
      </motion.p>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-1">
        {/* Primary Action Button — solid blue fill, white text */}
        <Link
          href="/blogs"
          className="inline-flex items-center justify-center rounded-xl bg-[#2F68C1] px-4 py-2 text-xs md:text-sm font-medium text-white! shadow-sm transition-transform duration-200 hover:bg-[#28599F] hover:scale-[1.02] active:scale-[0.98] dark:bg-[#5B9BD5] dark:text-[#14151A] dark:hover:bg-[#4A87BE]"
        >
          Explore Articles
        </Link>

        {/* Secondary Action Button — white bg, navy text, no border */}
        {user?.role === "admin" || (user?.role === "blog_writer" && user?.writerVerification?.status === "approved") ? (
          <Link
            href="/writers/posts"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-xs md:text-sm font-medium text-[#0B3C6B] shadow-sm transition-transform duration-200 hover:bg-[#0B3C6B]/5 hover:scale-[1.02] active:scale-[0.98] dark:bg-[#1E2028] dark:text-[#5B9BD5] dark:hover:bg-[#5B9BD5]/10"
          >
            Write New Post
          </Link>
        ) : (
          <Link
            href="/apply-writer"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-xs md:text-sm font-medium text-[#0B3C6B] shadow-sm transition-transform duration-200 hover:bg-[#0B3C6B]/5 hover:scale-[1.02] active:scale-[0.98] dark:bg-[#1E2028] dark:text-[#5B9BD5] dark:hover:bg-[#5B9BD5]/10"
          >
            Become a Contributor
          </Link>
        )}
      </motion.div>
    </motion.div>
  </div>
</div>
  );
}