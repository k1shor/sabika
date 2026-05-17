"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/Container";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState({
    status: "loading",
    message: "Verifying your email...",
  });

  useEffect(() => {
    const verify = async () => {
      const res = await fetch("/api/auth/verifyemail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setState({
          status: "success",
          message: "Your email is verified. You can login now.",
        });
      } else {
        setState({
          status: "error",
          message: data?.error || "Email verification failed.",
        });
      }
    };

    if (token) {
      verify();
    } else {
      setState({
        status: "error",
        message: "Verification token is missing.",
      });
    }
  }, [token]);

  return (
    <Container>
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 text-center shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Email Verification
        </h1>

        <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-blue-100/80">
          {state.message}
        </p>

        {state.status === "success" && (
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-blue-600"
          >
            Go to login
          </Link>
        )}
      </div>
    </Container>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/70 p-8 text-center shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Email Verification
            </h1>
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Verifying your email...
            </p>
          </div>
        </Container>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}