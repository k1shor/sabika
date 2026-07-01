import { THEME_EVENT } from "./headerData";

export function getSavedTheme() {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem("theme");
  return saved === "dark" || saved === "light" ? saved : null;
}

export function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getThemeSnapshot() {
  return getSavedTheme() || getSystemTheme();
}

export function getServerThemeSnapshot() {
  return "light";
}

export function applyTheme(mode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export function subscribeTheme(callback) {
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
