import {
  SAMPLE_POSTS,
  OFFICIAL_SAMPLE_POST_SLUGS,
  isOfficialSamplePost,
  makeHtml,
  estimateReadTime,
} from "@/lib/samplePostsData"; // adjust to your actual import alias/path

export { OFFICIAL_SAMPLE_POST_SLUGS, isOfficialSamplePost };

export function normalizeOfficialSamplePost(post) {
  if (!post || !isOfficialSamplePost(post)) return post;
  return {
    ...post,
    author: "Nursing Nepal",
    authorId: null,
    isAnonymous: false,
    isOfficialPost: true,
  };
}

export const DUMMY_POSTS = SAMPLE_POSTS
  .filter((p) => OFFICIAL_SAMPLE_POST_SLUGS.has(p.slug))
  .map((p) => {
    const contentHtml = makeHtml({ intro: p.intro, bullets: p.bullets, warning: p.warning });
    return normalizeOfficialSamplePost({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage || "/banner.png",
      images: [],
      contentHtml,
      tags: p.tags,
      author: "Nursing Nepal",
      authorId: null,
      isOfficialPost: true,
      isAnonymous: false,
      readTime: estimateReadTime(contentHtml),
      publishedAt: p.publishedAt,
    });
  });