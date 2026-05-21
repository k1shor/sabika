"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = String(params?.token || "");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const form = new FormData(e.target);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (data?.ok) {
      setDone(true);
      setMsg(data.message || "Password updated. You can now log in.");
      e.target.reset();
      return;
    }

    setErr(data?.error || "Password reset failed.");
  };

  return (
    <Container>
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Reset Password
          </h1>
          <p className="mt-2 text-slate-600 dark:text-blue-100/75">
            Choose a new password for your Nursing Nepal account.
          </p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                New Password
              </label>
              <div className="mt-2">
                <Input name="password" type="password" placeholder="Minimum 6 chars" required disabled={done} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Confirm Password
              </label>
              <div className="mt-2">
                <Input name="confirmPassword" type="password" placeholder="Repeat password" required disabled={done} />
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

            {done ? (
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-blue-600 to-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:brightness-95"
              >
                Go to Login
              </Link>
            ) : (
              <Button type="submit" disabled={loading} className="w-full py-3">
                {loading ? "Saving..." : "Reset Password"}
              </Button>
            )}
          </form>
        </div>
      </div>
    </Container>
  );
}
