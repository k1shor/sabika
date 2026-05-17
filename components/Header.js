"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

const THEME_EVENT = "nursing-theme-change";
const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Articles" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin" },
];

function getSavedTheme() {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem("theme");
  return saved === "dark" || saved === "light" ? saved : null;
}

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getThemeSnapshot() {
  return getSavedTheme() || getSystemTheme();
}

function getServerThemeSnapshot() {
  return "light";
}

function applyTheme(mode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}

function subscribeTheme(callback) {
  if (typeof window === "undefined") return () => {};

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onThemeChange = () => callback();
  const onSystemChange = () => {
    if (!getSavedTheme()) callback();
  };

  window.addEventListener(THEME_EVENT, onThemeChange);
  window.addEventListener("storage", onThemeChange);

  if (mq?.addEventListener) mq.addEventListener("change", onSystemChange);
  else if (mq?.addListener) mq.addListener(onSystemChange);

  return () => {
    window.removeEventListener(THEME_EVENT, onThemeChange);
    window.removeEventListener("storage", onThemeChange);

    if (mq?.removeEventListener) mq.removeEventListener("change", onSystemChange);
    else if (mq?.removeListener) mq.removeListener(onSystemChange);
  };
}

function NavLinks({ onClick }) {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          onClick={onClick}
          className="hover:text-blue-600 dark:hover:text-red-300 transition"
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export default function Header() {
  const router = useRouter();

  const [meData, setMeData] = useState({ ok: false, user: null });
  const [open, setOpen] = useState(false);
  const mode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMeData(d?.ok ? d : { ok: false, user: null }))
      .catch(() => setMeData({ ok: false, user: null }));
  }, [pathname]);

  const toggleTheme = () => {
    const next = mode === "dark" ? "light" : "dark";
    window.localStorage.setItem("theme", next);
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setMeData({ ok: false, user: null });
    setOpen(false);
    router.refresh();
    router.push("/");
  };

  const isDark = mode === "dark";
  const isAdmin = meData?.user?.role === "admin";
  const canApplyAsWriter =
    meData?.user?.role === "blog_writer" &&
    meData.user?.writerVerification?.status !== "pending" &&
    meData.user?.writerVerification?.status !== "approved";
  const accountLabel =
    meData?.user?.role === "admin"
      ? "Admin"
      : meData?.user?.role === "blog_writer"
        ? `Blog writer (${meData.user?.writerVerification?.status || "pending"})`
        : "Visitor";

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
      {isAdmin && (
        <Link
          onClick={onClick}
          className="hover:text-blue-600 dark:hover:text-red-300 transition"
          href="/admin"
        >
          Admin
        </Link>
      )}
      {canApplyAsWriter && (
        <Link
          onClick={onClick}
          className="hover:text-blue-600 dark:hover:text-red-300 transition"
          href="/apply-writer"
        >
          Apply Writer
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={isDark ? "/banner-dark.png" : "/banner.png"}
            alt="Nursing Nepal"
            width={260}
            height={56}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-700 dark:text-blue-100/85">
          <NavLinks />
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition
            dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/55
            dark:hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
          >
            {isDark ? "Light" : "Dark"}
          </button>

          {meData?.ok && meData?.user ? (
            <>
              <div className="text-sm text-slate-600 dark:text-blue-100/80 hidden lg:block">
                Welcome,{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {meData.user?.name || "User"}
                </span>{" "}
                <span className="font-semibold text-blue-700 dark:text-blue-200">
                  {accountLabel}
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
            <NavLinks onClick={() => setOpen(false)} />

            <div className="pt-3 border-t border-slate-200/70 dark:border-blue-400/20 flex items-center justify-between gap-3">
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition
                dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/55
                dark:hover:shadow-[0_10px_30px_rgba(37,99,235,0.18)]"
              >
                {isDark ? "Light" : "Dark"}
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
