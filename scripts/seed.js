import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { SAMPLE_POSTS, slugify, makeHtml, estimateReadTime } from "../lib/samplePostsData.js";
// ─── Helpers ──────────────────────────────────────────────────────────────────

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}





// ─── Connect ──────────────────────────────────────────────────────────────────

async function connect() {
  const uri = mustGetEnv("MONGODB_URI");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

// ─── Seed Admin ───────────────────────────────────────────────────────────────

async function seedAdmin() {
  const email    = String(process.env.SEED_ADMIN_EMAIL    || "admin@nursingnepal.com").toLowerCase().trim();
  const password = String(process.env.SEED_ADMIN_PASSWORD || "Admin@12345");
  const name     = String(process.env.SEED_ADMIN_NAME     || "Nursing Nepal Admin").trim();

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      passwordHash,
      role:       "admin",
      isAdmin:    true,
      isVerified: true,           // skip email verification for admin
      provider:   "credentials",
      writerVerification: { status: "none" },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log("Admin seeded:", email);
  return { admin, email, password };
}

// ─── Seed Sample Posts ────────────────────────────────────────────────────────

async function seedPosts(adminId) {
  let seeded = 0;

  for (const p of SAMPLE_POSTS) {
    const slug        = slugify(p.slug || p.title);
    const contentHtml = makeHtml({ intro: p.intro, bullets: p.bullets, warning: p.warning });
    const readTime    = estimateReadTime(contentHtml);
    const isAnonymous = p.isAnonymous || false;

    await Post.findOneAndUpdate(
      { slug },
      {
        title: p.title,
        slug,
        excerpt: p.excerpt || "",
        contentHtml,
        coverImage: "",
        images: [],
        authorId: adminId,
        isAnonymous,
        isOfficialPost: !isAnonymous,
        category: p.category,
        postType: p.postType || "normal",
        flair: p.flair || "",
        tags: Array.isArray(p.tags) ? p.tags : [],
        status: "approved",
        isFlagged: false,
        views: 0,
        likesCount: 0,
        readTime,
        publishedAt: new Date(),
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    seeded++;
  }

  console.log(`✅ ${seeded} sample posts seeded`);
  return seeded;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  await connect();

  const { admin, email, password } = await seedAdmin();
  await seedPosts(admin._id);

  console.log("\n─────────────────────────────────");
  console.log("Seed complete!");
  console.log("─────────────────────────────────");
  console.log("Admin email:   ", email);
  console.log("Admin password:", password);
  console.log("─────────────────────────────────");
  console.log("Login at /login and change your password after first login!");
  console.log("─────────────────────────────────\n");

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Seed failed:", err.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});