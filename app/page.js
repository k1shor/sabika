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

// ── Animated counter ───────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

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
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-linear(circle at 50% 0%, ${color}10, transparent 70%)` }}
      />
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

// ── Testimonial card ───────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, avatar, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm"
    >
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-slate-600 leading-relaxed italic">&quot;{quote}&quot;</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
          {avatar}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">{name}</div>
          <div className="text-xs text-slate-500">{role}</div>
        </div>
      </div>
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
    { icon: "🩺", title: "Nursing Care Tips", desc: "Practical, evidence-based guidance for patients and their families.", color: "#1d4ed8" },
    { icon: "📚", title: "Student Support", desc: "Structured study materials tailored for nursing students across Nepal.", color: "#dc2626" },
    { icon: "💉", title: "Clinical Procedures", desc: "Step-by-step procedure guides aligned with Nepal's healthcare standards.", color: "#1d4ed8" },
    { icon: "🏥", title: "Health Awareness", desc: "Prevention guides and health literacy content for communities.", color: "#dc2626" },
    { icon: "🌐", title: "Community Hub", desc: "Connect with nursing professionals and students across Nepal.", color: "#1d4ed8" },
    { icon: "📋", title: "FAQs & Resources", desc: "Quick answers to common patient-care and academic questions.", color: "#dc2626" },
  ];

  const stats = [
    { value: 1200, suffix: "+", label: "Articles Published" },
    { value: 8400, suffix: "+", label: "Students Helped" },
    { value: 77, suffix:"+", label: "Districts Covered" },
    { value: 98, suffix: "%", label: "Satisfaction Rate" },
  ];

  const testimonials = [
    { quote: "Nursing Nepal helped me pass my board exams. The study guides are incredibly well-structured.", name: "Priya Shrestha", role: "B.Sc Nursing Student, Kathmandu", avatar: "PS" },
    { quote: "As a rural health worker, the patient-care guides in Nepali context have been a lifesaver.", name: "Binod Rai", role: "Community Nurse, Dharan", avatar: "BR" },
    { quote: "Finally a platform that understands the Nepal healthcare system. Highly recommended!", name: "Anita Tamang", role: "Staff Nurse, BPKIHS", avatar: "AT" },
  ];

  const faqs = [
    { q: "Is Nursing Nepal free to use?", a: "Yes! All articles, guides, and study materials are completely free for everyone." },
    { q: "Who writes the content on Nursing Nepal?", a: "Our content is written and reviewed by qualified nurses, nursing educators, and healthcare professionals based in Nepal." },
    { q: "Can I contribute articles or resources?", a: "Absolutely. We welcome contributions from nursing professionals and students. Use the Contact page to get in touch." },
    { q: "Is the content suitable for patients and families?", a: "Yes. We write for both healthcare professionals and the general public, with clearly labeled sections for each audience." },
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
                  Nursing Care & Learning Platform
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
                  Your trusted place for nursing knowledge, patient-care guidance, and professional growth.
                  Explore health articles, nursing tips, and practical information designed for Nepal.
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
                    <Link href="/contact"><SecondaryButton>Contact Us</SecondaryButton></Link>
                  </motion.div>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 flex flex-wrap gap-4 text-xs text-slate-500"
                >
                  {["✓ Free for all", "✓ Nepal-focused", "✓ Reviewed by nurses"].map(t => (
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
                    { color: "bg-blue-600", text: "Nursing care tips for patients and families" },
                    { color: "bg-red-500", text: "Study support for nursing students" },
                    { color: "bg-blue-600", text: "Basic health awareness and prevention guides" },
                    { color: "bg-red-500", text: "Articles, FAQs, and community support" },
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
                    Improve healthcare awareness and nursing excellence across Nepal through simple, practical resources.
                  </div>
                </motion.div>

                {/* CTA inside card */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85 }}
                  className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3"
                >
                  <span className="text-xs text-slate-500">Ready to get started?</span>
                  <Link href="/blogs" className="text-xs font-semibold text-blue-700 hover:underline">Browse articles →</Link>
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

      {/* ── Stats strip ───────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white/80 backdrop-blur-sm py-12">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, suffix, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`text-4xl font-extrabold tracking-tight ${i % 2 === 0 ? "text-blue-700" : "text-red-600"}`}>
                  <Counter to={value} suffix={suffix} />
                </div>
                <div className="mt-1 text-sm text-slate-500 font-medium">{label}</div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="py-2 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-slate-50/50 to-white" />
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Everything you need
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for <span className="text-blue-700">Nepal</span> <span className="text-red-600">Nurses</span>
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              From clinical guidance to academic support, we have every angle covered.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
          </div>
        </Container>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <section className="py-2 bg-linear-to-b from-blue-50/40 to-slate-50/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by <span className="text-blue-700">nurses</span> nationwide
            </h2>
            <p className="mt-3 text-slate-500">Hear from people already using Nursing Nepal.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} index={i} />)}
          </div>
        </Container>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="py-2">
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
                Here are some of the most common questions from our community of students, nurses, and healthcare professionals.
              </p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5"
              >
                <div className="text-sm font-semibold text-blue-800">Still have questions?</div>
                <p className="mt-1 text-sm text-blue-700/80">Our team responds within 24 hours on working days.</p>
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
      <section className="py-2 relative overflow-hidden">
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
              🏥
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Empowering nurses,<br />
              <span className="text-red-400">one article</span> at a time.
            </h2>

            <p className="mt-5 text-blue-200 max-w-lg mx-auto leading-relaxed">
              Join thousands of nursing students and professionals who rely on Nursing Nepal every day for trusted, practical healthcare knowledge.
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
                    Start Reading <span>→</span>
                  </button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/contact">
                  <button className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20 transition-colors">
                    Get in Touch
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Bottom micro-stats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-blue-300"
            >
              {["1,200+ Articles", "8,400+ Students", "77 Districts", "Always Free"].map((t, i) => (
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
