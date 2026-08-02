"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FaqCard({ faq, isAdmin, onEdit, onDelete, index }) {
  const [open, setOpen] = useState(false);
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
        onClick={() => setOpen((state) => !state)}
        whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.02)" }}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="font-bold text-slate-900 dark:text-white text-lg">{faq.question}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-blue-600 dark:text-blue-400"
        >
          <polyline points="6 9 12 15 18 9" />
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
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
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
