"use client";

import { AnimatePresence, motion } from "framer-motion";
import FaqCard from "./FaqCard";
import FaqForm from "./FaqForm";

export default function FaqList({
  faqs,
  loading,
  isAdmin,
  showAdd,
  editTarget,
  onAdd,
  onCancelAdd,
  onEdit,
  onCancelEdit,
  onEditTarget,
  onDelete,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-8 flex flex-col gap-4"
    >
      <AnimatePresence>
        {isAdmin && showAdd && (
          <FaqForm onSave={onAdd} onCancel={onCancelAdd} />
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
        {!loading && faqs.map((faq, index) => (
          editTarget?._id === faq._id ? (
            <FaqForm
              key={faq._id}
              initial={faq}
              onSave={onEdit}
              onCancel={onCancelEdit}
            />
          ) : (
            <FaqCard
              key={faq._id}
              faq={faq}
              isAdmin={isAdmin}
              index={index}
              onEdit={onEditTarget}
              onDelete={onDelete}
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
  );
}
