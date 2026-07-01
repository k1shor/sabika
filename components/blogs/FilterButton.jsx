"use client";

export default function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-blue-400/20 dark:text-blue-100/70"
      }`}
    >
      {children}
    </button>
  );
}
