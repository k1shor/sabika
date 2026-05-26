"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";

const THEME_EVENT = "nursing-theme-change";
const NAV_ITEMS = [
  { href: "/",        label: "Home"     },
  { href: "/about",   label: "About"    },
  { href: "/blogs",   label: "Articles" },
  { href: "/faq",     label: "FAQ"      },
  { href: "/contact", label: "Contact"  },
];

// ─── Theme helpers ────────────────────────────────────────────────────────────

function getSavedTheme() {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem("theme");
  return saved === "dark" || saved === "light" ? saved : null;
}
function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function getThemeSnapshot()       { return getSavedTheme() || getSystemTheme(); }
function getServerThemeSnapshot() { return "light"; }
function applyTheme(mode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}
function subscribeTheme(callback) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onThemeChange  = () => callback();
  const onSystemChange = () => { if (!getSavedTheme()) callback(); };
  window.addEventListener(THEME_EVENT, onThemeChange);
  window.addEventListener("storage",   onThemeChange);
  if (mq?.addEventListener) mq.addEventListener("change", onSystemChange);
  else if (mq?.addListener) mq.addListener(onSystemChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onThemeChange);
    window.removeEventListener("storage",   onThemeChange);
    if (mq?.removeEventListener) mq.removeEventListener("change", onSystemChange);
    else if (mq?.removeListener) mq.removeListener(onSystemChange);
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return "U";
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getRoleLabel(role) {
  if (role === "admin")       return "Admin";
  if (role === "blog_writer") return "Blog Writer";
  return "Visitor";
}

// ─── Nav links ────────────────────────────────────────────────────────────────

function NavLinks({ onClick, isAdmin, canApplyAsWriter }) {
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
      {isAdmin && (
        <Link onClick={onClick} className="hover:text-blue-600 dark:hover:text-red-300 transition" href="/admin">
          Admin
        </Link>
      )}
      {canApplyAsWriter && (
        <Link onClick={onClick} className="hover:text-blue-600 dark:hover:text-red-300 transition" href="/apply-writer">
          Apply Writer
        </Link>
      )}
    </>
  );
}

// ─── Avatar dropdown ──────────────────────────────────────────────────────────

function AvatarDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const menuItems = [
    { href: "/profile",   icon: UserIcon,    label: "My Profile"       },
    { href: "/saved",     icon: BookmarkIcon, label: "My Bookmarks"    },
    { href: "/dashboard", icon: HomeIcon,     label: "Dashboard"       },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 pl-1 pr-3 py-1 transition
        hover:border-blue-300 hover:bg-white
        dark:border-blue-400/20 dark:bg-blue-950/40 dark:hover:bg-blue-950/60"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
          {getInitials(user.name)}
        </div>
        <div className="hidden lg:flex flex-col leading-tight text-left">
          <span className="text-[12px] font-semibold text-slate-800 dark:text-white max-w-25 truncate">
            {user.name || "User"}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-blue-300/70">
            {getRoleLabel(user.role)}
          </span>
        </div>
        <ChevronIcon className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 z-50
        dark:border-blue-400/20 dark:bg-slate-900 dark:shadow-none overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-blue-400/10">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-blue-300/60 truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition
                dark:text-blue-100/80 dark:hover:bg-blue-950/40"
              >
                <Icon />
                {label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 dark:border-blue-400/10 py-1.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition
              dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notification bell ────────────────────────────────────────────────────────

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const load = async () => {
    setLoading(true);

    const res = await fetch("/api/auth/me/notifications", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (data?.ok) {
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    }
  };

  const markAllRead = async () => {
    await fetch("/api/auth/me/notifications", { method: "PATCH" }).catch(() => null);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          load();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 transition hover:bg-white hover:border-slate-300 dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/60"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 dark:border-blue-400/20 dark:bg-slate-900 dark:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-blue-400/10">
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                Notifications
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-blue-100/50">
                {unreadCount} unread
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="text-xs font-extrabold text-blue-700 transition hover:text-blue-600 disabled:text-slate-300 dark:text-blue-300 dark:disabled:text-blue-100/20"
            >
              Mark read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {loading ? (
              <div className="px-3 py-6 text-center text-sm font-semibold text-slate-500 dark:text-blue-100/60">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm font-semibold text-slate-500 dark:text-blue-100/60">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <Link
                  key={item._id}
                  href={item.postSlug ? `/blogs/${item.postSlug}` : "/notifications"}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 transition hover:bg-slate-50 dark:hover:bg-blue-950/40"
                >
                  <div className="flex items-start gap-2">
                    {!item.read ? (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    ) : (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-200 dark:bg-blue-100/20" />
                    )}
                    <p className="text-sm font-semibold leading-snug text-slate-700 dark:text-blue-100/80">
                      {item.message}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-extrabold text-blue-700 transition hover:bg-slate-50 dark:border-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-950/40"
          >
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function UserIcon()     { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function BookmarkIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>; }
function HomeIcon()     { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function LogoutIcon()   { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function ChevronIcon({ className }) { return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 dark:text-blue-300/50 ${className}`}><polyline points="6 9 12 15 18 9"/></svg>; }

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function Header() {
  const router   = useRouter();
  const pathname = usePathname();

  const [meData, setMeData] = useState({ ok: false, user: null });
  const [open,   setOpen]   = useState(false);
  const mode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => { applyTheme(mode); }, [mode]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMeData(d?.ok ? d : { ok: false, user: null }))
      .catch(() => setMeData({ ok: false, user: null }));
  }, [pathname]);

  useEffect(() => { setOpen(false); }, [pathname]);

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

  const isDark   = mode === "dark";
  const isAdmin  = meData?.user?.role === "admin";
  const verificationStatus = meData?.user?.writerVerification?.status;
  const canApplyAsWriter =
    meData?.user?.role === "blog_writer" &&
    verificationStatus !== "pending" &&
    verificationStatus !== "approved";

  const isLoggedIn = meData?.ok && meData?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-700 dark:text-blue-100/85">
          <NavLinks isAdmin={isAdmin} canApplyAsWriter={canApplyAsWriter} />
        </nav>

        {/* Desktop right cluster */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition
            dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:bg-blue-950/55"
          >
            {isDark ? "Light" : "Dark"}
          </button>

          {isLoggedIn ? (
            <>
              <NotificationBell />
              <AvatarDropdown user={meData.user} onLogout={logout} />
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

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition
          dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100"
          onClick={() => setOpen((s) => !s)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/80 backdrop-blur dark:border-blue-400/20 dark:bg-slate-950/80">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3 text-sm font-semibold text-slate-700 dark:text-blue-100/85">
            <NavLinks onClick={() => setOpen(false)} isAdmin={isAdmin} canApplyAsWriter={canApplyAsWriter} />

            {isLoggedIn && (
              <>
                <Link href="/profile"   onClick={() => setOpen(false)} className="hover:text-blue-600 dark:hover:text-red-300 transition">My Profile</Link>
                <Link href="/saved"     onClick={() => setOpen(false)} className="hover:text-blue-600 dark:hover:text-red-300 transition">My Bookmarks</Link>
                <Link href="/notifications" onClick={() => setOpen(false)} className="hover:text-blue-600 dark:hover:text-red-300 transition">Notifications</Link>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="hover:text-blue-600 dark:hover:text-red-300 transition">Dashboard</Link>
              </>
            )}

            <div className="pt-3 border-t border-slate-200/70 dark:border-blue-400/20 flex items-center justify-between gap-3">
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white transition
                dark:border-blue-400/20 dark:bg-blue-950/40 dark:text-blue-100"
              >
                {isDark ? "Light" : "Dark"}
              </button>

              {isLoggedIn ? (
                <Button className="from-blue-600 to-red-500" onClick={logout}>Logout</Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="font-semibold hover:text-blue-600 transition dark:text-blue-100/90 dark:hover:text-red-300">Login</Link>
                  <Link href="/register"><Button>Register</Button></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
