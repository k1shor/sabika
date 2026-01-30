import Link from "next/link";

export default function BlogCard({ post }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-semibold text-slate-500">
          {new Date(post.publishedAt).toLocaleDateString()}
        </div>
        <div className="flex flex-wrap gap-2">
          {(post.tags || []).slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs font-semibold rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-blue-700">
        {post.title}
      </div>
      <div className="mt-2 text-sm text-slate-600 leading-relaxed">{post.excerpt}</div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
        Read more <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </Link>
  );
}
