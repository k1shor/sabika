"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/Container";

const FALLBACK_FAQS = [
  { _id: "1", question: "Is Nursing Nepal a hospital service?",          answer: "No. Nursing Nepal is an informational website. We provide educational content and general guidance." },
  { _id: "2", question: "Can I request nursing topics to be added?",     answer: "Yes. You can contact us and suggest topics like wound care, injection safety, first aid, or patient nutrition." },
  { _id: "3", question: "Is the information suitable for nursing students?", answer: "Yes. We publish simplified nursing notes, care plans, and exam preparation content." },
  { _id: "4", question: "Do you provide emergency medical support?",     answer: "No. For emergencies, please contact local hospitals or emergency services immediately." },
];

// ─── Animated Background (Nepal Flag Colors: Blue & Red) ────────────────────

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      {/* Blue orb - top right */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-600/40 to-blue-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 50, -30, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Red orb - bottom left */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tl from-red-600/40 to-red-500/20 rounded-full blur-3xl"
        animate={{ x: [0, -50, 30, 0], y: [0, 50, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Center accent - mixed blue & red */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-linear-to-br from-blue-500/15 to-red-500/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.3, 0.5, 0.2, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function AnimatedFaqHeader({ isAdmin, onAddClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border-2 border-slate-200/50 dark:border-blue-500/30 bg-linear-to-br from-white/80 via-blue-50/30 to-red-50/20 dark:from-slate-900/80 dark:via-blue-950/40 dark:to-red-950/20 backdrop-blur-2xl shadow-2xl p-8 md:p-12"
    >
      <AnimatedBackground />

      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge - Nepal Blue */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-blue-600/50 bg-blue-600/10 backdrop-blur-xl px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-300 w-fit"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-linear-to-r from-blue-600 to-red-600"
            />
            Help Center
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            FAQ
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-2 text-slate-600 dark:text-blue-100/75 max-w-xl"
          >
            Everything you need to know about Nursing Nepal and how we can help you.
          </motion.p>
        </motion.div>

        {/* Add button - Nepal Flag Colors */}
        {isAdmin && (
          <motion.button
            onClick={onAddClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:shadow-2xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add FAQ
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

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
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={submit}
      className="rounded-2xl border-2 border-blue-300/50 bg-linear-to-br from-blue-50/80 to-red-50/50 dark:border-blue-500/20 dark:from-blue-950/40 dark:to-red-950/30 p-5 flex flex-col gap-3 backdrop-blur-sm"
    >
      <p className="text-sm font-extrabold text-slate-800 dark:text-white">
        {initial ? "✏️ Edit FAQ" : "➕ Add New FAQ"}
      </p>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="w-full rounded-xl border-2 border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-600 transition dark:border-blue-500/20 dark:bg-slate-950/50 dark:text-white"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Answer"
        rows={3}
        className="w-full rounded-xl border-2 border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 outline-none resize-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-600 transition dark:border-blue-500/20 dark:bg-slate-950/50 dark:text-white"
      />
      {err && <p className="text-xs font-semibold text-red-600 dark:text-red-400">❌ {err}</p>}
      <div className="flex gap-2">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-xl bg-linear-to-r from-blue-600 to-red-600 px-4 py-2 text-sm font-bold text-white hover:shadow-lg transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition dark:border-slate-600 dark:bg-slate-950/50 dark:text-blue-100"
        >
          Cancel
        </motion.button>
      </div>
    </motion.form>
  );
}

// ─── Single FAQ card ──────────────────────────────────────────────────────────

function FaqCard({ faq, isAdmin, onEdit, onDelete, index }) {
  const [open,    setOpen]    = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this FAQ?")) return;
    setDeleting(true);
    await onDelete(faq._id);
    setDeleting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-2xl border-2 border-slate-200/70 bg-white/70 shadow-sm dark:border-blue-500/20 dark:bg-blue-950/15 overflow-hidden hover:shadow-md transition-all"
    >
      <motion.button
        onClick={() => setOpen((s) => !s)}
        whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.02)" }}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="font-bold text-slate-900 dark:text-white text-lg">{faq.question}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 text-blue-600 dark:text-blue-400"
        >
          <polyline points="6 9 12 15 18 9"/>
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t-2 border-blue-100 dark:border-blue-500/10"
          >
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600 dark:text-blue-100/75 leading-relaxed">
                {faq.answer}
              </p>

              {/* Admin controls */}
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-5 flex gap-2"
                >
                  <motion.button
                    onClick={() => onEdit(faq)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 rounded-lg border-2 border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition dark:border-blue-500/20 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-950/40"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={handleDelete}
                    disabled={deleting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 rounded-lg border-2 border-red-200/50 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50 dark:border-red-500/20 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                    {deleting ? "..." : "Delete"}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const [faqs,      setFaqs]      = useState([]);
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatedFaqHeader isAdmin={isAdmin} onAddClick={() => { setShowAdd(true); setEditTarget(null); }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-col gap-4"
        >
          {/* Add form */}
          <AnimatePresence>
            {isAdmin && showAdd && (
              <FaqForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
            )}
          </AnimatePresence>

          {loading && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-sm text-slate-500 dark:text-blue-100/50 py-8 text-center"
            >
              ⏳ Loading FAQs...
            </motion.p>
          )}

          <AnimatePresence mode="popLayout">
            {!loading && faqs.map((faq, idx) => (
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
                  index={idx}
                  onEdit={(f) => { setEditTarget(f); setShowAdd(false); }}
                  onDelete={handleDelete}
                />
              )
            ))}
          </AnimatePresence>

          {!loading && faqs.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-slate-500 dark:text-blue-100/50 py-12"
            >
              No FAQs yet. Check back soon!
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </Container>
  );
}