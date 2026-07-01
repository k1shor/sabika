"use client";

import BlogCard from "@/components/BlogCard";

export default function ArticlesGrid({ posts }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {posts.map((post) => (
        <BlogCard key={post._id || post.slug} post={post} />
      ))}
    </div>
  );
}
