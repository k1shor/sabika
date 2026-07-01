"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import MyArticlesTab from "@/components/profile/MyArticlesTab";
import PasswordTab from "@/components/profile/PasswordTab";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTab from "@/components/profile/ProfileTab";
import { TABS_BY_ROLE } from "@/components/profile/profileUtils";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data?.ok && data?.user) setUser(data.user);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-24 text-sm text-slate-500 dark:text-blue-100/50">
          Loading...
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <div className="flex items-center justify-center py-24 text-sm text-slate-500 dark:text-blue-100/50">
          You must be logged in to view this page.
        </div>
      </Container>
    );
  }

  const tabs = TABS_BY_ROLE[user.role] || TABS_BY_ROLE.visitor;
  const currentTab = tabs.includes(activeTab) ? activeTab : tabs[0];

  return (
    <Container>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <ProfileSidebar
          user={user}
          activeTab={currentTab}
          tabs={tabs}
          onTabChange={setActiveTab}
        />
        <div className="flex-1 min-w-0 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          {currentTab === "Profile" && <ProfileTab user={user} onUserUpdate={setUser} />}
          {currentTab === "Password" && <PasswordTab user={user} />}
          {currentTab === "My Articles" && <MyArticlesTab />}
        </div>
      </div>
    </Container>
  );
}
