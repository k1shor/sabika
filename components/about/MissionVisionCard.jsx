"use client";

/**
 * MissionVisionCard
 *
 * Reusable static card for mission, vision, or values content.
 * No animation here — wrap in <FadeUp> at the call site if needed.
 * Works on About, Team, Press, or any page with a dual-column info block.
 *
 * @param {string} icon   — emoji or icon
 * @param {string} title  — card heading (e.g. "Our Mission")
 * @param {string} text   — body paragraph
 */
export default function MissionVisionCard({ icon, title, text }) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white/80 p-6
      dark:border-blue-400/20 dark:bg-blue-950/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">{text}</p>
    </div>
  );
}