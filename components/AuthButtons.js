"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function AuthButtons() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setUser(d?.user || null);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setUser(null);
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const logout = async () => {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setBusy(false);
    setUser(null);
    router.refresh();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="h-10 w-40 rounded-xl border border-slate-200 bg-white/60 dark:border-blue-400/20 dark:bg-blue-950/25" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm
          hover:bg-white hover:border-slate-300 active:scale-[0.98] transition
          dark:border-blue-400/20 dark:bg-blue-950/25 dark:text-white dark:hover:bg-blue-950/35"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm
          hover:brightness-110 active:scale-[0.98] transition
          focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:block text-sm font-bold text-slate-700 dark:text-blue-100/80">
        Hi, {user?.name || "User"}
      </div>
      <Button onClick={logout} disabled={busy}>
        {busy ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
