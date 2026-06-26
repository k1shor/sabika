export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

export const DASHBOARD_ARTICLES_PAGE_SIZE = 5;

const QUOTES = [
  "Nursing is not just a profession. It is a way of making a difference.",
  "The trained nurse has become one of the great blessings of humanity.",
  "Nurses dispense comfort, compassion, and caring without even a prescription.",
  "Caring is the essence of nursing.",
];

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function getRecentlyViewed() {
  if (typeof window === "undefined") return [];
  try {
    const items = JSON.parse(localStorage.getItem("recently-viewed") || "[]");
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return items.filter((item) => item.timestamp > cutoff).slice(0, 3);
  } catch {
    return [];
  }
}

export function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}
