/* eslint-disable @next/next/no-img-element */
import Container from "@/components/Container";
import Link from "next/link";
import { DUMMY_POSTS } from "@/lib/dummy";
import { isDbEnabled } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Button from "@/components/Button";
import BlogHistoryTracker from "@/components/blogs/BlogHistoryTracker";
import SavePostButton from "@/components/SavePostButton";
import DeletePostButton from "@/components/DeletePostButton";
import BlogDetailAnimated from "@/components/blogs/BlogDetailAnimated";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(props) {
  const params = await props.params;
  const slug   = params?.slug;
  const s      = decodeURIComponent(String(slug || "")).trim();
  const titleGuess = s ? s.replace(/-/g, " ") : "Nursing Article";

  return {
    title:       titleGuess,
    description: "Read nursing articles and care guidance on Nursing Nepal.",
    alternates:  { canonical: `/blogs/${encodeURIComponent(s)}` },
    openGraph: {
      title:       titleGuess,
      description: "Read nursing articles and care guidance on Nursing Nepal.",
      type:        "article",
    },
    twitter: {
      card:        "summary_large_image",
      title:       titleGuess,
      description: "Read nursing articles and care guidance on Nursing Nepal.",
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const { Post }      = await import("@/models/Post");
  await dbConnect();

  const post = await Post.findOne({ slug: s, status: "approved" })
    .populate("authorId", "name avatarUrl badge username")
    .lean();

  if (!post) return null;

  return {
    ...post,
    _id:         post._id ? String(post._id) : undefined,
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
    createdAt:   post.createdAt   instanceof Date ? post.createdAt.toISOString()   : post.createdAt,
    updatedAt:   post.updatedAt   instanceof Date ? post.updatedAt.toISOString()   : post.updatedAt,
    authorId: post.authorId ? {
      _id:       String(post.authorId._id),
      name:      post.authorId.name      || "",
      avatarUrl: post.authorId.avatarUrl || "",
      badge:     post.authorId.badge     || "",
      username:  post.authorId.username  || null,
    } : null,
  };
}

async function getPost(slug) {
  if (!slug) return null;
  if (!isDbEnabled()) return findDummy(slug) || null;
  try {
    const dbPost = await findDbPost(slug);
    if (dbPost) return dbPost;
  } catch {}
  return findDummy(slug) || null;
}

export default async function BlogDetailsPage(props) {
  const params = await props.params;

  const [post, currentUser] = await Promise.all([
    getPost(params?.slug),
    getAuthUser(),
  ]);

  if (!post) {
    return (
      <Container>
        <BlogHistoryTracker post={null} />
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Article not found
          </h1>
          <p className="mt-2 text-slate-600 dark:text-blue-100/75">
            This article may have been removed or the link is incorrect.
          </p>
          <div className="mt-6">
            <Link href="/blogs"><Button>Back to Articles</Button></Link>
          </div>
        </div>
      </Container>
    );
  }

  // ✅ ownership check — server side
  const isOwner = currentUser &&
    post.authorId?._id &&
    String(post.authorId._id) === String(currentUser.id);
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isOwner || isAdmin;

  const tags      = Array.isArray(post.tags) ? post.tags : [];
  const published = post.publishedAt || post.createdAt;
  const updated   = post.updatedAt && post.updatedAt !== post.createdAt ? post.updatedAt : null;
  const isAnonymous    = post.isAnonymous;
  const isOfficialPost = post.isOfficialPost;

  const authorName = isOfficialPost
    ? "Nursing Nepal"
    : isAnonymous
      ? "Anonymous Nurse"
      : post.authorId?.name || "Unknown";

  const authorInitial = isOfficialPost ? "N" : isAnonymous ? "?" : (authorName[0]?.toUpperCase() || "N");

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 md:p-10">
        <BlogHistoryTracker post={post} />

        <BlogDetailAnimated>
          {/* Top action bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/blogs">
              <Button>← Back to Articles</Button>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <SavePostButton postId={post._id} slug={post.slug} />

              {canEdit && (
                <>
                  <Link
                    href={`/writers/posts/${post.slug}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100 dark:border-blue-400/30 dark:bg-blue-950/20 dark:text-blue-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </Link>
                  <DeletePostButton slug={post.slug} />
                </>
              )}
            </div>
          </div>

        

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mt-7 overflow-hidden rounded-3xl border border-slate-200 dark:border-blue-400/20">
              <img src={post.coverImage} alt={post.title} className="h-60 w-full object-cover md:h-80" />
            </div>
          )}

          <div className="mt-7">
            {/* Category + tags */}
            {(post.category || (post.postType && post.postType !== "normal") || post.flair || tags.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                {post.category && (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-300">
                    {post.category.replace(/_/g, " ")}
                  </span>
                )}
                {post.postType && post.postType !== "normal" && (
                  <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:border-purple-400/20 dark:bg-purple-950/30 dark:text-purple-300">
                    {post.postType.replace(/_/g, " ")}
                  </span>
                )}
                {post.flair && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                    {post.flair.replace(/_/g, " ")}
                  </span>
                )}
                {tags.map((t) => (
                  <span key={t} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl">
              {post.title}
            </h1>

            {/* Author + meta */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex items-center gap-2">
                {!isAnonymous && !isOfficialPost && post.authorId?.avatarUrl ? (
                  <img
                    src={post.authorId.avatarUrl}
                    alt={authorName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${
                    isOfficialPost ? "bg-blue-600" : "bg-linear-to-br from-blue-500 to-indigo-600"
                  }`}>
                    {authorInitial}
                  </div>
                )}

                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                    {authorName}
                  </span>
                  {!isAnonymous && !isOfficialPost && post.authorId?.badge && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {post.authorId.badge.replace(/_/g, " ")}
                    </span>
                  )}
                  {!isAnonymous && !isOfficialPost && post.authorId?._id && (
                    <Link
                      href={`/writers/${post.authorId._id}`}
                      className="text-xs font-bold text-blue-700 hover:underline dark:text-blue-300"
                    >
                      View profile
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-blue-100/60">
                {published && <span>{formatDate(published)}</span>}
                {post.readTime && <span>{post.readTime}</span>}
                {updated && <span>Updated {formatDate(updated)}</span>}
                {post.views > 0 && (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    {post.views}
                  </span>
                )}
              </div>
            </div>

            {post.excerpt && (
              <p className="mt-6 text-lg leading-relaxed text-slate-700 dark:text-blue-100/80">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Article body */}
          <div className="mt-8 border-t border-slate-200 pt-8 dark:border-blue-400/20">
            {post.contentHtml ? (
              <article
                className="blog-rich-content max-w-none"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            ) : (
              <article className="blog-rich-content max-w-none">
                {post.content || ""}
              </article>
            )}
          </div>
        </BlogDetailAnimated>
      </div>
    </Container>
  );
}
