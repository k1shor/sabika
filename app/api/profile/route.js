import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { User } from "@/models/User";
import { ProfileUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req) {
  const auth = await requireUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const fields = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field && !fields[field]) fields[field] = issue.message;
    }
    return NextResponse.json({ ok: false, error: "Invalid input", fields }, { status: 400 });
  }

  if (!isDbEnabled()) {
    return NextResponse.json({ ok: false, error: "Service unavailable." }, { status: 503 });
  }

  await dbConnect();

  const user = await User.findById(auth.user.id);
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  // username uniqueness check
  if (parsed.data.username && parsed.data.username !== user.username) {
    const taken = await User.findOne({
      username: parsed.data.username,
      _id: { $ne: user._id },
    }).lean();
    if (taken) {
      return NextResponse.json(
        { ok: false, error: "Username already taken.", fields: { username: "This username is already taken." } },
        { status: 409 }
      );
    }
  }

  // only update fields that were actually sent
  const allowed = ["name", "username", "bio", "avatarUrl", "twitter", "phone", "website"];
  for (const field of allowed) {
    if (parsed.data[field] !== undefined) {
      user[field] = parsed.data[field];
    }
  }

  await user.save();

  return NextResponse.json({
    ok: true,
    message: "Profile updated successfully.",
    user: {
      id:        String(user._id),
      name:      user.name,
      username:  user.username || null,
      bio:       user.bio || "",
      avatarUrl: user.avatarUrl || "",
      twitter:   user.twitter || "",
      phone:     user.phone || "",
      website:   user.website || "",
    },
  });
}