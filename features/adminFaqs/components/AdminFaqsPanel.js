"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FaqList from "@/components/faq/FaqList";
import { FALLBACK_FAQS } from "@/components/faq/faqData";

export default function AdminFaqsPanel() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      if (data?.ok && data?.faqs) {
        setFaqs(data.faqs.length ? data.faqs : FALLBACK_FAQS);
      } else {
        setFaqs(FALLBACK_FAQS);
      }
    } catch {
      setFaqs(FALLBACK_FAQS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAdd = async (body) => {
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setFaqs((prev) => [...prev, data.faq]);
        setShowAdd(false);
      }
    } catch (err) {
      console.error("Failed to add FAQ:", err);
    }
  };

  const handleEdit = async (body) => {
    if (!editTarget?._id) return;
    try {
      const res = await fetch(`/api/faqs/${editTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        setFaqs((prev) =>
          prev.map((faq) => (faq._id === editTarget._id ? data.faq : faq))
        );
        setEditTarget(null);
      }
    } catch (err) {
      console.error("Failed to edit FAQ:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFaqs((prev) => prev.filter((faq) => faq._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manage FAQs
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-blue-100/60">
            Create, edit, or remove Frequently Asked Questions shown across the platform.
          </p>
        </div>

        <motion.button
          onClick={() => {
            setShowAdd((prev) => !prev);
            setEditTarget(null);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {showAdd ? "Close Form" : "Add New FAQ"}
        </motion.button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <FaqList
          faqs={faqs}
          loading={loading}
          isAdmin={true}
          showAdd={showAdd}
          editTarget={editTarget}
          onAdd={handleAdd}
          onCancelAdd={() => setShowAdd(false)}
          onEdit={handleEdit}
          onCancelEdit={() => setEditTarget(null)}
          onEditTarget={(faq) => {
            setEditTarget(faq);
            setShowAdd(false);
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
