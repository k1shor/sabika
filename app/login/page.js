"use client";

import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
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

    if (data?.ok) location.href = next;
    else setErr(data?.error || "Login failed");
  };

  return (
    <Container>
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight">Login</h1>
        <p className="mt-2 text-slate-600 text-sm">Access your admin dashboard.</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="mt-2">
              <Input name="email" type="email" placeholder="you@example.com" required />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="mt-2">
              <Input name="password" type="password" placeholder="••••••••" required />
            </div>
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-sm text-slate-600">
            No account?{" "}
            <Link className="font-semibold text-blue-700 hover:underline" href="/register">
              Register
            </Link>
          </div>
        </form>
      </div>
    </Container>
  );
}
