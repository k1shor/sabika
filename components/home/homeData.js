export const HERO_TRUST_BADGES = [
  "✓ Verified contributors",
  "✓ Anonymous publishing",
  "✓ Free to read",
];

export const HERO_INFO_ITEMS = [
  { color: "bg-blue-600", text: "Real experiences from nurses and students across Nepal" },
  { color: "bg-red-500", text: "Entrance exam and licensing exam preparation guides" },
  { color: "bg-blue-600", text: "Honest stories from hospital and clinical life" },
  { color: "bg-red-500", text: "Career pathways for working or studying abroad" },
];

export const HERO_PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 6 + Math.random() * 14,
  delay: Math.random() * 4,
  duration: 4 + Math.random() * 3,
  color: index % 2 === 0 ? "#1d4ed8" : "#dc2626",
}));

export const IDENTITY_OPTIONS = [
  {
    icon: "👤",
    title: "Public Publishing",
    color: "#1d4ed8",
    points: [
      "Your name, photo, and role are visible",
      "Posts appear on your public profile",
      "Great for educational content and mentoring",
      "Builds your credibility in the community",
    ],
  },
  {
    icon: "🎭",
    title: "Anonymous Publishing",
    color: "#dc2626",
    points: [
      "Your identity stays completely hidden",
      "Only general role shown (e.g., 'Registered Nurse')",
      "Post is not linked to your profile",
      "Safe space for honest workplace realities",
    ],
  },
];

export const FAQS = [
  {
    q: "Who can publish on Nursing Nepal?",
    a: "Nursing students, registered nurses, and healthcare professionals. All contributors are verified by the admin to maintain trust and credibility on the platform.",
  },
  {
    q: "Can I publish anonymously?",
    a: "Yes. Verified users can choose to publish anonymously. Your identity stays hidden — only your general role (e.g., 'Registered Nurse') is shown. Anonymous posts are not linked to your profile.",
  },
  {
    q: "What kind of content can I share?",
    a: "Clinical experiences, entrance exam tips, hospital diaries, workplace realities, abroad career guides, personal nursing journeys, and more. Content is tagged by category and flair for easy discovery.",
  },
  {
    q: "Is Nursing Nepal free to use?",
    a: "Yes, reading all articles and resources is completely free. Anyone can browse and search content without an account.",
  },
  {
    q: "How do I become a verified contributor?",
    a: "Use the Contact page to get in touch with our team. We verify contributors based on their nursing background before granting publishing access.",
  },
];

export const FINAL_CTA_BADGES = [
  "Verified Contributors",
  "Anonymous Publishing",
  "Free to Read",
  "Nepal-Focused",
];
