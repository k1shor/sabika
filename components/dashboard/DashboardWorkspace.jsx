"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import DashboardArticlesSection from "@/components/dashboard/DashboardArticlesSection";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { DashboardLoading } from "@/components/dashboard/DashboardStates";
import QuickStats from "@/components/dashboard/QuickStats";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import { getRecentlyViewed, stagger } from "@/components/dashboard/dashboardUtils";
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
    <Container>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Dashboard</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{activeLabel}</h1>
        </div>
        <button
          type="button"
          onClick={() => setSidebarVisible((state) => !state)}
          className="inline-flex items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 dark:border-blue-400 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400"
        >
          {sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
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
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
              <ProfileTab user={user} onUserUpdate={setUser} />
            </div>
          )}
          {activeSection === "bookmarks" && <SavedPostsPanel />}
          {activeSection === "following" && <FollowingPanel />}
          {activeSection === "articles" && (
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
              <MyArticlesTab />
            </div>
          )}
          {activeSection === "password" && (
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
              <PasswordTab user={user} />
            </div>
          )}
          {activeSection === "overview" && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6">
              <WelcomeBanner user={user} />
              <QuickStats role={user.role} posts={myPosts} />

              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <DashboardArticlesSection posts={posts} myPosts={myPosts} user={user} loading={postsLoading} />
                <DashboardSidebar user={user} savedCount={savedCount} recentlyViewed={recentlyViewed} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Container>
  );
}
