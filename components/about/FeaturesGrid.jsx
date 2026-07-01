"use client";

import CardGrid from "@/components/shared/CardGrid";
import IconTextCard from "@/components/shared/IconTextCard";
import ScrollReveal from "@/components/shared/ScrollReveal";

const FEATURES = [
  { icon: "🎭", title: "Anonymous Publishing",  desc: "Verified users can publish without revealing identity — safe space for honest workplace stories." },
  { icon: "🏥", title: "Hospital Diaries",      desc: "Real stories from clinical and hospital life — memorable moments, tough shifts, lessons learned." },
  { icon: "🌏", title: "Abroad Pathway Guides", desc: "Experience-based guides on working and studying nursing outside Nepal." },
  { icon: "🎓", title: "Exam & Study Support",  desc: "Entrance exam tips, study techniques, and licensing exam guidance from those who passed." },
  { icon: "🤝", title: "Mentor Connect",        desc: "Students can follow experienced nurses and ask career or study-related questions." },
  { icon: "🔖", title: "Categories & Flairs",   desc: "Content tagged by role and topic — find exactly what's relevant to your journey." },
];

function FeatureCard({ icon, title, desc, index }) {
  return (
    <ScrollReveal
      as={IconTextCard}
      icon={icon}
      title={title}
      desc={desc}
      size="inline"
      animated
      variant="softPop"
      margin="-40px"
      transition={{ duration: 0.45, delay: index * 0.08 }}
      whileHover={{ backgroundColor: "rgba(239,246,255,0.8)" }}
      className="dark:hover:bg-blue-950/40"
    />
  );
}

/**
 * FeaturesGrid
 *
 * "What You Will Find on Nursing Nepal" block.
 * Uses a compact FeatureCard style (icon + title inline, no accent bar)
 * that differs from the home page FeatureCard — kept local intentionally.
 */
export default function FeaturesGrid() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6
      dark:border-blue-400/20 dark:bg-blue-950/30">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
        What You Will Find on Nursing Nepal
      </h2>
      <CardGrid
        items={FEATURES}
        className="grid gap-3 md:grid-cols-2"
        renderItem={(feature, index) => <FeatureCard {...feature} index={index} />}
      />
    </div>
  );
}
