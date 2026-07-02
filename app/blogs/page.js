import Container from "@/components/Container";
import BlogsToolbar from "@/components/blogs/BlogsToolbar";
import { DUMMY_POSTS, normalizeOfficialSamplePost } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import AnimatedBlogsHeader from "./AnimatedBlogsHeader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializePost(post) {
  const normalizedPost = normalizeOfficialSamplePost(post);

  return {
    _id:         normalizedPost._id         ? String(normalizedPost._id)                    : undefined,
    title:       normalizedPost.title       || "",
    slug:        normalizedPost.slug        || "",
    excerpt:     normalizedPost.excerpt     || "",
    coverImage:  normalizedPost.coverImage  || "",
    category:    normalizedPost.category    || "",
    postType:    normalizedPost.postType    || "normal",
    tags:        Array.isArray(normalizedPost.tags) ? normalizedPost.tags : [],
    readTime:    normalizedPost.readTime    || "",
    views:       normalizedPost.views       || 0,
    likesCount:  normalizedPost.likesCount  || 0,
    isAnonymous: normalizedPost.isAnonymous || false,
    isOfficialPost: normalizedPost.isOfficialPost || false,
    publishedAt: normalizedPost.publishedAt instanceof Date ? normalizedPost.publishedAt.toISOString() : normalizedPost.publishedAt,
    createdAt:   normalizedPost.createdAt   instanceof Date ? normalizedPost.createdAt.toISOString()   : normalizedPost.createdAt,
    // author info — safe for anonymous
    authorId: normalizedPost.isAnonymous || normalizedPost.isOfficialPost ? null : (normalizedPost.authorId ? {
      _id:      String(normalizedPost.authorId._id || normalizedPost.authorId),
      name:     normalizedPost.authorId.name     || "",
      avatarUrl: normalizedPost.authorId.avatarUrl || "",
      badge:    normalizedPost.authorId.badge    || "",
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
        views: 1, likesCount: 1, isAnonymous: 1,isOfficialPost: 1,
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
