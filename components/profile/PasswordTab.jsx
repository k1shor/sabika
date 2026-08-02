"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function PasswordTab({ user }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: true });

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
        setCurrent("");
        setNext("");
        setConfirm("");
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
