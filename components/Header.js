"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";
import AvatarDropdown from "./header/AvatarDropdown";
import { THEME_EVENT, getMobileNavItems } from "./header/headerData";
import { CloseIcon, MenuIcon } from "./header/HeaderIcons";
import { DesktopNav } from "./header/HeaderNav";
import { getWriterPermissions } from "./header/headerUtils";
import MobileHeaderDrawer from "./header/MobileHeaderDrawer";
import NotificationBell from "./header/NotificationBell";
import ThemeToggle from "./header/ThemeToggle";
import { applyTheme, getServerThemeSnapshot, getThemeSnapshot, subscribeTheme } from "./header/themeUtils";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [meData, setMeData] = useState({ ok: false, user: null });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setMeData(data?.ok ? data : { ok: false, user: null }))
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
  const isLoggedIn = meData?.ok && meData?.user;
  const { isAdmin, canApplyAsWriter, canWritePosts } = getWriterPermissions(meData?.user);
  const mobileNavItems = getMobileNavItems({ isAdmin, canApplyAsWriter, canWritePosts, isLoggedIn });

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "border-slate-200/80 bg-white/85 shadow-sm shadow-slate-200/40 backdrop-blur-md dark:border-blue-400/20 dark:bg-slate-950/85 dark:shadow-none"
          : "border-slate-200/50 bg-white/70 backdrop-blur-sm dark:border-blue-400/10 dark:bg-slate-950/60"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-6">
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

          <DesktopNav
            isAdmin={isAdmin}
            canApplyAsWriter={canApplyAsWriter}
            canWritePosts={canWritePosts}
          />

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <AvatarDropdown user={meData.user} onLogout={logout} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition dark:text-blue-100/80 dark:hover:text-blue-300 px-2 py-1">
                  Login
                </Link>
                <Link href="/register"><Button>Register</Button></Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition hover:bg-white dark:border-blue-400/20 dark:bg-blue-950/50 dark:text-blue-100"
            onClick={() => setOpen((state) => !state)}
            aria-label="Toggle menu"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <MobileHeaderDrawer
          isDark={isDark}
          isLoggedIn={isLoggedIn}
          items={mobileNavItems}
          onClose={() => setOpen(false)}
          onLogout={logout}
          onToggleTheme={toggleTheme}
        />
      )}
    </header>
  );
}
