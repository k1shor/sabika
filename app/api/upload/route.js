import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import cloudinary from "@/lib/cloudinary";
import { requireApprovedWriter } from "@/lib/auth";
import { requireUser } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];

function ensureCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary env vars missing");
  }
}

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

async function saveLocalImage(buffer, filename) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "blogs");
  await mkdir(uploadDir, { recursive: true });

  const safeName = `${Date.now()}-${filename}`;
  const filePath = path.join(uploadDir, safeName);
  await writeFile(filePath, buffer);

  return `/uploads/blogs/${safeName}`;
}

async function uploadBuffer(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "nursing-nepal/blogs",
        resource_type: "image",
        allowed_formats: ALLOWED_FORMATS,
        filename_override: filename || undefined,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function POST(req) {
  const auth = await requireUser();
if (!auth.ok) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

if (auth.user.role !== "admin" && 
    (auth.user.role !== "blog_writer" || auth.user.writerVerification?.status !== "approved")) {
  return NextResponse.json({ ok: false, error: "Writer approval required" }, { status: 403 });
}
  // if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error || "Forbidden" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ ok: false, error: "File missing" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ ok: false, error: "Only JPG, PNG, WebP, or GIF images are allowed" }, { status: 400 });
  }

  if (!file.size || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ ok: false, error: "Image must be between 1 byte and 5 MB" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filename = String(file.name || "image").replace(/[^\w.\-]+/g, "-").slice(0, 120);

  try {
    if (!hasCloudinaryConfig()) {
      const url = await saveLocalImage(buffer, filename);
      return NextResponse.json({
        ok: true,
        url,
        storage: "local",
      });
    }

    ensureCloudinary();
    const result = await uploadBuffer(buffer, filename);
    return NextResponse.json({
      ok: true,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      publicId: result.public_id,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message || "Upload failed" }, { status: 500 });
  }
}
