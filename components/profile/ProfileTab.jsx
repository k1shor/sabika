"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { getRoleLabel } from "./profileUtils";
import PublicProfileView from "./PublicProfileView";
export default function ProfileTab({ user, onUserUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [twitter, setTwitter] = useState(user?.twitter || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: true });
  const [showPreview, setShowPreview] = useState(false);

  // user often arrives asynchronously (fetched by the parent after mount),
  // so the useState initial values above can run before user is populated.
  // This re-syncs the fields whenever fresh user data actually shows up.
  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setUsername(user.username || "");
    setBio(user.bio || "");
    setTwitter(user.twitter || "");
    setPhone(user.phone || "");
    setWebsite(user.website || "");
  }, [user]);

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

  const previewWriterData = {
    _id: user?._id || "preview-id",
    name: name,
    username: username,
    bio: bio,
    twitter: twitter,
    website: website,
    role: user?.role || "visitor",
    badge: user?.badge || "",
    avatarUrl: user?.avatarUrl || "",
  };

  const previewPosts = [
    {
      _id: "mock1",
      title: "My First Nursing Article",
      slug: "my-first-nursing-article",
      excerpt: "This is a preview of how your beautifully structured articles will appear on your profile.",
    },
    {
      _id: "mock2",
      title: "Clinical Experience Guidelines",
      slug: "clinical-experience-guidelines",
      excerpt: "Another example of a published blog. Visitors can click these to read your work.",
    }
  ];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            {showPreview ? "Profile Preview" : "User Profile"}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-blue-100/50">
            {showPreview
              ? "This is exactly how your profile looks to other users."
              : "Manage your personal information."}
          </p>
        </div>
      </div>

      {showPreview ? (
        <div className="-mx-4 sm:mx-0">
          <PublicProfileView
            writer={previewWriterData}
            posts={user?.role === "blog_writer" ? previewPosts : []}
            followerCount={user?.stats?.totalFollowers || 0}
            isLoggedIn={true}
            isOwner={true}
            isPreview={true}
          />
        </div>
      ) : (
        <>
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
        </>
      )}

      {message.text && !showPreview && (
        <p className={`text-sm font-semibold ${message.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {message.text}
        </p>
      )}

      <div className="flex items-center gap-3">
        {!showPreview && (
          <Button type="button" onClick={handleSave} disabled={saving} className="px-6">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowPreview((prev) => !prev)}
          className="px-6"
        >
          {showPreview ? "Edit Profile" : "View Preview"}
        </Button>
      </div>

      {!showPreview && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-400/20 dark:bg-red-950/20">
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
      )}
    </div>
  );
}
