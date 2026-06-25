import Link from "next/link";
import Container from "@/components/Container";
import FollowWriterButton from "@/components/FollowWriterButton";
import { dbConnect } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import { Follow } from "@/models/Follow";
import WriterProfileClient from "./WriterProfileClient";

function serializePost(post) {
  return {
    _id: String(post._id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    publishedAt:
      post.publishedAt instanceof Date
        ? post.publishedAt.toISOString()
        : post.publishedAt,
  };
}

export default async function WriterProfilePage({ params }) {
  const { id } = await params;

  await dbConnect();

  const writer = await User.findOne({
    _id: id,
    role: "blog_writer",
    "writerVerification.status": "approved",
  }).lean();

  if (!writer) {
    return (
      <Container>
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Writer not found
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-blue-100/70">
            This writer may not be approved yet.
          </p>
        </div>
      </Container>
    );
  }

  const authUser = await getAuthUser();
  const isLoggedIn = Boolean(authUser?.id);

  const [posts, followerCount, existingFollow] = await Promise.all([
    Post.find({ authorId: writer._id }).sort({ publishedAt: -1 }).lean(),
    Follow.countDocuments({ writerId: writer._id }),
    isLoggedIn ? Follow.findOne({ followerId: authUser.id, writerId: writer._id }).lean() : null,
  ]);

  const serializedPosts = posts.map(serializePost);

  // Build a safe payload — only send private fields to the client when logged in.
  const writerPayload = {
    _id: String(writer._id),
    name: writer.name || "",
    username: writer.username || null,
    badge: writer.badge || "",
    // Locked fields for logged-out visitors:
    bio: isLoggedIn ? (writer.bio || "") : null,
    avatarUrl: isLoggedIn ? (writer.avatarUrl || "") : null,
    twitter: isLoggedIn ? (writer.twitter || "") : null,
    website: isLoggedIn ? (writer.website || "") : null,
  };

  return (
    <Container>
      <WriterProfileClient
        writer={writerPayload}
        posts={serializedPosts}
        followerCount={isLoggedIn ? followerCount : null}
        isLoggedIn={isLoggedIn}
        isOwner={isLoggedIn && String(authUser.id) === String(writer._id)}
        followButton={
          isLoggedIn ? (
            <FollowWriterButton
              writerId={String(writer._id)}
              initialFollowing={Boolean(existingFollow)}
              initialFollowerCount={followerCount}
            />
          ) : null
        }
      />
    </Container>
  );
}