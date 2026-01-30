import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
            <div className="h-6 w-40 rounded-lg bg-slate-200/70 dark:bg-blue-900/40" />
            <div className="mt-4 h-4 w-72 rounded-lg bg-slate-200/70 dark:bg-blue-900/40" />
            <div className="mt-8 grid gap-3">
              <div className="h-11 rounded-2xl bg-slate-200/70 dark:bg-blue-900/40" />
              <div className="h-11 rounded-2xl bg-slate-200/70 dark:bg-blue-900/40" />
              <div className="mt-2 h-11 rounded-2xl bg-slate-200/70 dark:bg-blue-900/40" />
            </div>
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
