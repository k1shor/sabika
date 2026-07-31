"use client";

import { APPLICATION_FILTERS } from "../utils/applicationUtils";

export default function ApplicationsFilterTabs({ filter, counts, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {APPLICATION_FILTERS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onFilterChange(item)}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition
            ${filter === item
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 text-slate-600 dark:border-blue-400/20 dark:text-blue-100/70"
            }`}
        >
          {item.charAt(0).toUpperCase() + item.slice(1)}
          <span className="ml-1.5 opacity-60">({counts[item]})</span>
        </button>
      ))}
    </div>
  );
}
