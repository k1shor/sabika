"use client";

import Link from "next/link";
import Button from "@/components/Button";
import { LogoutIcon } from "./HeaderIcons";
import { MobileNavLink } from "./HeaderNav";
import ThemeToggle from "./ThemeToggle";

export default function MobileHeaderDrawer({
  isDark,
  isLoggedIn,
  items,
  onClose,
  onLogout,
  onToggleTheme,
}) {
  return (
    <div className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-md dark:border-blue-400/20 dark:bg-slate-950/95">
      <div className="mx-auto max-w-6xl px-4 py-3 pb-4">
        <div className="flex flex-col gap-0.5 mb-4">
          {items.map((item) => (
            <MobileNavLink key={item.href} href={item.href} label={item.label} onClick={onClose} />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/70 dark:border-blue-400/20">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          {isLoggedIn ? (
            <button
              onClick={() => { onClose(); onLogout(); }}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-400"
            >
              <LogoutIcon /> Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" onClick={onClose} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition dark:text-blue-100/80">
                Login
              </Link>
              <Link href="/register" onClick={onClose}>
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
