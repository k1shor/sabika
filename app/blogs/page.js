import Container from "@/components/Container";
import BlogsToolbar from "@/components/blogs/BlogsToolbar";
import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuthUser } from "@/lib/auth";
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
    isOfficialPost: post.isOfficialPost || false,
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
    createdAt:   post.createdAt   instanceof Date ? post.createdAt.toISOString()   : post.createdAt,
    authorId: post.isAnonymous || post.isOfficialPost ? null : (post.authorId ? {
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
      { status: "approved" },
      {
        title: 1, slug: 1, excerpt: 1, coverImage: 1,
        category: 1, postType: 1, tags: 1, readTime: 1,
        views: 1, likesCount: 1, isAnonymous: 1, isOfficialPost: 1,
        authorId: 1, publishedAt: 1, createdAt: 1,
      }
    )
      .populate("authorId", "name avatarUrl badge")
      .sort({ publishedAt: -1 })
      .lean();
      // If database is connected but has no posts
    if (!posts || posts.length === 0) {
      return DUMMY_POSTS || [];
    }
    return  posts.map(serializePost);
  } catch {
    return DUMMY_POSTS || [];
  }
}

// Guests see official (NursingNepal) posts pinned to the top, each group
// still sorted newest-first internally. Logged-in users see the normal
// newest-first order untouched.
function orderForGuests(posts) {
  const official = posts.filter((p) => p.isOfficialPost);
  const rest = posts.filter((p) => !p.isOfficialPost);
  return [...official, ...rest];
}

export default async function BlogsPage() {
  const [posts, authUser] = await Promise.all([getPosts(), getAuthUser()]);
  const isAuthenticated = Boolean(authUser);

  const visiblePosts = isAuthenticated ? posts : posts.filter((p) => p.isOfficialPost);

  const categories = Array.from(
    new Set(visiblePosts.map((p) => p.category).filter(Boolean))
  ).sort();

  const tags = Array.from(
    new Set(visiblePosts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <Container>
      <AnimatedBlogsHeader postsCount={posts.length} />
      <div className="mt-6">
        <BlogsToolbar
          posts={visiblePosts}
          totalCount={posts.length}
          tags={tags}
          categories={categories}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </Container>
  );
}