import Container from "@/components/Container";
import BlogsToolbar from "@/components/BlogsToolbar";

async function getPosts() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/blogs`, { cache: "no-store" });
  return res.json();
}

export default async function BlogsPage() {
  const data = await getPosts();
  const posts = data?.posts || [];

  const tags = Array.from(
    new Set(posts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Knowledge Hub
            </div>

            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Nursing Articles
            </h1>

            <p className="mt-2 text-base text-slate-600 dark:text-blue-100/75">
              Nursing tips, care plans, health guidance, and learning resources designed for Nepal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-red-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm">
              {posts.length} Articles
            </div>
          </div>
        </div>

        <div className="mt-6">
          <BlogsToolbar posts={posts} tags={tags} />
        </div>
      </div>
    </Container>
  );
}
