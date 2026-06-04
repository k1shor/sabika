"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Animated background linear
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {/* linear orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-80 h-80 bg-linear-to-br from-blue-500/30 to-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -50, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-80 h-80 bg-linear-to-tl from-red-500/20 to-pink-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 60, 0],
          y: [0, 60, -40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-linear-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.3, 0.5, 0.2, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// Floating particles background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

// Text reveal animation
const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.8,
      ease: [0.23, 1, 0.320, 1],
    },
  }),
};

// Word animation for title
function AnimatedTitle() {
  const words = ["Nursing", "Articles"];
  
  return (
    <div className="text-5xl md:text-6xl font-black tracking-tight">
      {words.map((word, wordIdx) => (
        <motion.div
          key={wordIdx}
          className="relative inline-block mr-4 overflow-hidden"
          initial="hidden"
          animate="visible"
        >
          {word.split("").map((char, charIdx) => (
            <motion.span
              key={charIdx}
              variants={textVariants}
              custom={wordIdx * 10 + charIdx}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// Stats card with number counter
function StatCard({ count }) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = count;
    const duration = 2;
    const increment = end / (duration * 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayCount(end);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateZ: -10 }}
      animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.08, rotateZ: 2 }}
      className="relative overflow-hidden rounded-2xl p-0.5 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl"
    >
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl px-6 py-3 flex items-center gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Resources
          </p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            {displayCount}+
          </p>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="ml-2 w-12 h-12 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Animated badge with pulse
function AnimatedBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="inline-flex items-center gap-2 rounded-full border-2 border-blue-500/50 bg-blue-500/10 backdrop-blur-xl px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-300 w-fit"
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-2 w-2 rounded-full bg-linear-to-r from-blue-500 to-purple-500"
      />
      Knowledge Hub
    </motion.div>
  );
}

// Subtitle with staggered words
function AnimatedSubtitle() {
  const subtitle = "Nursing tips, care plans, health guidance, and learning resources designed for Nepal.";
  const words = subtitle.split(" ");

  return (
    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={i + 2}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

// Scroll indicator
function ScrollIndicator() {
  return (
    <motion.div
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="mt-8 flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400"
    >
      <span className="text-xs font-semibold uppercase tracking-wider">Explore</span>
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </motion.div>
  );
}

export default function AnimatedBlogsHeader({ postsCount }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border-2 border-slate-200/50 dark:border-blue-400/30 bg-linear-to-br from-white/80 via-blue-50/40 to-white/60 dark:from-slate-900/80 dark:via-blue-950/30 dark:to-slate-900/60 backdrop-blur-2xl shadow-2xl p-8 md:p-12 lg:p-16"
    >
      {/* Animated background */}
      <AnimatedBackground />
      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8"
        >
          {/* Left: Title & Description */}
          <div className="flex-1">
            <AnimatedBadge />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-6 text-linear"
            >
              <AnimatedTitle />
            </motion.div>

            <AnimatedSubtitle />

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-bold text-white bg-linear-to-r from-blue-600 to-red-500 shadow-lg hover:shadow-2xl transition-all"
              >
                Browse All Articles
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl font-bold text-blue-600 dark:text-blue-400 border-2 border-blue-600/50 dark:border-blue-400/50 hover:bg-blue-600/10 transition-all"
              >
                View Categories
              </motion.button>
            </motion.div>
          </div>

          {/* Right: Stats Card */}
          <div className="lg:mt-4">
            <StatCard count={postsCount} />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="hidden lg:flex justify-center mt-16">
          <ScrollIndicator />
        </div>
      </div>
    </motion.div>
  );
}