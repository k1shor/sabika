import { NextResponse } from "next/server";
import { dbConnect, isDbEnabled } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { User } from "@/models/User";
import { ProfileUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req) {
  try {
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

    // The schema auto-lowercases username on save, so the duplicate
    // check needs to compare lowercase-to-lowercase too -- otherwise a
    // differently-cased duplicate slips past this check and then hits
    // the unique index as an unhandled crash when .save() lowercases it.
    const normalizedUsername = parsed.data.username
      ? parsed.data.username.trim().toLowerCase()
      : undefined;

    if (normalizedUsername && normalizedUsername !== (user.username || "")) {
      const taken = await User.findOne({
        username: normalizedUsername,
        _id: { $ne: user._id },
      }).lean();
      if (taken) {
        return NextResponse.json(
          { ok: false, error: "Username already taken.", fields: { username: "This username is already taken." } },
          { status: 409 }
        );
      }
    }

    const allowed = ["name", "username", "bio", "avatarUrl", "twitter", "phone", "website"];
    for (const field of allowed) {
      if (parsed.data[field] !== undefined) {
        user[field] = field === "username" ? normalizedUsername : parsed.data[field];
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
  } catch (err) {
    console.error("PATCH /api/profile:", err);
    if (err?.code === 11000) {
      return NextResponse.json(
        { ok: false, error: "Username already taken.", fields: { username: "This username is already taken." } },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}