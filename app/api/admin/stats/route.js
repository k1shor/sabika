import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // ── Counts ────────────────────────────────────────────────────────────────
    const [
      totalUsers,
      totalPosts,
      pendingWriters,
      flaggedPosts,
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({ "writerVerification.status": "pending" }),
      Post.countDocuments({ isFlagged: true }),
    ]);

    // ── Posts per day (last 7 days) ───────────────────────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const postsPerDay = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── New users per week (last 5 weeks) ─────────────────────────────────────
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);

    const usersPerWeek = await User.aggregate([
      { $match: { createdAt: { $gte: fiveWeeksAgo } } },
      {
        $group: {
          _id: { $week: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── Pending writer requests ───────────────────────────────────────────────
    const writerRequests = await User.find(
      { "writerVerification.status": "pending" },
      {
        name: 1,
        email: 1,
        role: 1,
        "writerVerification.status": 1,
        "writerVerification.category": 1,
        "writerVerification.licenseNo": 1,
        "writerVerification.workplace": 1,
        "writerVerification.submittedAt": 1,
      }
    )
      .sort({ "writerVerification.submittedAt": -1 })
      .limit(10)
      .lean();

    // ── Recent activity feed ──────────────────────────────────────────────────
    // Mix of recent users + posts as activity
    const [recentUsers, recentPosts] = await Promise.all([
      User.find({}, { name: 1, createdAt: 1, "writerVerification.status": 1 })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Post.find({}, { title: 1, author: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Merge and sort activity
    const activity = [
      ...recentUsers.map((u) => ({
        name:   u.name,
        action: u.writerVerification?.status === "pending"
          ? "requested to become a writer"
          : "joined the platform",
        time:   u.createdAt,
        type:   "user",
      })),
      ...recentPosts.map((p) => ({
        name:   p.author || "Unknown",
        action: "submitted a new blog",
        time:   p.createdAt,
        type:   "post",
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    return NextResponse.json({
      ok: true,
      stats: { totalUsers, totalPosts, pendingWriters, flaggedPosts },
      postsPerDay,
      usersPerWeek,
      writerRequests: writerRequests.map((u) => ({
        _id:      String(u._id),
        name:     u.name,
        email:    u.email,
        category: u.writerVerification?.category || "—",
        status:   u.writerVerification?.status,
        workplace: u.writerVerification?.workplace || "—",
        submittedAt: u.writerVerification?.submittedAt,
      })),
      activity,
    });
  } catch (err) {
    console.error("admin/stats error:", err.message);
    return NextResponse.json({ ok: false, error: "Failed to load stats" }, { status: 500 });
  }
}
