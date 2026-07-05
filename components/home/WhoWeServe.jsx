"use client";

import { motion } from "framer-motion";
import Container from "@/components/Container";
import CardGrid from "@/components/shared/CardGrid";
import AudienceCard from "./AudienceCard";

const AUDIENCE = [
  { emoji: "📖", label: "Nursing Students",        color: "#1d4ed8" },
  { emoji: "✅", label: "Entrance Exam Passers",   color: "#dc2626" },
  { emoji: "🩺", label: "Registered Nurses",       color: "#1d4ed8" },
  { emoji: "🏨", label: "Working Nurses in Nepal", color: "#dc2626" },
  { emoji: "✈️", label: "Nurses Studying Abroad",  color: "#1d4ed8" },
  { emoji: "🌐", label: "Nurses Working Abroad",   color: "#dc2626" },
];

export default function WhoWeServe() {
  return (
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
          <p className="mt-2 text-slate-500 text-sm">
            Anyone in the nursing journey — from first-year students to nurses working globally.
          </p>
        </motion.div>

        <CardGrid
          items={AUDIENCE}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
          renderItem={(item, index) => <AudienceCard {...item} index={index} />}
        />
      </Container>
    </section>
  );
}
