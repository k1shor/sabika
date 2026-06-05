import { z } from "zod";

export const RegisterSchema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email().max(200),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export const ContactSchema = z.object({
  name:    z.string().min(2).max(120),
  email:   z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(3000),
});

export const PostCreateSchema = z.object({
  title:       z.string().min(3).max(160),
  slug:        z.string().min(3).max(200),
  excerpt:     z.string().min(10).max(400).optional(),
  contentHtml: z.string().min(20),
  coverImage:  z.string().max(500).optional(),

  category: z.enum([
    "entrance_pass",
    "nursing_student",
    "working_nurse",
    "abroad_study",
    "abroad_work",
  ]),

  postType: z.enum([
    "normal",
    "reality_check",
    "hospital_diary",
    "country_pathway",
  ]).default("normal"),

  // ✅ one flair from fixed list — optional
  flair: z.enum([
    "",
    "tips",
    "tricks",
    "guidance",
    "clinical_experience",
    "career_journey",
    "workplace_reality",
    "story",
  ]).default(""),

  // ✅ free text tags — max 5, each under 40 chars
  tags: z.array(
    z.string().trim().min(1).max(40)
  ).max(5, { message: "Maximum 5 tags allowed" }).default([]),

  isAnonymous: z.boolean().default(false),
  status: z.enum(["draft", "pending"]).default("draft"),
});

export const WriterApplicationSchema = z.object({
  category: z.enum([
    "entrance_exam_passed",
    "nursing_student",
    "registered_nurse",
    "nurse_working_nepal",
    "nurse_studying_abroad",
    "nurse_working_abroad",
  ]),
  licenseNo:   z.string().max(80).optional(),
  workplace:   z.string().max(160).optional(),
  documentUrl: z.string().max(500).optional(),
});

export const ProfileUpdateSchema = z.object({
  name:      z.string().min(2).max(80).optional(),
  username:  z.string().min(3).max(40).optional(),
  bio:       z.string().max(300).optional(),
  avatarUrl: z.string().max(500).optional(),
  twitter:   z.string().max(100).optional(),
  phone:     z.string().max(20).optional(),
  website:   z.string().max(200).optional(),
});