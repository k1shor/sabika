"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import DashboardArticlesSection from "@/components/dashboard/DashboardArticlesSection";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { DashboardLoading } from "@/components/dashboard/DashboardStates";
import QuickStats from "@/components/dashboard/QuickStats";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import { getRecentlyViewed } from "@/components/dashboard/dashboardUtils";
import FollowingPanel from "@/components/following/FollowingPanel";
import MyArticlesTab from "@/components/profile/MyArticlesTab";
import PasswordTab from "@/components/profile/PasswordTab";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTab from "@/components/profile/ProfileTab";
import SavedPostsPanel from "@/components/saved/SavedPostsPanel";

const SECTION_ITEMS = [
  { label: "Profile", value: "profile", href: "/dashboard/profile" },
  { label: "Bookmarks", value: "bookmarks", href: "/dashboard/bookmarks" },
  { label: "Following", value: "following", href: "/dashboard/following" },
  { label: "My Articles", value: "articles", href: "/dashboard/articles", writerOnly: true },
  { label: "Password", value: "password", href: "/dashboard/password" },
  { label: "Dashboard", value: "overview", href: "/dashboard/overview" },
];

export default function DashboardWorkspace({ section = "profile" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!data?.ok || !data?.user) return;
        setUser(data.user);

        fetch("/api/blogs?mine=true&limit=20")
          .then((response) => response.json())
          .then((postsData) => {
            if (postsData?.ok) setMyPosts(postsData.posts || []);
          })
          .catch(() => null);
      })
      .catch(() => null)
      .finally(() => setLoading(false));

    fetch("/api/blogs?limit=20&status=approved")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok) setPosts(data.posts || []);
      })
      .catch(() => null)
      .finally(() => setPostsLoading(false));

    fetch("/api/auth/me/saved-posts")
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok) setSavedCount(data.posts?.length || 0);
      })
      .catch(() => null);

    setRecentlyViewed(getRecentlyViewed());
  }, []);

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  const items = SECTION_ITEMS.filter((item) => {
    if (item.writerOnly && user.role !== "blog_writer") return false;
    if (item.value === "overview" && user.role === "admin") return false;
    return true;
  });
  const activeSection = items.some((item) => item.value === section) ? section : "profile";
  const activeLabel = items.find((item) => item.value === activeSection)?.label || "Profile";

  return (
    <Container className="py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#0B3C6B] dark:text-[#5B9BD5]">
            Dashboard Workspace
          </p>
          <h1 className="mt-1 font-serif text-2xl md:text-3xl font-medium tracking-tight text-[#1C1B29] dark:text-[#F2F0E9]">
            {activeLabel}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setSidebarVisible((state) => !state)}
          className="inline-flex items-center justify-center rounded-xl bg-[#0B3C6B] px-4 py-2 text-xs font-medium text-white transition-transform duration-200 hover:scale-[1.02] dark:bg-[#5B9BD5] dark:text-[#14151A]"
        >
          {sidebarVisible ? "Hide Navigation" : "Show Navigation"}
        </button>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {sidebarVisible && (
          <ProfileSidebar
            user={user}
            activeTab={activeSection}
            items={items}
            title="Dashboard"
          />
        )}

        <div className="min-w-0 flex-1">
          {activeSection === "profile" && (
            <div className="rounded-2xl border border-[#EBE5DB] bg-white p-6 dark:border-[#2C2E38] dark:bg-[#1E2028]">
              <ProfileTab user={user} onUserUpdate={setUser} />
            </div>
          )}
          {activeSection === "bookmarks" && <SavedPostsPanel />}
          {activeSection === "following" && <FollowingPanel />}
          {activeSection === "articles" && (
            <div className="rounded-2xl border border-[#EBE5DB] bg-white p-6 dark:border-[#2C2E38] dark:bg-[#1E2028]">
              <MyArticlesTab />
            </div>
          )}
          {activeSection === "password" && (
            <div className="rounded-2xl border border-[#EBE5DB] bg-white p-6 dark:border-[#2C2E38] dark:bg-[#1E2028]">
              <PasswordTab user={user} />
            </div>
          )}
          {activeSection === "overview" && (
            <div className="grid gap-6">
              <WelcomeBanner user={user} />
              <QuickStats role={user.role} posts={myPosts} />

              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <DashboardArticlesSection posts={posts} myPosts={myPosts} user={user} loading={postsLoading} />
                <DashboardSidebar user={user} savedCount={savedCount} recentlyViewed={recentlyViewed} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
