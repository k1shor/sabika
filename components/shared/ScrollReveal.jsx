"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  lift: {
    initial: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0 },
  },
  pop: {
    initial: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  softPop: {
    initial: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
};

export default function ScrollReveal({
  as: Component = motion.div,
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  margin = "-60px",
  variant = "fadeUp",
  transition,
  whileHover,
  ...props
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin });
  const animation = variants[variant] || variants.fadeUp;

  return (
    <Component
      ref={ref}
      className={className}
      initial={animation.initial}
      animate={inView ? animation.visible : {}}
      transition={transition || { duration, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={whileHover}
      {...props}
    >
      {children}
    </Component>
  );
}
