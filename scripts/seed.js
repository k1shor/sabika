import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function estimateReadTime(text) {
  const t = String(text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = t ? t.split(" ").length : 0;
  const mins = Math.max(2, Math.round(words / 220) || 2);
  return `${mins} min read`;
}

function toList(csv) {
  return String(csv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function makeArticleHtml({ title, intro, bullets, warning, imageUrls }) {
  const imgs = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
  const hero = imgs[0] ? `<p><img src="${imgs[0]}" alt="${title}" /></p>` : "";

  const list =
    Array.isArray(bullets) && bullets.length
      ? `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
      : "";

  const warn = warning ? `<blockquote>${warning}</blockquote>` : "";

  const gallery =
    imgs.length > 1
      ? `
        <hr/>
        <h3>Gallery</h3>
        ${imgs
          .slice(1)
          .map((u) => `<p><img src="${u}" alt="${title}" /></p>`)
          .join("")}
      `
      : "";

  return `
    ${hero}
    <p><strong>${intro}</strong></p>
    ${list}
    ${warn}
    ${gallery}
  `.trim();
}

async function connect() {
  const uri = mustGetEnv("MONGODB_URI");
  await mongoose.connect(uri);
}

async function seedAdmin() {
  const adminEmail = String(process.env.SEED_ADMIN_EMAIL || "admin@nursingnepal.com")
    .toLowerCase()
    .trim();
  const adminPassword = String(process.env.SEED_ADMIN_PASSWORD || "Admin@12345");
  const adminName = String(process.env.SEED_ADMIN_NAME || "Nursing Nepal Admin").trim();

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    { name: adminName, email: adminEmail, passwordHash, role: "admin" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { admin, adminEmail, adminPassword };
}

async function seedPosts() {
  const authorDefault = process.env.SEED_AUTHOR || "Nursing Nepal";

  const coverHome = process.env.SEED_COVER_HOME || "";
  const galleryHome = toList(process.env.SEED_GALLERY_HOME);

  const coverVital = process.env.SEED_COVER_VITAL || "";
  const galleryVital = toList(process.env.SEED_GALLERY_VITAL);

  const coverWound = process.env.SEED_COVER_WOUND || "";
  const galleryWound = toList(process.env.SEED_GALLERY_WOUND);

  const posts = [
    {
      title: "Basic Nursing Care at Home: Simple Daily Practices",
      slug: "basic-nursing-care-at-home",
      excerpt:
        "Learn simple and safe nursing care steps families can follow at home to support patients during recovery.",
      coverImage: coverHome,
      images: [coverHome, ...galleryHome].filter(Boolean),
      author: authorDefault,
      tags: ["home-care", "basic-nursing", "patient-care"],
      publishedAt: "2026-01-01T10:00:00.000Z",
      intro: "Home nursing care supports comfort, safety, hygiene, and faster recovery.",
      bullets: [
        "Maintain clean hygiene and a safe, comfortable environment",
        "Follow medication routines exactly as prescribed",
        "Encourage hydration and balanced meals",
        "Track symptoms and monitor warning signs",
        "Support proper rest and mobility as advised",
      ],
      warning: "Never ignore severe pain, breathing difficulty, or high fever. Seek medical help immediately.",
    },
    {
      title: "Vital Signs Monitoring: What Nurses Should Know",
      slug: "vital-signs-monitoring",
      excerpt:
        "A quick guide to temperature, pulse, respiration, and blood pressure monitoring with important nursing notes.",
      coverImage: coverVital,
      images: [coverVital, ...galleryVital].filter(Boolean),
      author: authorDefault,
      tags: ["vital-signs", "nursing-notes", "clinical"],
      publishedAt: "2026-01-08T14:00:00.000Z",
      intro: "Vital signs help detect early warning changes in patient condition.",
      bullets: [
        "Temperature: check fever trends and infection risk",
        "Pulse: monitor rate, rhythm, and strength",
        "Respiration: detect respiratory distress early",
        "Blood Pressure: identify shock, dehydration, or hypertension risk",
        "Document readings clearly with time and patient state",
      ],
      warning: "If readings are abnormal with symptoms, escalate to senior nurse or doctor immediately.",
    },
    {
      title: "Wound Care Basics: Cleaning and Dressing Safely",
      slug: "wound-care-basics",
      excerpt:
        "Learn safe wound cleaning steps, dressing guidelines, and infection prevention tips for patients.",
      coverImage: coverWound,
      images: [coverWound, ...galleryWound].filter(Boolean),
      author: authorDefault,
      tags: ["wound-care", "infection-control", "safety"],
      publishedAt: "2026-01-15T09:00:00.000Z",
      intro: "Proper wound care prevents infection and supports healing.",
      bullets: [
        "Wash hands before and after dressing changes",
        "Use sterile supplies and gentle cleaning technique",
        "Keep the area dry and change dressing as scheduled",
        "Observe redness, swelling, pus, odor, fever, or increased pain",
        "Dispose waste safely and document wound condition",
      ],
      warning: "If infection is suspected, consult a healthcare provider immediately.",
    },
  ];

  for (const p of posts) {
    const slug = slugify(p.slug || p.title);

    const contentText = `${p.intro}\n\n${(p.bullets || []).join("\n")}\n\n${p.warning || ""}`.trim();
    const readTime = estimateReadTime(contentText);

    const contentHtml = makeArticleHtml({
      title: p.title,
      intro: p.intro,
      bullets: p.bullets,
      warning: p.warning,
      imageUrls: p.images,
    });

    await Post.findOneAndUpdate(
      { slug },
      {
        title: p.title,
        slug,
        excerpt: p.excerpt || "",
        contentHtml,
        tags: Array.isArray(p.tags) ? p.tags : [],
        author: p.author || authorDefault,
        publishedAt: p.publishedAt ? new Date(p.publishedAt) : new Date(),
        readTime,
        coverImage: p.coverImage || "",
        images: Array.isArray(p.images) ? p.images : [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const count = await Post.countDocuments();
  return { count };
}

async function run() {
  await connect();

  const { adminEmail, adminPassword } = await seedAdmin();
  const { count } = await seedPosts();

  console.log("✅ Seed complete");
  console.log("Admin email:", adminEmail);
  console.log("Admin password:", adminPassword);
  console.log("Total posts:", count);

  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
