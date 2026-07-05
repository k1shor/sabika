"use client";

import { motion } from "framer-motion";
import Container from "@/components/Container";
import CardGrid from "@/components/shared/CardGrid";
import FeatureCard from "./FeatureCard";

const FEATURES = [
  {
    icon: "📝",
    title: "Experience-Based Blogs",
    desc: "Real stories from nursing students and professionals — clinical postings, workplace realities, exam journeys.",
    color: "#1d4ed8",
  },
  {
    icon: "🎓",
    title: "Entrance & Exam Prep",
    desc: "Study techniques, preparation strategies, and guidance from those who have already been through it.",
    color: "#dc2626",
  },
  {
    icon: "🌏",
    title: "Abroad Pathways",
    desc: "Honest guides on NCLEX, UK, Australia, and more — written by nurses who actually made the move.",
    color: "#1d4ed8",
  },
  {
    icon: "🏥",
    title: "Hospital Diaries",
    desc: "Memorable patient interactions, difficult shifts, and lessons from real hospital and clinical life.",
    color: "#dc2626",
  },
  {
    icon: "🎭",
    title: "Anonymous Storytelling",
    desc: "Verified users can publish anonymously — share workplace realities and honest experiences without fear.",
    color: "#1d4ed8",
  },
  {
    icon: "🤝",
    title: "Mentor Connect",
    desc: "Students can follow experienced nurses and ask career or study questions within the community.",
    color: "#dc2626",
  },
];

export default function FeaturesSection() {
  return (
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
            Nursing Nepal combines real-world storytelling, verified expertise, and
            privacy-controlled publishing in one place.
          </p>
        </motion.div>

        <CardGrid
          items={FEATURES}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          renderItem={(feature, index) => <FeatureCard {...feature} index={index} />}
        />
      </Container>
    </section>
  );
}
