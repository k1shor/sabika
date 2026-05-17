"use client";

import { useMemo, useState } from "react";
import Container from "@/components/Container";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function ApplyWriterPage() {
  const [category, setCategory] = useState("entrance_exam_passed");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const requiresLicense = useMemo(
    () =>
      ["registered_nurse", "nurse_working_nepal", "nurse_working_abroad"].includes(category),
    [category]
  );

  const requiresWorkplace = useMemo(
    () => ["nurse_working_nepal", "nurse_working_abroad"].includes(category),
    [category]
  );

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);

    const form = new FormData(e.target);
    const payload = {
      writerCategory: String(form.get("category") || ""),
      licenseNo: String(form.get("licenseNo") || ""),
      workplace: String(form.get("workplace") || ""),
      documentUrl: String(form.get("documentUrl") || ""),
    };

    const res = await fetch("/api/auth/apply-writer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (data?.ok) {
      setMsg(data.message || "Writer application submitted.");
      e.target.reset();
      setCategory("entrance_exam_passed");
      return;
    }

    setErr(data?.error || "Writer application failed.");
  };

  return (
    <Container>
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Writer Application
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-blue-100/75">
          Submit your details before creating posts.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Which best describes you?
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15"
              required
            >
              <option value="entrance_exam_passed">Entrance exam-passed student</option>
              <option value="nursing_student">Nursing student</option>
              <option value="registered_nurse">Registered nurse</option>
              <option value="nurse_working_nepal">Nurse working in Nepal</option>
              <option value="nurse_studying_abroad">Nurse studying abroad</option>
              <option value="nurse_working_abroad">Nurse working abroad</option>
            </select>
          </div>

          {requiresLicense && (
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                License number
              </label>
              <div className="mt-2">
                <Input name="licenseNo" placeholder="Your nursing license number" required />
              </div>
            </div>
          )}

          {requiresWorkplace && (
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
                Working place
              </label>
              <div className="mt-2">
                <Input name="workplace" placeholder="Hospital, clinic, or organization" required />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-blue-100/80">
              Proof document link
            </label>
            <div className="mt-2">
              <Input
                name="documentUrl"
                placeholder="Link to ID card, license, or proof document"
                required
              />
            </div>
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {msg && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              {msg}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
