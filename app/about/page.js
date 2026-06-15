"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Container from "@/components/Container";
import Link from "next/link";

// ─── Reusable fade-up wrapper ─────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Audience card ────────────────────────────────────────────────────────────
function AudienceCard({ icon, title, desc, accent, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, boxShadow: "0 16px 32px -8px rgba(0,0,0,0.10)" }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5
        dark:border-blue-400/20 dark:bg-blue-950/30"
    >
      <div className={`absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-linear-to-r ${accent}`} />
      <div className="mt-2 text-2xl">{icon}</div>
      <div className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">{title}</div>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">{desc}</p>
    </motion.div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ title, desc, icon, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ backgroundColor: "rgba(239,246,255,0.8)" }}
      className="rounded-xl border border-slate-200 bg-white p-4 transition-colors
        dark:border-blue-400/20 dark:bg-slate-950/40 dark:hover:bg-blue-950/40"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div className="font-bold text-slate-900 dark:text-white">{title}</div>
      </div>
      <div className="mt-1.5 text-sm text-slate-600 dark:text-blue-100/75">{desc}</div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const audiences = [
    {
      icon: "📖",
      title: "Nursing Students",
      desc: "Find exam prep, study strategies, clinical posting experiences, and guidance from nurses who have already walked your path.",
      accent: "from-blue-500 to-blue-400",
    },
    {
      icon: "🩺",
      title: "Registered Nurses",
      desc: "Share your workplace realities, clinical experiences, and professional insights — publicly or anonymously, your choice.",
      accent: "from-red-500 to-red-400",
    },
    {
      icon: "✈️",
      title: "Nurses Going Abroad",
      desc: "Real pathway guides from nurses who have done it — NCLEX prep, UK/Australia routes, visa processes, and salary realities.",
      accent: "from-blue-500 to-red-400",
    },
  ];

  const features = [
    { icon: "🎭", title: "Anonymous Publishing",      desc: "Verified users can publish without revealing identity — safe space for honest workplace stories." },
    { icon: "🏥", title: "Hospital Diaries",          desc: "Real stories from clinical and hospital life — memorable moments, tough shifts, lessons learned." },
    { icon: "🌏", title: "Abroad Pathway Guides",     desc: "Experience-based guides on working and studying nursing outside Nepal." },
    { icon: "🎓", title: "Exam & Study Support",      desc: "Entrance exam tips, study techniques, and licensing exam guidance from those who passed." },
    { icon: "🤝", title: "Mentor Connect",            desc: "Students can follow experienced nurses and ask career or study-related questions." },
    { icon: "🔖", title: "Categories & Flairs",       desc: "Content tagged by role and topic — find exactly what's relevant to your journey." },
  ];

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm
        dark:border-blue-400/20 dark:bg-blue-950/25">

        {/* Badge */}
        <FadeUp>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1
            text-xs font-semibold text-slate-600
            dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
            <motion.span
              className="h-2 w-2 rounded-full bg-blue-600"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            About Nursing Nepal
          </div>
        </FadeUp>

        {/* Heading */}
        <FadeUp delay={0.08}>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            A community built by{" "}
            <span className="text-blue-700">nurses</span>,{" "}
            for <span className="text-red-600">nurses</span>
          </h1>
        </FadeUp>

        {/* Intro */}
        <FadeUp delay={0.14}>
          <p className="mt-4 text-slate-600 leading-relaxed dark:text-blue-100/75">
            Nursing Nepal is a{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              community-driven knowledge-sharing platform
            </span>{" "}
            where nursing students and professionals share real experiences, clinical stories, exam journeys,
            and career guidance. It is not a textbook site — it is a space for honest, practical, experience-based learning,
            with verified contributors and privacy-controlled publishing.
          </p>
        </FadeUp>

        {/* Audience cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {audiences.map((a, i) => <AudienceCard key={i} {...a} index={i} />)}
        </div>

        {/* Mission & Vision */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Our Mission",
              icon: "🎯",
              text: "To build a trusted space where Nepal's nursing community can share knowledge, support one another, and grow together — through both professional credibility and honest, privacy-controlled storytelling.",
            },
            {
              title: "Our Vision",
              icon: "🌏",
              text: "To become the go-to community platform for Nepali nursing students and professionals — where real experiences guide future nurses, and no one has to figure it out alone.",
            },
          ].map((item, i) => (
            <FadeUp key={i} delay={0.1 + i * 0.1}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white/80 p-6
                dark:border-blue-400/20 dark:bg-blue-950/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{item.title}</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">{item.text}</p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* How publishing works */}
        <FadeUp delay={0.1} className="mt-6">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6
            dark:border-blue-400/20 dark:bg-blue-950/30">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
              Verified Identity. Your Choice of Voice.
            </h2>
            <p className="text-sm text-slate-500 dark:text-blue-100/60 mb-4">
              All contributors are verified by our admin — but how you appear on each post is entirely up to you.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  icon: "👤",
                  title: "Public Publishing",
                  desc: "Your name, photo, and role are shown. Posts appear on your profile. Great for mentoring, career guidance, and educational content.",
                  color: "#1d4ed8",
                },
                {
                  icon: "🎭",
                  title: "Anonymous Publishing",
                  desc: "Your identity stays hidden. Only your general role is shown (e.g., 'Registered Nurse'). No link to your profile. Safe for honest workplace stories.",
                  color: "#dc2626",
                },
              ].map(({ icon, title, desc, color }, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white p-4
                    dark:border-blue-400/20 dark:bg-slate-950/40"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
                    >
                      {icon}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{title}</div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-blue-100/75">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* What you will find */}
        <FadeUp delay={0.1} className="mt-6">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6
            dark:border-blue-400/20 dark:bg-blue-950/30">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
              What You Will Find on Nursing Nepal
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {features.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
            </div>
          </div>
        </FadeUp>

        {/* CTA banner */}
        <FadeUp delay={0.1} className="mt-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4
              rounded-2xl border border-blue-400/20 bg-linear-to-r from-blue-600 to-red-500 p-6 text-white shadow-sm"
          >
            <div>
              <div className="text-lg font-extrabold">Want to share your story?</div>
              <div className="mt-1 text-sm text-white/90">
                Apply to become a verified contributor — publish publicly or anonymously, it is your call.
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="shrink-0">
              <Link
                href="/contact"
                className="inline-block rounded-xl bg-white/20 border border-white/30 px-5 py-2.5 text-sm font-extrabold text-white
                  hover:bg-white/30 transition backdrop-blur-sm"
              >
                Get in Touch →
              </Link>
            </motion.div>
          </motion.div>
        </FadeUp>

        {/* Disclaimer */}
        <FadeUp delay={0.05} className="mt-6">
          <div className="flex items-start gap-2 rounded-xl border border-slate-200/60 bg-slate-50/60 px-4 py-3
            dark:border-blue-400/10 dark:bg-blue-950/20">
            <span className="text-sm">⚠️</span>
            <p className="text-xs text-slate-500 dark:text-blue-100/60">
              <span className="font-semibold">Disclaimer:</span> Content on Nursing Nepal is shared by community members for educational and informational purposes.
              It is not a substitute for professional medical advice or clinical judgment.
            </p>
          </div>
        </FadeUp>

      </div>
    </Container>
  );
}