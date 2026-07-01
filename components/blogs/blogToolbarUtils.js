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
