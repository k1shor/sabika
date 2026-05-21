"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";

const FALLBACK_FAQS = [
  { _id: "1", question: "Is Nursing Nepal a hospital service?",          answer: "No. Nursing Nepal is an informational website. We provide educational content and general guidance." },
  { _id: "2", question: "Can I request nursing topics to be added?",     answer: "Yes. You can contact us and suggest topics like wound care, injection safety, first aid, or patient nutrition." },
  { _id: "3", question: "Is the information suitable for nursing students?", answer: "Yes. We publish simplified nursing notes, care plans, and exam preparation content." },
  { _id: "4", question: "Do you provide emergency medical support?",     answer: "No. For emergencies, please contact local hospitals or emergency services immediately." },
];

// ─── Admin form (add / edit) ──────────────────────────────────────────────────

function FaqForm({ initial, onSave, onCancel }) {
  const [question, setQuestion] = useState(initial?.question || "");
  const [answer,   setAnswer]   = useState(initial?.answer   || "");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) { setErr("Both fields are required."); return; }
    setLoading(true); setErr("");
    await onSave({ question: question.trim(), answer: answer.trim() });
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-400/20 dark:bg-blue-950/30 flex flex-col gap-3">
      <p className="text-sm font-extrabold text-slate-800 dark:text-white">
        {initial ? "Edit FAQ" : "Add New FAQ"}
      </p>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer"
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-400/30 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white"
      />
      {err && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-60">
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition dark:border-blue-400/20 dark:bg-transparent dark:text-blue-100">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Single FAQ card ──────────────────────────────────────────────────────────

function FaqCard({ faq, isAdmin, onEdit, onDelete }) {
  const [open,    setOpen]    = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this FAQ?")) return;
    setDeleting(true);
    await onDelete(faq._id);
    setDeleting(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25 overflow-hidden">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="font-bold text-slate-900 dark:text-white">{faq.question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-5 border-t border-slate-100 dark:border-blue-400/10">
          <p className="mt-3 text-sm text-slate-600 dark:text-blue-100/75 leading-relaxed">
            {faq.answer}
          </p>

          {/* Admin controls */}
          {isAdmin && (
            <div className="mt-4 flex gap-2">
              <button onClick={() => onEdit(faq)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition dark:border-blue-400/20 dark:bg-transparent dark:text-blue-100 dark:hover:bg-blue-950/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50 dark:border-red-400/20 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const [faqs,      setFaqs]      = useState([]);
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [editTarget, setEditTarget] = useState(null);  // faq being edited
  const [showAdd,   setShowAdd]   = useState(false);

  // Fetch FAQs and check if user is admin
  useEffect(() => {
    Promise.all([
      fetch("/api/faqs").then((r) => r.json()).catch(() => ({ faqs: [] })),
      fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]).then(([faqData, meData]) => {
      setFaqs(faqData?.faqs?.length ? faqData.faqs : FALLBACK_FAQS);
      setIsAdmin(meData?.user?.role === "admin");
      setLoading(false);
    });
  }, []);

  const handleAdd = async (body) => {
    const res  = await fetch("/api/faqs", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ok) {
      setFaqs((prev) => [...prev, data.faq]);
      setShowAdd(false);
    }
  };

  const handleEdit = async (body) => {
    const res  = await fetch(`/api/faqs/${editTarget._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ok) {
      setFaqs((prev) => prev.map((f) => f._id === editTarget._id ? data.faq : f));
      setEditTarget(null);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
    if (res.ok) setFaqs((prev) => prev.filter((f) => f._id !== id));
  };

  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Help Center
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h1>
            <p className="mt-2 text-slate-600 dark:text-blue-100/75">
              Everything you need to know about Nursing Nepal.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => { setShowAdd(true); setEditTarget(null); }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add FAQ
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">

          {/* Add form */}
          {isAdmin && showAdd && (
            <FaqForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
          )}

          {loading && (
            <p className="text-sm text-slate-500 dark:text-blue-100/50 py-4 text-center">Loading...</p>
          )}

          {!loading && faqs.map((faq) => (
            editTarget?._id === faq._id ? (
              <FaqForm
                key={faq._id}
                initial={faq}
                onSave={handleEdit}
                onCancel={() => setEditTarget(null)}
              />
            ) : (
              <FaqCard
                key={faq._id}
                faq={faq}
                isAdmin={isAdmin}
                onEdit={(f) => { setEditTarget(f); setShowAdd(false); }}
                onDelete={handleDelete}
              />
            )
          ))}

          {!loading && faqs.length === 0 && (
            <p className="text-center text-sm text-slate-500 dark:text-blue-100/50 py-8">
              No FAQs yet.
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}