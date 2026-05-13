"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      await fetch("/api/auth/verifyemail", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    };

    if (token) verify();
  }, [token]);

  return <h1>Verifying email...</h1>;
}