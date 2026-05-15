"use client";

import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);
  const [role, setRole] = useState("visitor");

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);

    const form = new FormData(e.target);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      role: String(form.get("role") || "visitor"),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (data?.ok) {
      setOk(data.message || "Registered successfully. Check your email to verify your account before login.");
      e.target.reset();
      setRole("visitor");
    } else {
      setErr(data?.error || "Registration failed");
    }
  };

  return (
    <Container>
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight">Register</h1>
        <p className="mt-2 text-slate-600 text-sm">Create your account.</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Name</label>
            <div className="mt-2">
              <Input name="name" placeholder="Your name" required />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="mt-2">
              <Input name="email" type="email" placeholder="you@example.com" required />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="mt-2">
              <Input name="password" type="password" placeholder="Minimum 6 chars" required />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Account type</label>
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15"
            >
              <option value="visitor">Visitor</option>
              <option value="blog_writer">Blog writer</option>
            </select>
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {ok && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              {ok}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>

          <div className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-blue-700 hover:underline" href="/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </Container>
  );
}
