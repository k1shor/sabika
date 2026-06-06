import Link from "next/link";

const CATEGORY_LABELS = {
  entrance_pass:   "Entrance Pass",
  nursing_student: "Nursing Student",
  working_nurse:   "Working Nurse",
  abroad_study:    "Abroad Study",
  abroad_work:     "Abroad Work",
};

const POST_TYPE_COLORS = {
  reality_check:   "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-500/20",
  hospital_diary:  "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400",
  country_pathway: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400",
};

function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogCard({ post }) {
  // ✅ author display logic — 3 cases
  const authorName = post.isOfficialPost
    ? "Nursing Nepal"                        // admin post
    : post.isAnonymous
      ? "Anonymous Nurse"                    // anonymous writer post
      : (post.authorId?.name || "Unknown");  // normal writer post

  const authorInitial = post.isOfficialPost
    ? "N"
    : post.isAnonymous
      ? "?"
      : (authorName[0]?.toUpperCase() || "N");

  const typeColor = POST_TYPE_COLORS[post.postType] || "";
  const tags      = Array.isArray(post.tags) ? post.tags : [];

  return (
    <Link
      href={`/blogs/${encodeURIComponent(post.slug)}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/50 dark:hover:border-blue-400/30 overflow-hidden"
    >
      {/* Cover image */}
      {post.coverImage && (
        <div className="h-40 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Top row — category + postType + date */}
        <div className="flex flex-wrap items-center gap-2">
          {post.category && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-400">
              {CATEGORY_LABELS[post.category] || post.category.replace(/_/g, " ")}
            </span>
          )}
          {post.postType && post.postType !== "normal" && (
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${typeColor}`}>
              {post.postType.replace(/_/g, " ")}
            </span>
          )}
          {post.flair && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              {post.flair.replace(/_/g, " ")}
            </span>
          )}
          <span className="ml-auto text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-base font-extrabold leading-snug tracking-tight text-slate-900 line-clamp-2 transition group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500 line-clamp-2 dark:text-slate-400">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Bottom row — author + views + read more */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">

            {/* ✅ Author avatar — 3 cases */}
            {post.isOfficialPost ? (
              // Official Nursing Nepal post — show logo/site icon
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                N
              </div>
            ) : !post.isAnonymous && post.authorId?.avatarUrl ? (
              // Normal writer with avatar
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.authorId.avatarUrl}
                alt={authorName}
                className="h-6 w-6 rounded-full object-cover shrink-0"
              />
            ) : (
              // Anonymous or no avatar
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white">
                {authorInitial}
              </div>
            )}

            <span className="text-xs font-semibold text-slate-500 truncate dark:text-slate-400">
              {authorName}
            </span>

            {/* Badge — only for real non-anonymous writers */}
            {!post.isOfficialPost && !post.isAnonymous && post.authorId?.badge && (
              <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                {post.authorId.badge.replace(/_/g, " ")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {post.views > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                {post.views}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs font-bold text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
              Read
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}