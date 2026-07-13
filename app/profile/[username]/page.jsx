import { notFound } from "next/navigation";
import { headers } from "next/headers";

const BADGE_LABELS = {
  nursing_student: "Nursing Student",
  registered_nurse: "Registered Nurse",
  abroad_nurse: "Nurse Abroad",
  mentor: "Mentor",
};

async function getProfile(username) {
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/profile/${username}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load profile");

  const data = await res.json();
  return data.user;
}

export default async function PublicProfilePage({ params }) {
  const { username } = await params;
  const user = await getProfile(username);

  if (!user) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-blue-950/30">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-400">
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{user.name}</h1>
          <p className="text-sm text-slate-500 dark:text-blue-100/50">@{user.username}</p>
          {user.badge && (
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {BADGE_LABELS[user.badge] || user.badge}
            </span>
          )}
        </div>
      </div>

      {user.bio && (
        <p className="mt-4 text-sm text-slate-700 dark:text-blue-100/80">{user.bio}</p>
      )}

      <div className="mt-4 flex gap-4 text-sm text-slate-500 dark:text-blue-100/50">
        {user.twitter && (
          <a href={`https://twitter.com/${user.twitter.replace("@", "")}`} target="_blank" rel="noreferrer" className="hover:underline">
            Twitter
          </a>
        )}
        {user.website && (
          <a href={user.website} target="_blank" rel="noreferrer" className="hover:underline">
            Website
          </a>
        )}
      </div>

      <div className="mt-6 flex gap-6 border-t border-slate-200 pt-4 text-sm dark:border-blue-400/10">
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{user.stats.totalBlogs}</span>{" "}
          <span className="text-slate-500 dark:text-blue-100/50">Blogs</span>
        </div>
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{user.stats.totalFollowers}</span>{" "}
          <span className="text-slate-500 dark:text-blue-100/50">Followers</span>
        </div>
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{user.stats.totalFollowing}</span>{" "}
          <span className="text-slate-500 dark:text-blue-100/50">Following</span>
        </div>
      </div>
    </div>
  );
}