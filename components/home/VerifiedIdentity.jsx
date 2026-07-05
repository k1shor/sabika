"use client";

import { motion } from "framer-motion";
import Container from "@/components/Container";
import CardGrid from "@/components/shared/CardGrid";
import IdentityOptionCard from "@/components/home/IdentityOptionCard";
import { IDENTITY_OPTIONS } from "@/components/home/homeData";

export default function VerifiedIdentity() {
  return (
    <section className="py-20 bg-linear-to-b from-blue-50/40 to-slate-50/30">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Verified identity, <span className="text-red-600">your choice</span> of voice
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            All contributors are verified — but you decide how you appear on each post.
          </p>
        </motion.div>

        <CardGrid
          items={IDENTITY_OPTIONS}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          renderItem={(option, index) => <IdentityOptionCard {...option} index={index} />}
        />
      </Container>
    </section>
  );
}
