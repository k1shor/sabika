"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function FaqForm({ initial, onSave, onCancel }) {
  const [question, setQuestion] = useState(initial?.question || "");
  const [answer, setAnswer] = useState(initial?.answer || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setErr("Both fields are required.");
      return;
    }
    setLoading(true);
    setErr("");
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
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Question"
        className="w-full rounded-xl border-2 border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-600 transition dark:border-blue-500/20 dark:bg-slate-950/50 dark:text-white"
      />
      <textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
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
