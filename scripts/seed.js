import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function estimateReadTime(html) {
  const text = String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  const mins  = Math.max(2, Math.round(words / 220) || 2);
  return `${mins} min read`;
}

function makeHtml({ intro, bullets, warning }) {
  const list = bullets?.length
    ? `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
    : "";
  const warn = warning ? `<blockquote>${warning}</blockquote>` : "";
  return `<p><strong>${intro}</strong></p>${list}${warn}`.trim();
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
  const samplePosts = [
    {
      title:    "Basic Nursing Care at Home: Simple Daily Practices",
      slug:     "basic-nursing-care-at-home",
      excerpt:  "Learn simple and safe nursing care steps families can follow at home to support patients during recovery.",
      category: "working_nurse",
      postType: "normal",
      flair:    "guidance",
      tags:     ["home care", "patient care", "recovery"],
      intro:    "Home nursing care supports comfort, safety, hygiene, and faster recovery.",
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
      title:    "Vital Signs Monitoring: What Nurses Should Know",
      slug:     "vital-signs-monitoring",
      excerpt:  "A quick guide to temperature, pulse, respiration, and blood pressure monitoring with important nursing notes.",
      category: "nursing_student",
      postType: "normal",
      flair:    "tips",
      tags:     ["vital signs", "clinical", "nursing notes"],
      intro:    "Vital signs help detect early warning changes in patient condition.",
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
      title:    "Wound Care Basics: Cleaning and Dressing Safely",
      slug:     "wound-care-basics",
      excerpt:  "Learn safe wound cleaning steps, dressing guidelines, and infection prevention tips for patients.",
      category: "working_nurse",
      postType: "hospital_diary",
      flair:    "clinical_experience",
      tags:     ["wound care", "infection control", "safety"],
      intro:    "Proper wound care prevents infection and supports healing.",
      bullets: [
        "Wash hands before and after dressing changes",
        "Use sterile supplies and gentle cleaning technique",
        "Keep the area dry and change dressing as scheduled",
        "Observe redness, swelling, pus, odor, fever, or increased pain",
        "Dispose waste safely and document wound condition",
      ],
      warning: "If infection is suspected, consult a healthcare provider immediately.",
    },
    {
      title:    "NCLEX Preparation: Tips from a Nurse Who Passed",
      slug:     "nclex-preparation-tips",
      excerpt:  "Practical strategies and study tips from a Nepali nurse who successfully cleared the NCLEX exam.",
      category: "abroad_work",
      postType: "country_pathway",
      flair:    "career_journey",
      tags:     ["NCLEX", "abroad", "exam prep", "USA"],
      intro:    "Clearing NCLEX requires strategy, consistency, and the right resources.",
      bullets: [
        "Start with UWorld — do at least 2000 questions",
        "Focus on understanding rationale, not memorizing answers",
        "Study 4-6 hours daily for 3 months minimum",
        "Join Nepali nurse study groups on Facebook and Telegram",
        "Apply for ATT early — the process takes time",
      ],
      warning: "Requirements vary by state. Always check your state board of nursing website for latest guidelines.",
    },
    {
      title:    "Reality of Hospital Shifts in Nepal: What No One Tells You",
      slug:     "reality-of-hospital-shifts-nepal",
      excerpt:  "An honest look at the challenges, emotional weight, and rewarding moments of nursing in Nepali hospitals.",
      category: "working_nurse",
      postType: "reality_check",
      flair:    "workplace_reality",
      isAnonymous: true,          // posted anonymously — sensitive content
      tags:     ["hospital life", "Nepal", "burnout", "reality"],
      intro:    "Nursing in Nepal is deeply rewarding but comes with real challenges that deserve honest conversation.",
      bullets: [
        "Long shifts of 12+ hours with minimal breaks are common",
        "Emotional weight of patient loss is rarely addressed",
        "Staff shortages mean nurses often cover multiple wards",
        "Despite challenges, patient gratitude makes it worthwhile",
        "Community among nurses is strong — lean on each other",
      ],
      warning: "If you are experiencing burnout, please reach out to a colleague, mentor, or mental health professional. You are not alone.",
    },
  ];

  let seeded = 0;

  for (const p of samplePosts) {
    const slug        = slugify(p.slug || p.title);
    const contentHtml = makeHtml({ intro: p.intro, bullets: p.bullets, warning: p.warning });
    const readTime    = estimateReadTime(contentHtml);
    const isAnonymous = p.isAnonymous || false;

    await Post.findOneAndUpdate(
      { slug },
      {
        title:       p.title,
        slug,
        excerpt:     p.excerpt || "",
        contentHtml,
        coverImage:  "",
        images:      [],

        // ✅ required fields matching current Post model
        authorId:    adminId,
        isAnonymous: isAnonymous,
        // Admin-authored seed posts display as "Nursing Nepal" — except
        // the anonymous one, which stays anonymous instead (the two are
        // mutually exclusive: one hides identity, the other replaces it
        // with the brand name).
        isOfficialPost: !isAnonymous,
        category:    p.category,
        postType:    p.postType  || "normal",
        flair:       p.flair     || "",
        tags:        Array.isArray(p.tags) ? p.tags : [],

        // ✅ approved so they show publicly
        status:      "approved",
        isFlagged:   false,

        // engagement
        views:       0,
        likesCount:  0,

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