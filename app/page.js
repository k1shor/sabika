"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Button from "@/components/Button";
import SecondaryButton from "@/components/SecondaryButton";
import Container from "@/components/Container";

// ── Floating particle background ──────────────────────────────────────────────
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

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 6 + Math.random() * 14,
  delay: Math.random() * 4,
  duration: 4 + Math.random() * 3,
  color: i % 2 === 0 ? "#1d4ed8" : "#dc2626",
}));

// ── Feature card ───────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm cursor-default"
    >
      <div className="relative z-10">
        <div
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl"
          style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
        >
          {icon}
        </div>
        <h3 className="mt-4 font-bold text-slate-800 text-[15px] leading-snug">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 w-0"
        style={{ background: color }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// ── Who is this for card ───────────────────────────────────────────────────────
function AudienceCard({ emoji, label, color, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-5 text-center backdrop-blur-sm"
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="h-1 w-8 rounded-full" style={{ background: color }} />
    </motion.div>
  );
}

// ── FAQ item ───────────────────────────────────────────────────────────────────
function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="border-b border-slate-200 last:border-0"
    >
      <button
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          className="ml-4 shrink-0 text-blue-600 text-lg font-light">+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const features = [
    { icon: "📝", title: "Experience-Based Blogs", desc: "Real stories from nursing students and professionals — clinical postings, workplace realities, exam journeys.", color: "#1d4ed8" },
    { icon: "🎓", title: "Entrance & Exam Prep", desc: "Study techniques, preparation strategies, and guidance from those who have already been through it.", color: "#dc2626" },
    { icon: "🌏", title: "Abroad Pathways", desc: "Honest guides on NCLEX, UK, Australia, and more — written by nurses who actually made the move.", color: "#1d4ed8" },
    { icon: "🏥", title: "Hospital Diaries", desc: "Memorable patient interactions, difficult shifts, and lessons from real hospital and clinical life.", color: "#dc2626" },
    { icon: "🎭", title: "Anonymous Storytelling", desc: "Verified users can publish anonymously — share workplace realities and honest experiences without fear.", color: "#1d4ed8" },
    { icon: "🤝", title: "Mentor Connect", desc: "Students can follow experienced nurses and ask career or study questions within the community.", color: "#dc2626" },
  ];

  const audience = [
    { emoji: "📖", label: "Nursing Students", color: "#1d4ed8" },
    { emoji: "✅", label: "Entrance Exam Passers", color: "#dc2626" },
    { emoji: "🩺", label: "Registered Nurses", color: "#1d4ed8" },
    { emoji: "🏨", label: "Working Nurses in Nepal", color: "#dc2626" },
    { emoji: "✈️", label: "Nurses Studying Abroad", color: "#1d4ed8" },
    { emoji: "🌐", label: "Nurses Working Abroad", color: "#dc2626" },
  ];

  const faqs = [
    { q: "Who can publish on Nursing Nepal?", a: "Nursing students, registered nurses, and healthcare professionals. All contributors are verified by the admin to maintain trust and credibility on the platform." },
    { q: "Can I publish anonymously?", a: "Yes. Verified users can choose to publish anonymously. Your identity stays hidden — only your general role (e.g., 'Registered Nurse') is shown. Anonymous posts are not linked to your profile." },
    { q: "What kind of content can I share?", a: "Clinical experiences, entrance exam tips, hospital diaries, workplace realities, abroad career guides, personal nursing journeys, and more. Content is tagged by category and flair for easy discovery." },
    { q: "Is Nursing Nepal free to use?", a: "Yes, reading all articles and resources is completely free. Anyone can browse and search content without an account." },
    { q: "How do I become a verified contributor?", a: "Use the Contact page to get in touch with our team. We verify contributors based on their nursing background before granting publishing access." },
  ];

  return (
    <div className="relative overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Subtle mesh background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-blue-50/40 to-red-50/30" />
          <div className="absolute top-0 right-0 h-150 w-150 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-125 w-125 rounded-full bg-red-100/40 blur-3xl" />
          {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full">
          <Container>
            <div className="grid gap-10 md:grid-cols-2 items-center">

              {/* Left */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-sm shadow-sm"
                >
                  <motion.span
                    className="h-2 w-2 rounded-full bg-blue-600"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Nepal's Nursing Community Platform
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.1 }}
                  className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
                >
                  Welcome to{" "}
                  <motion.span
                    className="text-blue-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >Nursing</motion.span>{" "}
                  <motion.span
                    className="text-red-600"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >Nepal</motion.span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  className="mt-4 text-slate-600 leading-relaxed text-lg max-w-md"
                >
                  A community-driven platform where nursing students and professionals share real experiences, study guidance, clinical stories, and career journeys — honestly and safely.
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

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 flex flex-wrap gap-4 text-xs text-slate-500"
                >
                  {["✓ Verified contributors", "✓ Anonymous publishing", "✓ Free to read"].map(t => (
                    <span key={t} className="flex items-center gap-1 font-medium">{t}</span>
                  ))}
                </motion.div>
              </div>

              {/* Right card */}
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-slate-200 bg-white/75 p-7 shadow-lg backdrop-blur-md"
              >
                <div className="font-bold text-slate-700 tracking-wide uppercase text-xs">What you will find here</div>

                <ul className="mt-5 space-y-3.5">
                  {[
                    { color: "bg-blue-600", text: "Real experiences from nurses and students across Nepal" },
                    { color: "bg-red-500", text: "Entrance exam and licensing exam preparation guides" },
                    { color: "bg-blue-600", text: "Honest stories from hospital and clinical life" },
                    { color: "bg-red-500", text: "Career pathways for working or studying abroad" },
                  ].map(({ color, text }, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.08 }}
                      className="flex items-start gap-3 text-sm text-slate-600"
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`} />
                      {text}
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="mt-6 rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <div className="text-sm font-bold text-slate-800">Our goal</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Build a trusted space where the nursing community can share knowledge, support each other, and grow together — through both professional credibility and honest, private storytelling.
                  </div>
                </motion.div>

                {/* CTA inside card */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85 }}
                  className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3"
                >
                  <span className="text-xs text-slate-500">Want to share your story?</span>
                  <Link href="/contact" className="text-xs font-semibold text-blue-700 hover:underline">Apply to write →</Link>
                </motion.div>
              </motion.div>
            </div>
          </Container>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-xs text-slate-400">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Who is this for ───────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white/80 backdrop-blur-sm py-14">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Built for
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Who is <span className="text-blue-700">Nursing Nepal</span> for?
            </h2>
            <p className="mt-2 text-slate-500 text-sm">Anyone in the nursing journey — from first-year students to nurses working globally.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {audience.map((a, i) => <AudienceCard key={i} {...a} index={i} />)}
          </div>
        </Container>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-slate-50/50 to-white" />
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> What we offer
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              More than a <span className="text-blue-700">blog</span>
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Nursing Nepal combines real-world storytelling, verified expertise, and privacy-controlled publishing in one place.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
          </div>
        </Container>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-linear-to-b from-blue-50/40 to-slate-50/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Verified identity, <span className="text-red-600">your choice</span> of voice
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              All contributors are verified — but you decide how you appear on each post.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: "👤",
                title: "Public Publishing",
                color: "#1d4ed8",
                points: [
                  "Your name, photo, and role are visible",
                  "Posts appear on your public profile",
                  "Great for educational content and mentoring",
                  "Builds your credibility in the community",
                ],
              },
              {
                icon: "🎭",
                title: "Anonymous Publishing",
                color: "#dc2626",
                points: [
                  "Your identity stays completely hidden",
                  "Only general role shown (e.g., 'Registered Nurse')",
                  "Post is not linked to your profile",
                  "Safe space for honest workplace realities",
                ],
              },
            ].map(({ icon, title, color, points }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}
                  >
                    {icon}
                  </div>
                  <h3 className="font-bold text-slate-800">{title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <Container>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Common Questions
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Got <span className="text-red-600">questions?</span><br />
                We have <span className="text-blue-700">answers.</span>
              </h2>
              <p className="mt-4 text-slate-500 leading-relaxed">
                Here are answers to the most common questions from our community of students, nurses, and healthcare professionals.
              </p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5"
              >
                <div className="text-sm font-semibold text-blue-800">Still have questions?</div>
                <p className="mt-1 text-sm text-blue-700/80">Reach out — we respond on working days.</p>
                <Link href="/contact" className="mt-3 inline-block text-sm font-bold text-blue-700 hover:underline">
                  Contact us →
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm"
            >
              {faqs.map((f, i) => <FaqItem key={i} {...f} index={i} />)}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
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
              Your story can help<br />
              <span className="text-red-400">the next nurse.</span>
            </h2>

            <p className="mt-5 text-blue-200 max-w-lg mx-auto leading-relaxed">
              Whether you want to share what you know, learn from others, or simply find a community that understands — Nursing Nepal is your space.
            </p>

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

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-blue-300"
            >
              {["Verified Contributors", "Anonymous Publishing", "Free to Read", "Nepal-Focused"].map((t, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-blue-400" />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

    </div>
  );
}