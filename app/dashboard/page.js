"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import DashboardArticlesSection from "@/components/dashboard/DashboardArticlesSection";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { DashboardLoading, DashboardLoginPrompt } from "@/components/dashboard/DashboardStates";
import QuickStats from "@/components/dashboard/QuickStats";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import { getRecentlyViewed, stagger } from "@/components/dashboard/dashboardUtils";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  if (loading) return <DashboardLoading />;
  if (!user) return <DashboardLoginPrompt />;

  return (
    <Container>
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-6">
        <WelcomeBanner user={user} />
        <QuickStats role={user.role} posts={myPosts} />

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <DashboardArticlesSection posts={posts} myPosts={myPosts} user={user} loading={postsLoading} />
          <DashboardSidebar user={user} savedCount={savedCount} recentlyViewed={recentlyViewed} />
        </div>
      </motion.div>
    </Container>
  );
}
