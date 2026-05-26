import Link from "next/link";
import Container from "@/components/Container";
import FollowWriterButton from "@/components/FollowWriterButton";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import { Follow } from "@/models/Follow";

function serializePost(post) {
  return {
    _id: String(post._id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    publishedAt:
      post.publishedAt instanceof Date
        ? post.publishedAt.toISOString()
        : post.publishedAt,
  };
}

export default async function WriterProfilePage({ params }) {
  const { id } = await params;

  await dbConnect();

  const writer = await User.findOne({
    _id: id,
    role: "blog_writer",
    "writerVerification.status": "approved",
  }).lean();

  if (!writer) {
    return (
      <Container>
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Writer not found
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            This writer may not be approved yet.
          </p>
        </div>
      </Container>
    );
  }

  const [posts, followerCount] = await Promise.all([
    Post.find({ authorId: writer._id }).sort({ publishedAt: -1 }).lean(),
    Follow.countDocuments({ writerId: writer._id }),
  ]);

  const initials = String(writer.name || "W")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Container>
      <div className="grid gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-extrabold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {writer.name}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
                  Approved blog writer
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500 dark:text-blue-100/50">
                  {followerCount} follower{followerCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <FollowWriterButton writerId={String(writer._id)} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Writer Posts
          </h2>

          {posts.length === 0 ? (
            <div className="mt-5 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
              No posts from this writer yet.
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {posts.map((rawPost) => {
                const post = serializePost(rawPost);
                return (
                  <Link
                    key={post._id}
                    href={`/blogs/${post.slug}`}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-blue-300 hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/30 dark:hover:bg-blue-950/45"
                  >
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {post.title}
                    </div>
                    {post.excerpt ? (
                      <p className="mt-1 text-sm text-slate-600 dark:text-blue-100/70">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
