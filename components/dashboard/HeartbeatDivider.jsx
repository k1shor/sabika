"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function HeartbeatDivider({ className = "", strokeColor }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`relative flex items-center justify-center py-4 w-full overflow-hidden ${className}`}>
      <div className="w-full flex items-center">
        {/* Background baseline */}
        <div className="h-px flex-1 bg-[#0B3C6B]/15 dark:bg-[#5B9BD5]/20" />

        {/* Center ECG + Mountain Peak Motif */}
        <div className="shrink-0 px-2">
          <svg
            width="180"
            height="32"
            viewBox="0 0 180 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-44 h-8"
            aria-hidden="true"
          >
            {/* Soft glow background path */}
            <path
              d="M 0 16 L 40 16 L 48 16 L 52 22 L 58 4 L 66 28 L 74 8 L 80 16 L 86 16 C 92 16 96 11 102 16 L 110 16 L 114 20 L 120 6 L 128 26 L 134 16 L 180 16"
              className="stroke-[#C8102E]/20 dark:stroke-[#E85D6B]/25"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Animated ECG Pulse + Mountain Peak Path */}
            <motion.path
              d="M 0 16 L 40 16 L 48 16 L 52 22 L 58 4 L 66 28 L 74 8 L 80 16 L 86 16 C 92 16 96 11 102 16 L 110 16 L 114 20 L 120 6 L 128 26 L 134 16 L 180 16"
              className={strokeColor || "stroke-[#C8102E] dark:stroke-[#E85D6B]"}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0, opacity: 0.3 }}
              whileInView={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Background baseline */}
        <div className="h-px flex-1 bg-[#0B3C6B]/15 dark:bg-[#5B9BD5]/20" />
      </div>
    </div>
  );
}
