"use client";

import ScrollReveal from "@/components/shared/ScrollReveal";

/**
 * FadeUp
 *
 * Reusable scroll-triggered fade-up wrapper.
 * Use anywhere you want a simple entrance animation tied to scroll position.
 *
 * @param {ReactNode} children
 * @param {number}    delay     — animation delay in seconds (default 0)
 * @param {string}    className — forwarded to the motion.div
 */
export default function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <ScrollReveal
      className={className}
      delay={delay}
      margin="-60px"
      variant="fadeUp"
    >
      {children}
    </ScrollReveal>
  );
}
