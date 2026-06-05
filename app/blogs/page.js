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
    _id:         post._id         ? String(post._id)                    : undefined,
    title:       post.title       || "",
    slug:        post.slug        || "",
    excerpt:     post.excerpt     || "",
    coverImage:  post.coverImage  || "",
    category:    post.category    || "",
    postType:    post.postType    || "normal",
    tags:        Array.isArray(post.tags) ? post.tags : [],
    readTime:    post.readTime    || "",
    views:       post.views       || 0,
    likesCount:  post.likesCount  || 0,
    isAnonymous: post.isAnonymous || false,
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
    createdAt:   post.createdAt   instanceof Date ? post.createdAt.toISOString()   : post.createdAt,
    // author info — safe for anonymous
    authorId: post.isAnonymous ? null : (post.authorId ? {
      _id:      String(post.authorId._id || post.authorId),
      name:     post.authorId.name     || "",
      avatarUrl: post.authorId.avatarUrl || "",
      badge:    post.authorId.badge    || "",
    } : null),
  };
}

async function getPosts() {
  if (!isDbEnabled()) return DUMMY_POSTS || [];
  try {
    await dbConnect();
    const posts = await Post.find(
      { status: "approved" }, // ✅ only approved posts
      {
        title: 1, slug: 1, excerpt: 1, coverImage: 1,
        category: 1, postType: 1, tags: 1, readTime: 1,
        views: 1, likesCount: 1, isAnonymous: 1,
        authorId: 1, publishedAt: 1, createdAt: 1,
      }
    )
      .populate("authorId", "name avatarUrl badge") // ✅ populate author
      .sort({ publishedAt: -1 })
      .lean();
    return (posts || []).map(serializePost);
  } catch {
    return DUMMY_POSTS || [];
  }
}

export default async function BlogsPage() {
  const posts = await getPosts();

  // build category list from actual posts
  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  ).sort();

  // build tags list from actual posts
  const tags = Array.from(
    new Set(posts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <Container>
      <AnimatedBlogsHeader postsCount={posts.length} />
      <div className="mt-6">
        <BlogsToolbar posts={posts} tags={tags} categories={categories} />
      </div>
    </Container>
  );
}