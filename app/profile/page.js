"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import Input from "@/components/Input";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS_BY_ROLE = {
  admin: ["Profile", "Password"],
  blog_writer: ["Profile", "My Articles", "Password"],
  visitor: ["Profile", "Password"],
};

const STATUS_FILTERS = ["all", "approved", "pending", "draft"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return "U";
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getRoleLabel(role) {
  if (role === "admin") return "System Admin";
  if (role === "blog_writer") return "Blog Writer";
  return "Visitor";
}

function getRoleColor(role) {
  if (role === "admin")
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-400/20";
  if (role === "blog_writer")
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-400/20";
  return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-600/20";
}

function statusStyle(status) {
  if (status === "approved")
    return "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-400/20";
  if (status === "pending")
    return "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-400/20";
  return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-600/20";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ─── Tab Icons ────────────────────────────────────────────────────────────────

function TabIcon({ tab, active }) {
  const cls = `shrink-0 ${active ? "opacity-90" : "opacity-50"}`;
  if (tab === "Profile")
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    );
  if (tab === "My Articles")
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    );
  if (tab === "Password")
    return (
      <svg className={cls} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  return null;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ user, activeTab, tabs, onTabChange }) {
  return (
    <aside className="w-full md:w-60 shrink-0 flex flex-col gap-4">
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 flex flex-col items-center text-center gap-3">
        <div className="relative">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-900"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-blue-200 text-2xl font-extrabold text-blue-700 dark:from-blue-900/60 dark:to-blue-800/40 dark:text-blue-300 ring-4 ring-white dark:ring-slate-900">
              {getInitials(user.name)}
            </div>
          )}
          <button className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:border-blue-400/20 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        <div>
          <p className="font-extrabold tracking-tight text-slate-900 dark:text-white">
            {user.name || "User"}
          </p>
          {user.username && (
            <p className="text-xs text-slate-400 dark:text-blue-100/40">@{user.username}</p>
          )}
          <p className="mt-0.5 text-xs text-slate-500 dark:text-blue-100/50 break-all">
            {user.email}
          </p>
        </div>

        {/* Trust Badge */}
        {user.badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-300">
            {user.badge.replace(/_/g, " ")}
          </span>
        )}

        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getRoleColor(user.role)}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
          {getRoleLabel(user.role)}
        </span>

        {/* Stats */}
        {user.stats && (
          <div className="w-full grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 dark:border-blue-400/10">
            {[
              { label: "Blogs", value: user.stats.totalBlogs },
              { label: "Followers", value: user.stats.totalFollowers },
              { label: "Following", value: user.stats.totalFollowing },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">{s.value}</span>
                <span className="text-[10px] text-slate-400 dark:text-blue-100/40">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/70 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-blue-400/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-blue-100/30">
            Settings
          </p>
        </div>
        <nav className="p-2 flex flex-col gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition
                ${activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-blue-100/70 dark:hover:bg-blue-950/40"
                }`}
            >
              <TabIcon tab={tab} active={activeTab === tab} />
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function ProfileTab({ user, onUserUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [twitter, setTwitter] = useState(user?.twitter || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: true });

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", ok: true });
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio, twitter, phone, website }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: "Saved successfully!", ok: true });
        onUserUpdate?.({ ...user, name, username, bio, twitter, phone, website });
      } else {
        setMessage({ text: data.error || "Failed to save.", ok: false });
      }
    } catch {
      setMessage({ text: "Something went wrong.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = confirm("This will permanently delete your account. Continue?");
    if (!ok) return;
    try {
      const res = await fetch("/api/auth/user", { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        window.location.href = "/";
      } else {
        alert(data.error || "Failed to delete account");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">User Profile</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-blue-100/50">Manage your personal information.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Full name</label>
          <div className="mt-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Username</label>
          <div className="mt-2">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="priya-sharma" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Bio</label>
        <div className="mt-2">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Tell others about yourself..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-400/20 dark:bg-blue-950/20 dark:text-white dark:placeholder:text-blue-100/30"
          />
          <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/300</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Email</label>
          <div className="mt-2">
            <Input type="email" value={user?.email || ""} readOnly disabled />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Role</label>
          <div className="mt-2">
            <Input value={getRoleLabel(user?.role)} readOnly disabled />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Twitter</label>
          <div className="mt-2">
            <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@username" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Phone</label>
          <div className="mt-2">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977 ..." />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Website</label>
          <div className="mt-2">
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>

      {message.text && (
        <p className={`text-sm font-semibold ${message.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {message.text}
        </p>
      )}

      <div>
        <Button type="button" onClick={handleSave} disabled={saving} className="px-6">
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-400/20 dark:bg-red-950/20">
        <p className="text-sm font-extrabold text-red-700 dark:text-red-300">Danger zone</p>
        <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          className="mt-3 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Password ────────────────────────────────────────────────────────────

function PasswordTab({ user }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: true });

  // Google OAuth users have no password to change
  if (user?.provider === "google") {
    return (
      <div className="grid gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Change Password</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-blue-100/50">
          Your account uses Google sign-in. Password changes are not available.
        </p>
      </div>
    );
  }

  const handleUpdate = async () => {
    if (next !== confirm) {
      setMessage({ text: "New passwords do not match.", ok: false });
      return;
    }
    setSaving(true);
    setMessage({ text: "", ok: true });
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ text: "Password updated successfully!", ok: true });
        setCurrent(""); setNext(""); setConfirm("");
      } else {
        setMessage({ text: data.error || "Failed to update password.", ok: false });
      }
    } catch {
      setMessage({ text: "Something went wrong.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Change Password</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-blue-100/50">Update your account password.</p>
      </div>

      <div className="grid gap-4 max-w-md">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Current password</label>
          <div className="mt-2">
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">New password</label>
          <div className="mt-2">
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">Confirm new password</label>
          <div className="mt-2">
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>
        </div>

        {message.text && (
          <p className={`text-sm font-semibold ${message.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {message.text}
          </p>
        )}

        <div>
          <Button type="button" onClick={handleUpdate} disabled={saving} className="px-6">
            {saving ? "Updating..." : "Update password"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: My Articles ─────────────────────────────────────────────────────────

function MyArticlesTab() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // uses existing /api/blogs route with ?mine=true query param
    // you need to add this filter in your blogs GET handler
    fetch("/api/blogs?mine=true")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setArticles(d.posts || []); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    approved: articles.filter((a) => a.status === "approved").length,
    pending: articles.filter((a) => a.status === "pending").length,
    draft: articles.filter((a) => a.status === "draft").length,
  };

  const filtered = filter === "all"
    ? articles
    : articles.filter((a) => a.status === filter);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 dark:text-blue-100/50">
        Loading articles...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">My Articles</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-blue-100/50">All articles you have written.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Published", count: counts.approved, color: "text-green-600 dark:text-green-400" },
          { label: "Pending", count: counts.pending, color: "text-yellow-600 dark:text-yellow-400" },
          { label: "Drafts", count: counts.draft, color: "text-slate-500 dark:text-slate-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-blue-400/20 dark:bg-blue-950/20">
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.count}</div>
            <div className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-blue-100/60">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition border
              ${filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-blue-400/20 dark:text-blue-100/70"
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Article List */}
      <div className="divide-y divide-slate-100 dark:divide-blue-400/10">
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-blue-100/50">
            No articles found.
          </p>
        )}
        {filtered.map((article) => (
          <div key={article._id || article.slug} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{article.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-blue-100/50">
                {formatDate(article.publishedAt || article.createdAt)}
                {article.isAnonymous && (
                  <span className="ml-2 text-slate-400 dark:text-blue-100/30">· Anonymous</span>
                )}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(article.status)}`}>
              {article.status === "approved" ? "Published" : article.status.charAt(0).toUpperCase() + article.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d?.ok && d?.user) setUser(d.user); })
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
        <Sidebar
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