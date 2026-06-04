import Container from "@/components/Container";
import BlogsToolbar from "@/components/BlogsToolbar";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import AnimatedBlogsHeader from "./AnimatedBlogsHeader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializePost(post) {
  return {
    ...post,
    _id: post._id ? String(post._id) : undefined,
    createdAt:   post.createdAt   instanceof Date ? post.createdAt.toISOString()   : post.createdAt,
    updatedAt:   post.updatedAt   instanceof Date ? post.updatedAt.toISOString()   : post.updatedAt,
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
  };
}

async function getPosts() {
  if (!isDbEnabled()) return DUMMY_POSTS || [];
  try {
    await dbConnect();
    const posts = await Post.find(
      {},
      { title: 1, slug: 1, excerpt: 1, coverImage: 1, tags: 1, author: 1, readTime: 1, publishedAt: 1, createdAt: 1 }
    )
      .sort({ publishedAt: -1 })
      .lean();
    return (posts || []).map(serializePost);
  } catch {
    return DUMMY_POSTS || [];
  }
}

export default async function BlogsPage() {
  const posts = await getPosts();

  const tags = Array.from(
    new Set(posts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <Container>
      <AnimatedBlogsHeader postsCount={posts.length} />
      <div className="mt-6">
        <BlogsToolbar posts={posts} tags={tags} />
      </div>
    </Container>
  );
}