import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import AdminDashboardTabs from "@/features/adminDashboard/components/AdminDashboardTabs";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await dbConnect();

  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7  * 24 * 60 * 60 * 1000);
  const fiveWeeksAgo = new Date(now - 35 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    bannedUsers,
    totalPosts,
    pendingWriters,
    flaggedPosts,
    postsPerDayRaw,
    usersPerWeekRaw,
    postStatusRaw,
    writerRequestsRaw,
    recentUsersRaw,
    recentPostsRaw,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBanned: true }),
    Post.countDocuments(),
    User.countDocuments({ "writerVerification.status": "pending" }),
    Post.countDocuments({ isFlagged: true }),
    Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: fiveWeeksAgo } } },
      { $group: { _id: { $week: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Post.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    User.find(
      { "writerVerification.status": "pending" },
      { name: 1, email: 1, writerVerification: 1 }
    ).sort({ "writerVerification.submittedAt": -1 }).limit(10).lean(),
    User.find({}, { name: 1, createdAt: 1, "writerVerification.status": 1 })
      .sort({ createdAt: -1 }).limit(5).lean(),
    Post.find({ status: "approved" }, { title: 1, authorId: 1, createdAt: 1 })
      .populate("authorId", "name")
      .sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const postsPerDay = postsPerDayRaw.map((d) => ({
    count: d.count,
    label: dayNames[new Date(d._id).getDay()],
  }));
  const usersPerWeek = usersPerWeekRaw.map((d, i) => ({
    count: d.count,
    label: `W${i + 1}`,
  }));

  const postStatusCounts = { approved: 0, pending: 0, rejected: 0, draft: 0 };
  for (const row of postStatusRaw) {
    if (row._id in postStatusCounts) postStatusCounts[row._id] = row.count;
  }

  const activity = [
    ...recentUsersRaw.map((u) => ({
      name:   u.name || "Unknown",
      action: u.writerVerification?.status === "pending"
        ? "requested to become a writer"
        : "joined the platform",
      time: u.createdAt,
    })),
    ...recentPostsRaw.map((p) => ({
      name:   p.authorId?.name || "Unknown",
      action: "published a new blog",
      time:   p.createdAt,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  const writerRequests = writerRequestsRaw.map((u) => ({
    _id:         String(u._id),
    name:        u.name  || "",
    email:       u.email || "",
    category:    u.writerVerification?.category    || "",
    workplace:   u.writerVerification?.workplace   || "—",
    licenseNo:   u.writerVerification?.licenseNo   || "—",
    documentUrl: u.writerVerification?.documentUrl || "",
    submittedAt: u.writerVerification?.submittedAt
      ? new Date(u.writerVerification.submittedAt).toISOString()
      : null,
  }));

  const stats = { totalUsers, bannedUsers, totalPosts, pendingWriters, flaggedPosts };

  return (
    <AdminDashboardTabs
      stats={stats}
      postsPerDay={postsPerDay}
      usersPerWeek={usersPerWeek}
      postStatusCounts={postStatusCounts}
      activity={activity}
      writerRequests={writerRequests}
    />
  );
}