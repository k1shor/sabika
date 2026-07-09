"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Button from "@/components/Button";
import SecondaryButton from "@/components/SecondaryButton";
import Container from "@/components/Container";
import HeroInfoCard from "@/components/home/HeroInfoCard";
import { HERO_PARTICLES, HERO_TRUST_BADGES } from "@/components/home/homeData";

function Particle({ x, y, size, delay, duration, color }) {
  return (
    <motion.div
      className="absolute rounded-full opacity-20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color }}
      animate={{ y: [0, -30, 0], opacity: [0.15, 0.35, 0.15] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-blue-50/40 to-red-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-red-950/10" />
      <div className="absolute top-0 right-0 h-150 w-150 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-500/10" />
      <div className="absolute bottom-0 left-0 h-125 w-125 rounded-full bg-red-100/40 blur-3xl dark:bg-red-500/10" />
      {HERO_PARTICLES.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}
    </div>
  );
}

function HeroIntro() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-sm shadow-sm dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100/80"
      >
        <motion.span
          className="h-2 w-2 rounded-full bg-blue-600"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        Nepal&apos;s Nursing Community Platform
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.1 }}
        className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white"
      >
        Welcome to{" "}
        <motion.span className="text-blue-700 dark:text-blue-400" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          Nursing
        </motion.span>{" "}
        <motion.span className="text-red-600 dark:text-red-400" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          Nepal
        </motion.span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-4 text-slate-600 leading-relaxed text-lg max-w-md dark:text-blue-100/75"
      >
        A community-driven platform where nursing students and professionals share real
        experiences, study guidance, clinical stories, and career journeys — honestly and safely.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-7 flex flex-wrap gap-3"
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/blogs"><Button>Explore Articles →</Button></Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/contact"><SecondaryButton>Become a Contributor</SecondaryButton></Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-blue-100/50"
      >
        {HERO_TRUST_BADGES.map((badge) => (
          <span key={badge} className="flex items-center gap-1 font-medium">{badge}</span>
        ))}
      </motion.div>
    </div>
  );
}

function HeroScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
    >
      <span className="text-xs text-slate-400 dark:text-blue-100/40">Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center dark:border-blue-400/30"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-blue-300/60" />
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden">
      <HeroBackground />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <HeroIntro />
            <HeroInfoCard />
          </div>
        </Container>
      </motion.div>

      <HeroScrollHint />
    </section>
  );
}