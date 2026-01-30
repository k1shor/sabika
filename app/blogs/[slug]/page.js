import Container from "@/components/Container";
import Link from "next/link";
import { DUMMY_POSTS } from "@/lib/dummy";
import { useDb } from "@/lib/db";
import Button from "@/components/Button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeSlug(v) {
    return decodeURIComponent(String(v || "")).trim().replace(/\/+$/, "").toLowerCase();
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
        publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
    };
}

async function getPost(slug) {
    if (!slug) return null;

    if (!useDb()) {
        return findDummy(slug) || null;
    }

    try {
        const dbPost = await findDbPost(slug);
        if (dbPost) return dbPost;
    } catch (_e) { }

    return findDummy(slug) || null;
}

export default async function BlogDetailsPage({ params }) {
    const { slug } = await params;

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
                        className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition"
                    >
                        Back to Articles
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
                <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition dark:text-blue-100/75 dark:hover:text-red-300"
                >
                    <Button>
                        ← Back to Articles

                    </Button>
                </Link>

                <div className="mt-5">
                    <div className="flex flex-wrap items-center gap-2">
                        {(post.tags || []).map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-bold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80"
                            >
                                {t}
                            </span>
                        ))}
                    </div>

                    <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {post.title}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
                        {post.author ? <span>By {post.author}</span> : null}
                        {post.publishedAt || post.createdAt ? <span>•</span> : null}
                        {post.publishedAt || post.createdAt ? (
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        ) : null}
                        {post.readTime ? (
                            <>
                                <span>•</span>
                                <span>{post.readTime}</span>
                            </>
                        ) : null}
                    </div>

                    {post.excerpt ? (
                        <p className="mt-5 text-lg text-slate-700 dark:text-blue-100/80">
                            {post.excerpt}
                        </p>
                    ) : null}
                </div>

                <div className="mt-7 border-t border-slate-200 pt-6 dark:border-blue-400/20">
                    <article className="prose prose-slate max-w-none dark:prose-invert">
                        {post.content}
                    </article>
                </div>
            </div>
        </Container>
    );
}
