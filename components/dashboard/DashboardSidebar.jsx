"use client";

import Link from "next/link";
import { getDailyQuote } from "./dashboardUtils";
import HeartbeatDivider from "./HeartbeatDivider";

function initials(name) {
  return name?.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function DashboardSidebar({ user, savedCount, recentlyViewed }) {
  const links = [
    { href: "/following", label: "Writers I Follow" },
    { href: "/notifications", label: "Notifications" },
    { href: "/saved", label: "Saved Posts" },
    ...(user?.role !== "admin" && (user?.writerVerification?.status === "none" || !user?.writerVerification)
      ? [{ href: "/apply-writer", label: "Become a Writer" }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-xl border border-[#EBE5DB] bg-white p-5 border-l-4 border-l-[#0B3C6B] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:border-l-[#5B9BD5]">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-[#0B3C6B]/20 dark:ring-[#5B9BD5]/30"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B3C6B] text-xs font-medium text-white dark:bg-[#5B9BD5] dark:text-[#14151A]">
              {initials(user?.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-[#1C1B29] dark:text-[#F2F0E9]">
              {user?.name}
            </p>
            <p className="truncate text-xs text-[#6B6A5C] dark:text-[#A8A69A]">
              {user?.email}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/profile"
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-[#0B3C6B]/30 bg-transparent py-2 text-xs font-medium text-[#0B3C6B] transition-transform duration-200 hover:scale-[1.01] hover:bg-[#0B3C6B]/5 dark:border-[#5B9BD5]/40 dark:text-[#5B9BD5] dark:hover:bg-[#5B9BD5]/10"
        >
          Edit Profile
        </Link>
      </div>

      {/* Saved Posts Count Widget */}
      <Link
        href="/saved"
        className="group flex items-center justify-between rounded-xl border border-[#EBE5DB] bg-white p-5 border-l-4 border-l-[#C8102E] transition-transform duration-200 hover:scale-[1.01] dark:border-[#2C2E38] dark:bg-[#1E2028] dark:border-l-[#E85D6B]"
      >
        <div>
          <div className="font-serif text-3xl font-medium text-[#1C1B29] dark:text-[#F2F0E9]">
            {savedCount}
          </div>
          <div className="text-xs font-medium text-[#6B6A5C] dark:text-[#A8A69A]">
            Saved Articles
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C8102E]/10 text-xs font-medium text-[#C8102E] dark:bg-[#E85D6B]/15 dark:text-[#E85D6B]">
          SAVE
        </div>
      </Link>

      <HeartbeatDivider className="py-1" />

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="rounded-xl border border-[#EBE5DB] bg-white p-4 dark:border-[#2C2E38] dark:bg-[#1E2028]">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#6B6A5C] dark:text-[#A8A69A]">
            Continue Reading
          </p>
          <div className="flex flex-col gap-2.5">
            {recentlyViewed.map((item) => (
              <Link
                key={item.slug}
                href={`/blogs/${encodeURIComponent(item.slug)}`}
                className="group flex items-center gap-3"
              >
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-9 w-12 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-9 w-12 shrink-0 rounded bg-[#0B3C6B]/10 dark:bg-[#5B9BD5]/15" />
                )}
                <p className="line-clamp-2 font-serif text-xs font-medium text-[#1C1B29] transition-colors duration-200 group-hover:text-[#0B3C6B] dark:text-[#F2F0E9] dark:group-hover:text-[#5B9BD5]">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Daily Inspiration */}
      <div className="rounded-xl border border-[#E0A458]/30 bg-[#FBF8F3] p-4 border-l-4 border-l-[#E0A458] dark:border-[#F0BE7A]/30 dark:bg-[#1E2028] dark:border-l-[#F0BE7A]">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#E0A458] dark:text-[#F0BE7A]">
          Daily Inspiration
        </p>
        <p className="font-serif text-xs italic leading-relaxed text-[#1C1B29] dark:text-[#F2F0E9]">
          &quot;{getDailyQuote()}&quot;
        </p>
      </div>

      {/* Navigation */}
      <div className="rounded-xl border border-[#EBE5DB] bg-white p-3 dark:border-[#2C2E38] dark:bg-[#1E2028]">
        <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-[#6B6A5C] dark:text-[#A8A69A]">
          Quick Links
        </p>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6B6A5C] transition-colors duration-200 hover:bg-[#0B3C6B]/5 hover:text-[#0B3C6B] dark:text-[#A8A69A] dark:hover:bg-[#5B9BD5]/10 dark:hover:text-[#5B9BD5]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
