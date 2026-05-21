"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token        = searchParams.get("token");
  const emailFromUrl = searchParams.get("email") || ""; // pre-filled from original link

  const [state, setState] = useState({
    status:  "loading",
    message: "Verifying your email...",
  });

  const [email,       setEmail]       = useState(emailFromUrl);
  const [resendState, setResendState] = useState({ status: "", message: "" });

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setState({ status: "error", message: "Verification token is missing." });
        return;
      }

      try {
        const res  = await fetch("/api/auth/verifyemail", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok && data.ok) {
          setState({ status: "success", message: "Your email is verified. You can login now." });
        } else {
          setState({ status: "error", message: data?.error || "Email verification failed." });
        }
      } catch {
        setState({ status: "error", message: "Email verification failed." });
      }
    };

    verify();
  }, [token]);

  const resendEmail = async () => {
    if (!email.trim()) {
      setResendState({ status: "error", message: "Please enter your email address." });
      return;
    }

    setResendState({ status: "loading", message: "Sending..." });

    try {
      const res  = await fetch("/api/auth/resend-verification", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setResendState({ status: "success", message: data.message || "Verification email sent! Check your inbox." });
      } else {
        setResendState({ status: "error", message: data?.error || "Failed to resend email." });
      }
    } catch {
      setResendState({ status: "error", message: "Failed to resend email." });
    }
  };

  return (
    <Container>
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 text-center shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Email Verification
        </h1>

        <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-blue-100/80">
          {state.message}
        </p>

        {/* Success */}
        {state.status === "success" && (
          <div className="mt-6">
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        )}

        {/* Error — resend form */}
        {state.status === "error" && (
          <div className="mt-6 flex flex-col gap-3 text-left">
            <p className="text-sm text-slate-500 dark:text-blue-100/60 text-center">
              {emailFromUrl
                ? "Your link has expired. Click below to get a new one."
                : "Enter your registered email to get a new verification link."}
            </p>

            <div className="relative">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => !emailFromUrl && setEmail(e.target.value)}
                readOnly={!!emailFromUrl}
                className={emailFromUrl ? "opacity-60 cursor-not-allowed select-none" : ""}
              />
              {/* Lock icon shown when email is locked */}
              {emailFromUrl && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-blue-300/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              )}
            </div>

            <Button
              onClick={resendEmail}
              disabled={resendState.status === "loading"}
              className="w-full from-green-600 to-green-500"
            >
              {resendState.status === "loading" ? "Sending..." : "Resend Verification Email"}
            </Button>

            {resendState.message && (
              <p className={`text-sm font-semibold text-center ${
                resendState.status === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {resendState.message}
              </p>
            )}

            {resendState.status === "success" && (
              <Link
                href="/login"
                className="text-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
              >
                Back to Login
              </Link>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}

export default VerifyEmailContent;