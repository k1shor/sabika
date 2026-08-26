"use client";

import BlogCard from "@/components/blogs/BlogCard";
import ArticlesPaywallCard from "@/components/blogs/ArticlesPaywallCard";

const FREE_GUEST_ARTICLES = 2;

export default function ArticlesGrid({ posts, isAuthenticated = false }) {
  const showPaywall = !isAuthenticated && posts.length > FREE_GUEST_ARTICLES;
  const visiblePosts = showPaywall ? posts.slice(0, FREE_GUEST_ARTICLES) : posts;

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {visiblePosts.map((post, index) => (
        <BlogCard key={post._id || post.slug} post={post} index={index} />
      ))}
      {showPaywall && <ArticlesPaywallCard />}
    </div>
  );
}