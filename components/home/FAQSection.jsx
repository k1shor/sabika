"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/Container";
import FAQItem from "./FAQItem";
import { FAQS } from "./homeData";

function FAQIntro() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 mb-4 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100/70">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Common Questions
      </div>
      <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight dark:text-white">
        Got <span className="text-red-600 dark:text-red-400">questions?</span>
        <br />
        We have <span className="text-blue-700 dark:text-blue-400">answers.</span>
      </h2>
      <p className="mt-4 text-slate-500 leading-relaxed dark:text-blue-100/60">
        Here are answers to the most common questions from our community of students,
        nurses, and healthcare professionals.
      </p>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-400/20 dark:bg-blue-950/30"
      >
        <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">Still have questions?</div>
        <p className="mt-1 text-sm text-blue-700/80 dark:text-blue-300/70">Reach out — we respond on working days.</p>
        <Link href="/contact" className="mt-3 inline-block text-sm font-bold text-blue-700 hover:underline dark:text-blue-300">
          Contact us →
        </Link>
      </motion.div>
    </motion.div>
  );
}

function FAQList() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-950/25"
    >
      {FAQS.map((faq, index) => (
        <FAQItem key={faq.q} {...faq} index={index} />
      ))}
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-20">
      <Container>
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <FAQIntro />
          <FAQList />
        </div>
      </Container>
    </section>
  );
}