"use client";

import { useEffect } from "react";
import Link from "next/link";
import Container from "@/components/Container";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <Container>
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Something went wrong!
        </h2>
        <p className="mb-8 max-w-md text-sm font-semibold text-slate-600 dark:text-blue-100/70">
          We apologize for the inconvenience. An unexpected error occurred while processing your request.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100 dark:hover:bg-blue-900/30"
          >
            Go back home
          </Link>
        </div>
      </div>
    </Container>
  );
}
