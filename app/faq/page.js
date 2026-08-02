"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import { FALLBACK_FAQS } from "@/components/faq/faqData";
import FaqHeader from "@/components/faq/FaqHeader";
import FaqList from "@/components/faq/FaqList";

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/faqs").then((response) => response.json()).catch(() => ({ faqs: [] })),
      fetch("/api/auth/me", { cache: "no-store" }).then((response) => response.json()).catch(() => null),
    ]).then(([faqData, meData]) => {
      setFaqs(faqData?.faqs?.length ? faqData.faqs : FALLBACK_FAQS);
      setIsAdmin(meData?.user?.role === "admin");
      setLoading(false);
    });
  }, []);

  const handleAdd = async (body) => {
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
  };

  const handleEdit = async (body) => {
    const res = await fetch(`/api/faqs/${editTarget._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ok) {
      setFaqs((prev) => prev.map((faq) => faq._id === editTarget._id ? data.faq : faq));
      setEditTarget(null);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
    if (res.ok) setFaqs((prev) => prev.filter((faq) => faq._id !== id));
  };

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <FaqHeader
          isAdmin={isAdmin}
          onAddClick={() => {
            setShowAdd(true);
            setEditTarget(null);
          }}
        />

        <FaqList
          faqs={faqs}
          loading={loading}
          isAdmin={isAdmin}
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
      </motion.div>
    </Container>
  );
}
