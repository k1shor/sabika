"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";

const THEME_EVENT = "nursing-theme-change";
const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blogs", label: "Articles" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
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
function getThemeSnapshot() { return getSavedTheme() || getSystemTheme(); }
function getServerThemeSnapshot() { return "light"; }
function applyTheme(mode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}
function subscribeTheme(callback) {
  if (typeof window === "undefined") return () => { };
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onThemeChange = () => callback();
  const onSystemChange = () => { if (!getSavedTheme()) callback(); };
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

function getInitials(name) {
  if (!name) return "U";
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function getRoleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "blog_writer") return "Blog Writer";
  return "Visitor";
}

// ─── Desktop nav link with active underline ───────────────────────────────────

function DesktopNavLink({ href, label }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-0.5 text-sm font-semibold transition-colors duration-150
        ${isActive
          ? "text-blue-700 dark:text-blue-400"
          : "text-slate-600 hover:text-blue-600 dark:text-blue-100/75 dark:hover:text-blue-300"
        }`}
    >
      {label}
      {/* Underline: always-visible slot, filled only when active */}
      <span
        className={`h-[2.5px] w-full rounded-full bg-linear-to-r from-blue-600 to-red-500 transition-opacity duration-150
          ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}
      />
    </Link>
  );
}

// ─── Desktop nav ──────────────────────────────────────────────────────────────

function DesktopNav({ isAdmin, canApplyAsWriter, canWritePosts }) {
  const adminItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blogs", label: "Articles" },
    { href: "/faq", label: "FAQ" },
    { href: "/admin/dashboard", label: "Admin Dashboard" },
  ];
  const visitorItems = [
    ...NAV_ITEMS,
    ...(canWritePosts ? [{ href: "/writers/posts", label: "My Posts" }] : []),
    ...(canApplyAsWriter ? [{ href: "/apply-writer", label: "Apply Writer" }] : []),
  ];

  const allItems = isAdmin ? adminItems : visitorItems;

  return (
    <nav className="hidden md:flex items-center gap-6">
      {allItems.map((item) => (
        <DesktopNavLink key={item.href} href={item.href} label={item.label} />
      ))}
    </nav>
  );
}

// ─── Mobile nav link ──────────────────────────────────────────────────────────

function MobileNavLink({ href, label, onClick }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors
        ${isActive
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:text-blue-100/75 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
        }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? "bg-linear-to-br from-blue-600 to-red-500" : "bg-transparent"}`} />
      {label}
      {isActive && <span className="ml-auto text-[10px] font-bold text-blue-400 dark:text-blue-500">●</span>}
    </Link>
  );
}

// ─── Avatar dropdown ──────────────────────────────────────────────────────────

function AvatarDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const canWritePosts =
    user?.role === "admin" ||
    (user?.role === "blog_writer" && user?.writerVerification?.status === "approved");

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const menuItems = [
    { href: "/profile", icon: UserIcon, label: "My Profile" },
    { href: "/saved", icon: BookmarkIcon, label: "My Bookmarks" },
    { href: "/following", icon: FollowIcon, label: "Following" },
    ...(canWritePosts ? [{ href: "/writers/posts", icon: PenIcon, label: "My Posts" }] : []),
    { href: "/dashboard", icon: HomeIcon, label: "Dashboard" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 pl-1.5 pr-3 py-1.5 shadow-sm transition
          hover:border-blue-200 hover:shadow-md
          dark:border-blue-400/20 dark:bg-blue-950/50 dark:hover:bg-blue-950/70"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-700 text-[11px] font-extrabold text-white">
          {getInitials(user.name)}
        </div>
        <div className="hidden lg:flex flex-col leading-tight text-left">
          <span className="text-[12px] font-bold text-slate-800 dark:text-white max-w-24 truncate">{user.name || "User"}</span>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-blue-300/60">{getRoleLabel(user.role)}</span>
        </div>
        <ChevronIcon className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 z-50
          dark:border-blue-400/20 dark:bg-slate-900 dark:shadow-none overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-blue-400/10 bg-linear-to-r from-blue-50/60 to-white dark:from-blue-950/30 dark:to-transparent">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-700 text-sm font-extrabold text-white">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 dark:text-blue-300/60 truncate">{user.email}</p>
            </div>
          </div>
          {/* Items */}
          <div className="py-1.5">
            {menuItems.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition
                  dark:text-blue-100/80 dark:hover:bg-blue-950/40">
                <Icon />{label}
              </Link>
            ))}
          </div>
         
          {/* Logout */}
          <div className="border-t border-slate-100 dark:border-blue-400/10 py-1.5">
            <button onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition
                dark:text-red-400 dark:hover:bg-red-950/30">
              <LogoutIcon />Logout
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
  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/me/notifications", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (data?.ok) setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
  };

  const markAllRead = async () => {
    await fetch("/api/auth/me/notifications", { method: "PATCH" }).catch(() => null);
    await load();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        onClick={() => { setOpen((v) => !v); load(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition
          hover:border-slate-300 hover:text-slate-700
          dark:border-blue-400/20 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-950/70"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50
          dark:border-blue-400/20 dark:bg-slate-900 dark:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-blue-400/10 bg-linear-to-r from-slate-50 to-white dark:from-blue-950/20 dark:to-transparent">
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-blue-100/50">{unreadCount} unread</p>
            </div>
            <button type="button" onClick={markAllRead} disabled={unreadCount === 0}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition disabled:text-slate-300 dark:text-blue-300 dark:disabled:text-blue-100/20">
              Mark all read
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((item) => (
                <Link key={item._id} href={item.postSlug ? `/blogs/${item.postSlug}` : "/notifications"}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50 dark:hover:bg-blue-950/40">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-slate-200 dark:bg-blue-100/20" : "bg-red-500"}`} />
                  <p className="text-sm font-semibold leading-snug text-slate-700 dark:text-blue-100/80">{item.message}</p>
                </Link>
              ))
            )}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-bold text-blue-700 transition hover:bg-slate-50
              dark:border-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-950/40">
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition
        hover:border-slate-300 hover:text-slate-700
        dark:border-blue-400/20 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-950/70"
      aria-label="Toggle theme"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function UserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }
function BookmarkIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>; }
function FollowIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>; }
function PenIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>; }
function HomeIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>; }
function LogoutIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>; }
function ChevronIcon({ className }) { return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 dark:text-blue-300/50 ${className}`}><polyline points="6 9 12 15 18 9" /></svg>; }
function BellIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>; }
function SunIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>; }
function MoonIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>; }
function MenuIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>; }
function CloseIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [meData, setMeData] = useState({ ok: false, user: null });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => { applyTheme(mode); }, [mode]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMeData(d?.ok ? d : { ok: false, user: null }))
      .catch(() => setMeData({ ok: false, user: null }));
  }, [pathname]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

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
  const verificationStatus = meData?.user?.writerVerification?.status;
  const canApplyAsWriter =
    meData?.user?.role === "blog_writer" &&
    verificationStatus !== "pending" &&
    verificationStatus !== "approved";
  const canWritePosts =
    isAdmin ||
    (meData?.user?.role === "blog_writer" && verificationStatus === "approved");
  const isLoggedIn = meData?.ok && meData?.user;

  const mobileNavItems = isAdmin
    ? [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/blogs", label: "Articles" },
      { href: "/faq", label: "FAQ" },
      { href: "/writers/posts", label: "My Posts" },
      { href: "/admin/dashboard", label: "Admin Dashboard" },
    ]
    : [
      ...NAV_ITEMS,
      ...(canWritePosts ? [{ href: "/writers/posts", label: "My Posts" }] : []),
      ...(canApplyAsWriter ? [{ href: "/apply-writer", label: "Apply Writer" }] : []),
      ...(isLoggedIn ? [
        { href: "/profile", label: "My Profile" },
        { href: "/saved", label: "My Bookmarks" },
        { href: "/following", label: "Following" },
        { href: "/notifications", label: "Notifications" },
        { href: "/dashboard", label: "Dashboard" },
      ] : []),
    ];

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300
        ${scrolled
          ? "border-slate-200/80 bg-white/85 shadow-sm shadow-slate-200/40 backdrop-blur-md dark:border-blue-400/20 dark:bg-slate-950/85 dark:shadow-none"
          : "border-slate-200/50 bg-white/70 backdrop-blur-sm dark:border-blue-400/10 dark:bg-slate-950/60"
        }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src={isDark ? "/banner-dark.png" : "/banner.png"}
              alt="Nursing Nepal"
              width={200}
              height={44}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <DesktopNav
            isAdmin={isAdmin}
            canApplyAsWriter={canApplyAsWriter}
            canWritePosts={canWritePosts}
          />

          {/* Right cluster */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <AvatarDropdown user={meData.user} onLogout={logout} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition dark:text-blue-100/80 dark:hover:text-blue-300 px-2 py-1">
                  Login
                </Link>
                <Link href="/register"><Button>Register</Button></Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition
              hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/50 dark:text-blue-100"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-md dark:border-blue-400/20 dark:bg-slate-950/95">
          <div className="mx-auto max-w-6xl px-4 py-3 pb-4">
            <div className="flex flex-col gap-0.5 mb-4">
              {mobileNavItems.map((item) => (
                <MobileNavLink key={item.href} href={item.href} label={item.label} onClick={() => setOpen(false)} />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-blue-400/20">
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              {isLoggedIn ? (
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100
                    dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-400"
                >
                  <LogoutIcon /> Logout
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition dark:text-blue-100/80">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
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
