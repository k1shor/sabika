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
      icon: "🎓",
      title: "For Nursing Students",
      desc: "Study-friendly notes, nursing concepts, exam guidance, and structured topics to help you build strong clinical understanding with confidence.",
      accent: "from-blue-500 to-blue-400",
    },
    {
      icon: "🩺",
      title: "For Nurses & Professionals",
      desc: "Improve patient safety and quality care through nursing protocols, documentation tips, monitoring guidance, and clinical best practices.",
      accent: "from-red-500 to-red-400",
    },
    {
      icon: "🏠",
      title: "For Families & Caregivers",
      desc: "Simple home-care knowledge for recovery support, hygiene care, nutrition awareness, medication routines, and recognizing warning signs early.",
      accent: "from-blue-500 to-red-400",
    },
  ];

  const features = [
    { icon: "📄", title: "Nursing Articles & Notes",  desc: "Simple explanations, key points, and learning resources." },
    { icon: "💊", title: "Patient Care Guidance",     desc: "Daily care tips, monitoring, hygiene, nutrition, and safety practices." },
    { icon: "❓", title: "FAQs for Quick Answers",    desc: "Short, direct answers to common nursing and health questions." },
    { icon: "📚", title: "Learning Support & Tools",  desc: "Study materials, reference points, and organized categories." },
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
            Nursing Nepal —{" "}
            <span className="text-blue-700">Care</span>,{" "}
            <span className="text-red-600">Education</span> &amp; Guidance
          </h1>
        </FadeUp>

        {/* Intro */}
        <FadeUp delay={0.14}>
          <p className="mt-4 text-slate-600 leading-relaxed dark:text-blue-100/75">
            Nursing Nepal is a digital platform built to support{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              nursing students, healthcare professionals, and families
            </span>{" "}
            by providing simplified nursing knowledge, practical patient-care guidance,
            and health awareness resources in a clear and accessible way.
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
              text: "To make nursing education and patient-care guidance more accessible, practical, and easy to understand for everyone in Nepal — from learners to working professionals and families.",
            },
            {
              title: "Our Vision",
              icon: "🌏",
              text: "To grow into Nepal's trusted nursing knowledge hub that encourages quality care, continuous learning, and a stronger healthcare community through digital support.",
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

        {/* What you'll find */}
        <FadeUp delay={0.1} className="mt-6">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6
            dark:border-blue-400/20 dark:bg-blue-950/30">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
              What You'll Find on Nursing Nepal
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
              <div className="text-lg font-extrabold">Want to suggest a topic?</div>
              <div className="mt-1 text-sm text-white/90">
                Tell us what nursing topics you want next — wound care, injection safety, first aid,
                pediatric nursing, mental health, nutrition, and more.
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="shrink-0">
              <Link
                href="/contact"
                className="inline-block rounded-xl bg-white/20 border border-white/30 px-5 py-2.5 text-sm font-extrabold text-white
                  hover:bg-white/30 transition backdrop-blur-sm"
              >
                Contact Us →
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
              <span className="font-semibold">Disclaimer:</span> Nursing Nepal provides educational and informational content only.
              It is not a substitute for professional medical diagnosis or treatment.
            </p>
          </div>
        </FadeUp>

      </div>
    </Container>
  );
}