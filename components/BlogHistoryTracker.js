"use client";

import { useEffect } from "react";

const HISTORY_KEY = "blog_view_history";
const HISTORY_TTL_MS = 24 * 60 * 60 * 1000; // change to 10 * 1000 for testing

export default function BlogHistoryTracker({ post }) {
  useEffect(() => {
    if (!post?.slug) return;

    const now = Date.now();
    const raw = localStorage.getItem(HISTORY_KEY);
    const oldItems = raw ? JSON.parse(raw) : [];

    const validItems = oldItems.filter(
      (item) => now - item.viewedAt < HISTORY_TTL_MS
    );

    const withoutCurrent = validItems.filter((item) => item.slug !== post.slug);

    const nextItems = [
      {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || "",
        viewedAt: now,
      },
      ...withoutCurrent,
    ].slice(0, 20);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextItems));
  }, [post]);

  return null;
}