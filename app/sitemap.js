import { DUMMY_POSTS } from "@/lib/dummy";
import { dbConnect, useDb } from "@/lib/db";
import { Post } from "@/models/Post";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

function toIsoDate(d) {
  try {
    return d instanceof Date ? d : new Date(d);
  } catch {
    return new Date();
  }
}

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/blogs`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  let blogEntries = [];

  if (!useDb()) {
    blogEntries = (DUMMY_POSTS || []).map((p) => ({
      url: `${siteUrl}/blogs/${encodeURIComponent(p.slug)}`,
      lastModified: toIsoDate(p.publishedAt || now),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
    return [...staticRoutes, ...blogEntries];
  }

  try {
    await dbConnect();

    const posts = await Post.find({}, { slug: 1, updatedAt: 1, publishedAt: 1, createdAt: 1 })
      .sort({ publishedAt: -1 })
      .lean();

    blogEntries = (posts || [])
      .filter((p) => p?.slug)
      .map((p) => ({
        url: `${siteUrl}/blogs/${encodeURIComponent(String(p.slug))}`,
        lastModified: toIsoDate(p.updatedAt || p.publishedAt || p.createdAt || now),
        changeFrequency: "monthly",
        priority: 0.7,
      }));
  } catch {
    blogEntries = (DUMMY_POSTS || []).map((p) => ({
      url: `${siteUrl}/blogs/${encodeURIComponent(p.slug)}`,
      lastModified: toIsoDate(p.publishedAt || now),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  }

  return [...staticRoutes, ...blogEntries];
}
