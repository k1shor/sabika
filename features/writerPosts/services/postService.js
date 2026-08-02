// Client-side service layer for the writer posts feature.

export async function fetchMyPosts() {
    const res = await fetch("/api/writers/posts", { cache: "no-store" });
    return res.json().catch(() => null);
  }
  
  export async function createPost(payload) {
    const res = await fetch("/api/writers/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json().catch(() => null);
  }
  
  // Uses api/blogs/[slug] (keyed by slug) -- api/writers/posts/[id]
  // expects a real Mongo _id, not a slug.
  export async function publishDraft(slug) {
    const res = await fetch(`/api/blogs/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: true }),
    });
    return res.json().catch(() => null);
  }
  
  export async function deletePostBySlug(slug) {
    const res = await fetch(`/api/blogs/${slug}`, { method: "DELETE" });
    return res.json().catch(() => null);
  }