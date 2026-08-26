"use client";

import { CATEGORY_LABELS } from "./blogToolbarUtils";

export default function BlogsFilters({
  categories = [],
  category = "all",
  onCategoryChange,
  tags = [],
  tag = "all",
  onTagChange,
}) {
  // Max 5-6 category tabs visible
  const visibleCategories = categories.slice(0, 6);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Category Tabs (Max 5-6 visible) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onCategoryChange("all")}
          className={categoryTabClass(category === "all")}
        >
          All Categories
        </button>
        {visibleCategories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCategoryChange(item === category ? "all" : item)}
            className={categoryTabClass(category === item)}
          >
            {CATEGORY_LABELS[item] || item.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Single "Browse by topic" dropdown for tags */}
      {tags.length > 0 && (
        <div className="shrink-0">
          <select
            value={tag}
            onChange={(e) => onTagChange(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-[#EBE5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1B29] outline-none transition-colors duration-200 focus:border-[#0B3C6B] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:text-[#F2F0E9] dark:focus:border-[#5B9BD5]"
          >
            <option value="all">Browse by Topic / Tag</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function categoryTabClass(active) {
  return `rounded-xl px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
    active
      ? "bg-[#0B3C6B] text-white dark:bg-[#5B9BD5] dark:text-[#14151A]"
      : "border border-[#EBE5DB] bg-white text-[#6B6A5C] hover:bg-[#FBF8F3] hover:text-[#1C1B29] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:text-[#A8A69A] dark:hover:bg-[#14151A] dark:hover:text-[#F2F0E9]"
  }`;
}