"use client";

import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [loading,     setLoading]     = useState(false);
  const [err,         setErr]         = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [ok,          setOk]          = useState(null); // { highlight, message }
  const [role,        setRole]        = useState("visitor");
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setFieldErrors({});
    setLoading(true);

    const form    = new FormData(e.target);
    const payload = {
      name:     String(form.get("name")     || ""),
      email:    String(form.get("email")    || ""),
      password: String(form.get("password") || ""),
      role:     String(form.get("role")     || "visitor"),
    };

    const res  = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (data?.ok) {
      setOk({ highlight: data.highlight, message: data.message });
      e.target.reset();
      setRole("visitor");
    } else {
      setErr(data?.error || "Registration failed.");
      setFieldErrors(data?.fields || {});
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
    setGoogleLoading(false);
  };

  return (
    <Container>
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-blue-100/75">
          Join Nursing Nepal and start learning today.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">

          {/* ── Name ── */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Full name
            </label>
            <div className="mt-2">
              <Input
                name="name"
                placeholder="e.g. John Doe"
                required
                onBlur={(e) => {
                  const parts = e.target.value.trim().split(/\s+/);
                  if (parts.length < 2 || parts[1] === "") {
                    e.target.setCustomValidity("Please enter your full name (first and last name)");
                    e.target.reportValidity();
                  } else {
                    e.target.setCustomValidity("");
                  }
                }}
                onChange={(e) => {
                  e.target.setCustomValidity("");
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* ── Email ── */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Email
            </label>
            <div className="mt-2">
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                onChange={() => setFieldErrors((prev) => ({ ...prev, email: undefined }))}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* ── Password ── */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Password
            </label>
            <div className="mt-2">
              <Input
                name="password"
                type="password"
                placeholder="Min 8 chars, uppercase, number, special char"
                required
                onChange={() => setFieldErrors((prev) => ({ ...prev, password: undefined }))}
              />
            </div>
            {fieldErrors.password ? (
              <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {fieldErrors.password}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400 dark:text-blue-100/40">
                Use uppercase, lowercase, number and special character.
              </p>
            )}
          </div>

          {/* ── Role ── */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Account type
            </label>
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none
              focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15
              dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white"
            >
              <option value="visitor">Visitor</option>
              <option value="blog_writer">Blog Writer</option>
            </select>
          </div>

          {/* ── Error ── */}
          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700
            dark:border-red-400/25 dark:bg-red-950/30 dark:text-red-300">
              {err}
            </div>
          )}

          {/* ── Success ── */}
          {ok && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3
            dark:border-green-400/20 dark:bg-green-950/30">
              {ok.highlight && (
                <p className="text-sm font-extrabold text-green-700 dark:text-green-300">
                  {ok.highlight}
                </p>
              )}
              <p className="mt-0.5 text-sm text-green-700/80 dark:text-green-400/80">
                {ok.message}
              </p>
            </div>
          )}

          {/* ── Submit ── */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>

         {/* ── Divider ── */}
         <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-blue-400/20" />
            <span className="text-xs font-semibold text-slate-400 dark:text-blue-100/40">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-blue-400/20" />
          </div>

          {/* ── Role notice for Google ── */}
          <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center gap-2
            ${role === "blog_writer"
              ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-300"
              : "border-slate-200 bg-slate-50 text-slate-600 dark:border-blue-400/10 dark:bg-blue-950/20 dark:text-blue-100/60"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Signing in with Google will register you as a{" "}
            <span className="font-extrabold">
              {role === "blog_writer" ? "Blog Writer" : "Visitor"}
            </span>.
            {role === "visitor" && (
              <span className="ml-1 text-slate-400 dark:text-blue-100/40">
                (Change above to switch role)
              </span>
            )}
          </div>

          {/* ── Google button ── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition
            hover:bg-slate-50 disabled:opacity-60
            dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {googleLoading ? "Redirecting..." : `Continue with Google as ${role === "blog_writer" ? "Blog Writer" : "Visitor"}`}
          </button>

          {/* ── Login link ── */}
          <p className="text-center text-sm text-slate-600 dark:text-blue-100/75">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-extrabold text-blue-700 hover:text-red-500 transition dark:text-blue-200 dark:hover:text-red-300"
            >
              Login
            </Link>
          </p>

        </form>
      </div>
    </Container>
  );
}