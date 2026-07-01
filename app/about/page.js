"use client";

import { motion } from "framer-motion";
import Container from "@/components/Container";
import CardGrid from "@/components/shared/CardGrid";
import FadeUp from "@/components/about/FadeUp";
import AudienceCard from "@/components/about/AudienceCard";
import MissionVisionCard from "@/components/about/MissionVisionCard";
import PublishingOptions from "@/components/about/PublishingOptions";
import FeaturesGrid from "@/components/about/FeaturesGrid";
import CTABanner from "@/components/about/CTABanner";

const AUDIENCES = [
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

const MISSION_VISION = [
  {
    icon: "🎯",
    title: "Our Mission",
    text: "To build a trusted space where Nepal's nursing community can share knowledge, support one another, and grow together — through both professional credibility and honest, privacy-controlled storytelling.",
  },
  {
    icon: "🌏",
    title: "Our Vision",
    text: "To become the go-to community platform for Nepali nursing students and professionals — where real experiences guide future nurses, and no one has to figure it out alone.",
  },
];

export default function AboutPage() {
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
            and career guidance. It is not a textbook site — it is a space for honest, practical,
            experience-based learning, with verified contributors and privacy-controlled publishing.
          </p>
        </FadeUp>

        {/* Audience cards */}
        <CardGrid
          items={AUDIENCES}
          className="mt-8 grid gap-4 md:grid-cols-3"
          renderItem={(audience, index) => <AudienceCard {...audience} index={index} />}
        />

        {/* Mission & Vision */}
        <CardGrid
          items={MISSION_VISION}
          className="mt-6 grid gap-4 md:grid-cols-2"
          renderItem={(item, index) => (
            <FadeUp delay={0.1 + index * 0.1}>
              <MissionVisionCard {...item} />
            </FadeUp>
          )}
        />

        {/* Publishing options */}
        <FadeUp delay={0.1} className="mt-6">
          <PublishingOptions />
        </FadeUp>

        {/* Features grid */}
        <FadeUp delay={0.1} className="mt-6">
          <FeaturesGrid />
        </FadeUp>

        {/* CTA banner */}
        <FadeUp delay={0.1} className="mt-6">
          <CTABanner />
        </FadeUp>

        {/* Disclaimer */}
        <FadeUp delay={0.05} className="mt-6">
          <div className="flex items-start gap-2 rounded-xl border border-slate-200/60 bg-slate-50/60 px-4 py-3
            dark:border-blue-400/10 dark:bg-blue-950/20">
            <span className="text-sm">⚠️</span>
            <p className="text-xs text-slate-500 dark:text-blue-100/60">
              <span className="font-semibold">Disclaimer:</span> Content on Nursing Nepal is shared by
              community members for educational and informational purposes. It is not a substitute for
              professional medical advice or clinical judgment.
            </p>
          </div>
        </FadeUp>

      </div>
    </Container>
  );
}
