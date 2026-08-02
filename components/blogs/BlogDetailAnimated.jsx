"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function BlogDetailAnimated({ children }) {
  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp}>
      {children}
    </motion.div>
  );
}
