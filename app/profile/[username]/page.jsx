import { notFound } from "next/navigation";
import Container from "@/components/Container";
import FollowWriterButton from "@/components/FollowWriterButton";
import { dbConnect } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import { Follow } from "@/models/Follow";
import PublicProfileView from "@/components/profile/PublicProfileView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function generateMetadata({ params }) {
  const { username } = await params;
  return {
    title: `${username} - Profile`,
    description: `View ${username}'s profile on Nursing Nepal.`,
  };
}

export default async function PublicProfilePage({ params }) {
  const { username } = await params;

  await dbConnect();

  const writer = await User.findOne({ username }).lean();

  if (!writer) {
    notFound();
  }

  const authUser = await getAuthUser();
  const isLoggedIn = Boolean(authUser?.id);
  const isOwner = isLoggedIn && String(authUser.id) === String(writer._id);

  let posts = [];
  let followerCount = 0;
  let existingFollow = null;

  if (writer.role === "blog_writer" && writer.writerVerification?.status === "approved") {
    const [fetchedPosts, followers, followDoc] = await Promise.all([
      Post.find({ authorId: writer._id, status: "approved" }).sort({ publishedAt: -1 }).lean(),
      Follow.countDocuments({ writerId: writer._id }),
      isLoggedIn ? Follow.findOne({ followerId: authUser.id, writerId: writer._id }).lean() : null,
    ]);
    posts = fetchedPosts.map(serializePost);
    followerCount = followers;
    existingFollow = followDoc;
  }

  // Build a safe payload — only send private fields to the client when logged in.
  const writerPayload = {
    _id: String(writer._id),
    name: writer.name || "",
    username: writer.username || null,
    badge: writer.badge || "",
    role: writer.role || "visitor",
    // Locked fields for logged-out visitors:
    bio: isLoggedIn ? (writer.bio || "") : null,
    avatarUrl: isLoggedIn ? (writer.avatarUrl || "") : null,
    twitter: isLoggedIn ? (writer.twitter || "") : null,
    website: isLoggedIn ? (writer.website || "") : null,
  };

  return (
    <Container>
      <div className="py-6">
        <PublicProfileView
          writer={writerPayload}
          posts={posts}
          followerCount={isLoggedIn ? followerCount : null}
          isLoggedIn={isLoggedIn}
          isOwner={isOwner}
          followButton={
            isLoggedIn && writer.role === "blog_writer" && writer.writerVerification?.status === "approved" ? (
              <FollowWriterButton
                writerId={String(writer._id)}
                initialFollowing={Boolean(existingFollow)}
                initialFollowerCount={followerCount}
              />
            ) : null
          }
        />
      </div>
    </Container>
  );
}