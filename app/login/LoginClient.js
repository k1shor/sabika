"use client";

import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextUrl = useMemo(() => {
    const n = sp.get("next");
    return n && n.startsWith("/") ? n : "/";
  }, [sp]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (data?.ok) {
      router.refresh();
      if (data?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(nextUrl);
      }
      return;
    }

    setMsg(data?.error || "Login failed. Please check your credentials.");
  };

  return (
    <Container>
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Login
          </h1>
          <p className="mt-2 text-slate-600 dark:text-blue-100/75">
            Welcome back to Nursing Nepal.
          </p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Email
              </label>
              <div className="mt-2">
                <Input name="email" type="email" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Password
              </label>
              <div className="mt-2">
                <Input name="password" type="password" placeholder="••••••••" required />
              </div>
            </div>

            {msg && (
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
                {msg}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Signing in..." : "Login"}
            </Button>

            <div className="text-sm font-semibold text-slate-600 dark:text-blue-100/75">
              Don’t have an account?{" "}
              <Link
                className="font-extrabold text-blue-700 hover:text-red-500 transition dark:text-blue-200 dark:hover:text-red-300"
                href="/register"
              >
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}
