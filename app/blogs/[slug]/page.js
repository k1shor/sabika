/* eslint-disable @next/next/no-img-element */
import Container from "@/components/Container";
import Link from "next/link";
import { DUMMY_POSTS } from "@/lib/dummy";
import { isDbEnabled } from "@/lib/db";
import Button from "@/components/Button";

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
  return (Array.isArray(DUMMY_POSTS) ? DUMMY_POSTS : []).find((p) => normalizeSlug(p?.slug) === s);
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
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
  };
}

async function getPost(slug) {
  if (!slug) return null;

  if (!isDbEnabled()) {
    return findDummy(slug) || null;
  }

  try {
    const dbPost = await findDbPost(slug);
    if (dbPost) return dbPost;
  } catch (_e) {}

  return findDummy(slug) || null;
}

export default async function BlogDetailsPage(props) {
  const params = await props.params;
  const slug = params?.slug;

    const post = await getPost(slug);

    if (!post) {
        return (
            <Container>
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Article not found
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-blue-100/75">
                        This article may have been removed or the link is incorrect.
                    </p>
                    <Link
                        href="/blogs"
                        className="mt-6 inline-flex rounded-xl bg-linear-to-r from-blue-700 to-blue-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition"
                    >
                        Back to Articles
                    </Link>
                </div>
            </Container>
        );
    }

  if (!post) {
    return (
      <Container>
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Article not found
          </h1>
          <p className="mt-2 text-slate-600 dark:text-blue-100/75">
            This article may have been removed or the link is incorrect.
          </p>

          <Link href="/blogs" className="mt-6 inline-flex">
            <Button>Back to Articles</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const published = post.publishedAt || post.createdAt;
  const updated = post.updatedAt && post.updatedAt !== post.createdAt ? post.updatedAt : null;

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <Link href="/blogs" className="inline-flex">
          <Button>Back to Articles</Button>
        </Link>

        {post.coverImage ? (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 dark:border-blue-400/20">
            <img src={post.coverImage} alt={post.title} className="h-60 w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-6">
          {tags.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-bold text-slate-700
                  dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {post.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
            {post.author ? <span>By {post.author}</span> : null}
            {published ? <span>|</span> : null}
            {published ? <span>{formatDate(published)}</span> : null}
            {post.readTime ? (
              <>
                <span>|</span>
                <span>{post.readTime}</span>
              </>
            ) : null}
            {updated ? (
              <>
                <span>|</span>
                <span>Updated {formatDate(updated)}</span>
              </>
            ) : null}
          </div>

          {post.excerpt ? (
            <p className="mt-5 text-lg text-slate-700 dark:text-blue-100/80">{post.excerpt}</p>
          ) : null}
        </div>

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
