/* eslint-disable @next/next/no-img-element */
import Container from "@/components/Container";
import Link from "next/link";
import { DUMMY_POSTS } from "@/lib/dummy";
import { isDbEnabled } from "@/lib/db";
import Button from "@/components/Button";
import BlogHistoryTracker from "@/components/BlogHistoryTracker";
import SavePostButton from "@/components/SavePostButton";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug;
  const s = decodeURIComponent(String(slug || "")).trim();
  const titleGuess = s ? s.replace(/-/g, " ") : "Nursing Article";

  return {
    title: titleGuess,
    description: "Read nursing articles and care guidance on Nursing Nepal.",
    alternates: { canonical: `/blogs/${encodeURIComponent(s)}` },
    openGraph: {
      title: titleGuess,
      description: "Read nursing articles and care guidance on Nursing Nepal.",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: titleGuess,
      description: "Read nursing articles and care guidance on Nursing Nepal.",
    },
  };
}

function normalizeSlug(v) {
  return decodeURIComponent(String(v || ""))
    .trim()
    .replace(/\/+$/, "")
    .toLowerCase();
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function findDummy(slug) {
  const s = normalizeSlug(slug);
  return (Array.isArray(DUMMY_POSTS) ? DUMMY_POSTS : []).find(
    (p) => normalizeSlug(p?.slug) === s
  );
}

async function findDbPost(slug) {
  const s = normalizeSlug(slug);
  const { dbConnect } = await import("@/lib/db");
  const { Post } = await import("@/models/Post");
  await dbConnect();
  const post = await Post.findOne({ slug: s }).lean();
  if (!post) return null;
  return {
    ...post,
    _id: post._id ? String(post._id) : undefined,
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
    authorId: post.authorId ? String(post.authorId) : undefined,
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
  };
}

async function getPost(slug) {
  if (!slug) return null;
  if (!isDbEnabled()) return findDummy(slug) || null;
  try {
    const dbPost = await findDbPost(slug);
    if (dbPost) return dbPost;
  } catch (_e) {}
  return findDummy(slug) || null;
}

export default async function BlogDetailsPage(props) {
  const params = await props.params;
  const post = await getPost(params?.slug);

  if (!post) {
    return (

      <Container>
        <BlogHistoryTracker post={post} />
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Article not found
          </h1>
          <p className="mt-2 text-slate-600 dark:text-blue-100/75">
            This article may have been removed or the link is incorrect.
          </p>
          <div className="mt-6">
            <Link href="/blogs">
              <Button>Back to Articles</Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const published = post.publishedAt || post.createdAt;
  const updated = post.updatedAt && post.updatedAt !== post.createdAt ? post.updatedAt : null;

  // anonymous post: author field is empty or explicitly "anonymous"
  const isAnonymous =
    !post.author || post.author.trim().toLowerCase() === "anonymous";

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <BlogHistoryTracker post={post} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/blogs">
            <Button>Back to Articles</Button>
          </Link>
          <SavePostButton slug={post.slug} />
        </div>

        {post.coverImage && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-blue-400/20">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-60 w-full object-cover"
            />
          </div>
        )}

        <div className="mt-6">
          {/* Category + flair tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-300">
                  {post.category}
                </span>
              )}
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {post.title}
          </h1>

          {/* Author + meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {isAnonymous ? (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  ?
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                    Anonymous
                  </span>
                  {post.authorRole && (
                    <span className="text-xs text-slate-500 dark:text-blue-100/50">
                      {post.authorRole}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  {post.author
                    ?.trim()
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                    {post.author}
                  </span>
                  {post.authorId ? (
                    <Link
                      href={`/writers/${String(post.authorId)}`}
                      className="text-xs font-bold text-blue-700 hover:underline dark:text-blue-300"
                    >
                      View writer profile
                    </Link>
                  ) : null}
                  {post.authorRole && (
                    <span className="text-xs text-slate-500 dark:text-blue-100/50">
                      {post.authorRole}
                    </span>
                  )}
                </div>
              </div>
            )}

            <span className="text-slate-300 dark:text-blue-400/30">·</span>

            {published && (
              <span className="text-sm text-slate-500 dark:text-blue-100/60">
                {formatDate(published)}
              </span>
            )}

            {post.readTime && (
              <>
                <span className="text-slate-300 dark:text-blue-400/30">·</span>
                <span className="text-sm text-slate-500 dark:text-blue-100/60">
                  {post.readTime}
                </span>
              </>
            )}

            {updated && (
              <>
                <span className="text-slate-300 dark:text-blue-400/30">·</span>
                <span className="text-sm text-slate-500 dark:text-blue-100/60">
                  Updated {formatDate(updated)}
                </span>
              </>
            )}
          </div>

          {post.excerpt && (
            <p className="mt-5 text-lg leading-relaxed text-slate-700 dark:text-blue-100/80">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Article body */}
        <div className="mt-7 border-t border-slate-200 pt-6 dark:border-blue-400/20">
          {post.contentHtml ? (
            <article
              className="prose prose-slate max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          ) : (
            <article className="prose prose-slate max-w-none dark:prose-invert">
              {post.content || ""}
            </article>
          )}
        </div>

      </div>
    </Container>
  );
}
