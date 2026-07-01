"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/Container";
import { FINAL_CTA_BADGES } from "@/components/home/homeData";

function FinalCTABackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-linear-to-br from-blue-700 via-blue-800 to-slate-900" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-red-600/20 blur-3xl"
      />
    </div>
  );
}

function FinalCTAButtons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="mt-9 flex flex-wrap justify-center gap-4"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
        <Link href="/blogs">
          <button className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-800 shadow-lg hover:bg-blue-50 transition-colors">
            Read Articles <span>→</span>
          </button>
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
        <Link href="/contact">
          <button className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20 transition-colors">
            Become a Contributor
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function FinalCTABadges() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-blue-300"
    >
      {FINAL_CTA_BADGES.map((badge) => (
        <span key={badge} className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-blue-400" />
          {badge}
        </span>
      ))}
    </motion.div>
  );
}

export default function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <FinalCTABackground />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur text-3xl mb-6 mx-auto border border-white/20"
          >
            🤝
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Your story can help
            <br />
            <span className="text-red-400">the next nurse.</span>
          </h2>

          <p className="mt-5 text-blue-200 max-w-lg mx-auto leading-relaxed">
            Whether you want to share what you know, learn from others, or simply find a community
            that understands — Nursing Nepal is your space.
          </p>

          <FinalCTAButtons />
          <FinalCTABadges />
        </motion.div>
      </Container>
    </section>
  );
}
