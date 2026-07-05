"use client";

import CardGrid from "@/components/shared/CardGrid";
import IconTextCard from "@/components/shared/IconTextCard";

const OPTIONS = [
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
];

/**
 * PublishingOptions
 *
 * "Verified Identity. Your Choice of Voice." block.
 * Self-contained — owns its heading, subtitle, and both option cards.
 * Similar concept to home's VerifiedIdentity but scoped as a sub-section
 * (no full-page padding/Container wrapper).
 */
export default function PublishingOptions() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6
      dark:border-blue-400/20 dark:bg-blue-950/30">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
        Verified Identity. Your Choice of Voice.
      </h2>
      <p className="text-sm text-slate-500 dark:text-blue-100/60 mb-4">
        All contributors are verified by our admin — but how you appear on each post is entirely up to you.
      </p>
      <CardGrid
        items={OPTIONS}
        className="grid gap-3 md:grid-cols-2"
        renderItem={(option) => <IconTextCard {...option} />}
      />
    </div>
  );
}
