"use client";

import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">{msg}</p>
  );
}

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const nextUrl = useMemo(() => {
    const n = sp.get("next");
    return n && n.startsWith("/") ? n : "/dashboard";
  }, [sp]);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // field-level errors
  const [errors, setErrors] = useState({ email: null, password: null, general: null });

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", {
      callbackUrl: `/api/auth/google-session?action=login`,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({ email: null, password: null, general: null });
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

    // Map error codes from the API to field-level messages
    const code = data?.code;

    if (code === "USER_NOT_FOUND") {
      setErrors({ email: "No account found with this email. Please register first.", password: null, general: null });
    } else if (code === "WRONG_PASSWORD") {
      setErrors({ email: null, password: "Incorrect password. Please try again.", general: null });
    } else if (code === "EMAIL_NOT_VERIFIED") {
      setErrors({ email: null, password: null, general: "Your email is not verified. Please check your inbox and verify your account before logging in." });
    } else if (code === "GOOGLE_ACCOUNT") {
      setErrors({ email: "This email is registered via Google. Please use 'Login with Google' below.", password: null, general: null });
    } else if (code === "ACCOUNT_DISABLED") {
      setErrors({ email: null, password: null, general: "Your account has been disabled. Please contact us for support." });
    } else {
      setErrors({ email: null, password: null, general: data?.error || "Something went wrong. Please try again." });
    }
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
            {/* Email */}
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
                  className={errors.email ? "border-red-400 focus:ring-red-300" : ""}
                />
              </div>
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Password
              </label>
              <div className="mt-2">
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className={errors.password ? "border-red-400 focus:ring-red-300" : ""}
                />
              </div>
              <FieldError msg={errors.password} />
            </div>

            {/* General errors (not field-specific) */}
            {errors.general && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100/80">
                {errors.general}
              </div>
            )}

            {/* Google OAuth error */}
            {sp.get("error") === "google_not_found" && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/25 dark:bg-red-950/30 dark:text-red-300">
                No account found for this Google account. Please register first.
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Signing in..." : "Login"}
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-blue-400/20" />
              <span className="text-xs font-semibold text-slate-400 dark:text-blue-100/40">or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-blue-400/20" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition
                hover:bg-slate-50 disabled:opacity-60
                dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-950/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              {googleLoading ? "Redirecting..." : "Login with Google"}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-600 dark:text-blue-100/75">
              <span>
                Need an account?{" "}
                <Link
                  className="font-extrabold text-blue-700 hover:text-red-500 transition dark:text-blue-200 dark:hover:text-red-300"
                  href="/register"
                >
                  Register
                </Link>
              </span>
              <Link
                className="font-extrabold text-blue-700 hover:text-red-500 transition dark:text-blue-200 dark:hover:text-red-300"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
}