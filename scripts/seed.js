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

async function connect() {
  const uri = mustGetEnv("MONGODB_URI");
  await mongoose.connect(uri);
}

async function seedAdmin() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@nursingnepal.com").toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const adminName = process.env.SEED_ADMIN_NAME || "Nursing Nepal Admin";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    { name: adminName, email: adminEmail, passwordHash, role: "admin" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { admin, adminEmail, adminPassword };
}

async function seedPosts() {
  const posts = [
    {
      title: "Basic Nursing Care at Home: Simple Daily Practices",
      slug: "basic-nursing-care-at-home",
      excerpt:
        "Learn simple and safe nursing care steps families can follow at home to support patients during recovery.",
      content:
        "Home nursing care includes hygiene support, safe medication routines, hydration monitoring, and proper rest.\n\nAlways follow doctor instructions and never ignore danger signs like high fever, severe pain, or breathing difficulty.\n\nThis guide helps families understand basic daily care practices safely.",
      tags: ["home-care", "basic-nursing", "patient-care"],
      author: "Nursing Nepal",
      publishedAt: new Date("2026-01-01T10:00:00.000Z"),
    },
    {
      title: "Vital Signs Monitoring: What Nurses Should Know",
      slug: "vital-signs-monitoring",
      excerpt:
        "A quick guide to temperature, pulse, respiration, and blood pressure monitoring with important nursing notes.",
      content:
        "Vital signs include Temperature, Pulse, Respiration, and Blood Pressure.\n\nMonitoring helps detect early warning signs of infection, shock, dehydration, or respiratory problems.\n\nAccurate documentation is a key part of nursing practice.",
      tags: ["vital-signs", "nursing-notes", "clinical"],
      author: "Nursing Nepal",
      publishedAt: new Date("2026-01-08T14:00:00.000Z"),
    },
    {
      title: "Wound Care Basics: Cleaning and Dressing Safely",
      slug: "wound-care-basics",
      excerpt:
        "Learn safe wound cleaning steps, dressing guidelines, and infection prevention tips for patients.",
      content:
        "Wound care must be done with clean hands, sterile supplies, and gentle cleaning techniques.\n\nObserve for infection signs: redness, swelling, pus, bad smell, fever, or increased pain.\n\nIf infection is suspected, consult a healthcare provider immediately.",
      tags: ["wound-care", "infection-control", "safety"],
      author: "Nursing Nepal",
      publishedAt: new Date("2026-01-15T09:00:00.000Z"),
    },
  ];

  for (const p of posts) {
    const slug = slugify(p.slug || p.title);
    await Post.findOneAndUpdate(
      { slug },
      { ...p, slug },
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
