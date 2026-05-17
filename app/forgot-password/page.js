"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      email: String(form.get("email") || ""),
    };

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (data?.ok) {
      setMsg(data.message || "If that email is registered, a password reset link has been sent.");
      e.target.reset();
      return;
    }

    setErr(data?.error || "Password reset request failed.");
  };

  return (
    <Container>
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Forgot Password
          </h1>
          <p className="mt-2 text-slate-600 dark:text-blue-100/75">
            Enter your account email and we will send a reset link.
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

            {err && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/25 dark:bg-red-950/30 dark:text-red-200">
                {err}
              </div>
            )}

            {msg && (
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
                {msg}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-sm font-semibold text-slate-600 dark:text-blue-100/75">
              Remembered it?{" "}
              <Link className="font-extrabold text-blue-700 hover:text-red-500 transition dark:text-blue-200 dark:hover:text-red-300" href="/login">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}
