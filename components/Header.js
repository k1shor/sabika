"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";

function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return getSystemTheme();
}

function applyTheme(mode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [meData, setMeData] = useState({ ok: false, user: null });
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setMode(initial);
    applyTheme(initial);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return;
      const next = mq.matches ? "dark" : "light";
      setMode(next);
      applyTheme(next);
    };

    if (mq?.addEventListener) mq.addEventListener("change", onChange);
    else if (mq?.addListener) mq.addListener(onChange);

    return () => {
      if (mq?.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq?.removeListener) mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMeData(d?.ok ? d : { ok: false, user: null }))
      .catch(() => setMeData({ ok: false, user: null }));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setMeData({ ok: false, user: null });
    setOpen(false);
    router.refresh();
    router.push("/");
  };

  const isDark = mode === "dark";

  const Nav = ({ onClick }) => (
    <>
      <Link
        onClick={onClick}
        className="hover:text-blue-600 dark:hover:text-red-300 transition"
        href="/"
      >
        Home
      </Link>
      <Link
        onClick={onClick}
        className="hover:text-blue-600 dark:hover:text-red-300 transition"
        href="/about"
      >
        About
      </Link>
      <Link
        onClick={onClick}
        className="hover:text-blue-600 dark:hover:text-red-300 transition"
        href="/blogs"
      >
        Articles
      </Link>
      <Link
        onClick={onClick}
        className="hover:text-blue-600 dark:hover:text-red-300 transition"
        href="/faq"
      >
        FAQ
      </Link>
      <Link
        onClick={onClick}
        className="hover:text-blue-600 dark:hover:text-red-300 transition"
        href="/contact"
      >
        Contact
      </Link>
      <Link
        onClick={onClick}
        className="hover:text-blue-600 dark:hover:text-red-300 transition"
        href="/admin"
      >
        Admin
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={isDark ? "/logo-horizontal-white.png" : "/logo-horizontal.png"}
            alt="Nursing Nepal"
            width={220}
            height={48}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-700 dark:text-blue-100/85">
          <Nav />
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition
            dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/55
            dark:hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
          >
            {isDark ? "☀ Light" : "🌙 Dark"}
          </button>

          {meData?.ok && meData?.user ? (
            <>
              <div className="text-sm text-slate-600 dark:text-blue-100/80 hidden lg:block">
                Welcome,{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {meData.user?.name || "User"}
                </span>
              </div>

              <Button className="from-blue-600 to-red-500" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition dark:text-blue-100/90 dark:hover:text-red-300"
              >
                Login
              </Link>

              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/55
          dark:hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
          onClick={() => setOpen((s) => !s)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/80 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/80">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3 text-sm font-semibold text-slate-700 dark:text-blue-100/85">
            <Nav onClick={() => setOpen(false)} />

            <div className="pt-3 border-t border-slate-200/70 dark:border-blue-400/20 flex items-center justify-between gap-3">
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition
                dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/55
                dark:hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
              >
                {isDark ? "☀ Light" : "🌙 Dark"}
              </button>

              {meData?.ok && meData?.user ? (
                <Button className="from-blue-600 to-red-500" onClick={logout}>
                  Logout
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="font-semibold hover:text-blue-600 transition dark:text-blue-100/90 dark:hover:text-red-300"
                  >
                    Login
                  </Link>

                  <Link href="/register">
                    <Button>Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
