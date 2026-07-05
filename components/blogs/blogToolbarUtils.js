export const CATEGORY_LABELS = {
  entrance_pass: "Entrance Pass",
  nursing_student: "Nursing Student",
  working_nurse: "Working Nurse",
  abroad_study: "Abroad Study",
  abroad_work: "Abroad Work",
};

export const POST_TYPE_LABELS = {
  normal: "General",
  reality_check: "Reality Check",
  hospital_diary: "Hospital Diary",
  country_pathway: "Country Pathway",
};

export const POST_TYPE_COLORS = {
  reality_check: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-500/20",
  hospital_diary: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400",
  country_pathway: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400",
};

export function formatPostDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function getPostTypes(posts) {
  return Array.from(new Set(posts.map((post) => post.postType).filter(Boolean)));
}

export function filterAndSortPosts(posts, filters) {
  const { query, category, postType, tag, sort } = filters;
  const q = query.trim().toLowerCase();
  let list = [...posts];

  if (category !== "all") list = list.filter((post) => post.category === category);
  if (postType !== "all") list = list.filter((post) => post.postType === postType);
  if (tag !== "all") list = list.filter((post) => Array.isArray(post.tags) && post.tags.includes(tag));

  if (q) {
    list = list.filter((post) => {
      const text = [
        post.title,
        post.excerpt,
        post.category,
        post.postType,
        Array.isArray(post.tags) ? post.tags.join(" ") : "",
        post.authorId?.name || "",
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(q);
    });
  }

  list.sort((a, b) => {
    const da = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const db = new Date(b.publishedAt || b.createdAt || 0).getTime();
    if (sort === "latest") return db - da;
    if (sort === "oldest") return da - db;
    if (sort === "popular") return (b.views || 0) - (a.views || 0);
    if (sort === "az") return (a.title || "").localeCompare(b.title || "");
    return 0;
  });

  return list;
}
