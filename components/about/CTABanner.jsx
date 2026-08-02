"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * CTABanner
 *
 * Reusable gradient CTA strip. Good for any page bottom or mid-page nudge.
 *
 * @param {string} heading     — bold heading line
 * @param {string} subtext     — supporting sentence
 * @param {string} label       — button label
 * @param {string} href        — button destination
 */
export default function CTABanner({
  heading  = "Want to share your story?",
  subtext  = "Apply to become a verified contributor — publish publicly or anonymously, it is your call.",
  label    = "Get in Touch →",
  href     = "/contact",
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4
        rounded-2xl border border-blue-400/20 bg-linear-to-r from-blue-600 to-red-500 p-6 text-white shadow-sm"
    >
      <div>
        <div className="text-lg font-extrabold">{heading}</div>
        <div className="mt-1 text-sm text-white/90">{subtext}</div>
      </div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="shrink-0">
        <Link
          href={href}
          className="inline-block rounded-xl bg-white/20 border border-white/30 px-5 py-2.5
            text-sm font-extrabold text-white hover:bg-white/30 transition backdrop-blur-sm"
        >
          {label}
        </Link>
      </motion.div>
    </motion.div>
  );
}