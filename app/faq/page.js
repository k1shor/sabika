import Container from "@/components/Container";

const FAQS = [
  {
    q: "Is Nursing Nepal a hospital service?",
    a: "No. Nursing Nepal is an informational website. We provide educational content and general guidance.",
  },
  {
    q: "Can I request nursing topics to be added?",
    a: "Yes. You can contact us and suggest topics like wound care, injection safety, first aid, or patient nutrition.",
  },
  {
    q: "Is the information suitable for nursing students?",
    a: "Yes. We publish simplified nursing notes, care plans, and exam preparation content.",
  },
  {
    q: "Do you provide emergency medical support?",
    a: "No. For emergencies, please contact local hospitals or emergency services immediately.",
  },
];

export default function FaqPage() {
  return (
    <Container>
      <h1 className="text-3xl font-extrabold tracking-tight">FAQ</h1>
      <p className="mt-2 text-slate-600">
        Frequently asked questions about Nursing Nepal.
      </p>

      <div className="mt-6 grid gap-4">
        {FAQS.map((f) => (
          <div key={f.q} className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm">
            <div className="font-bold text-slate-900">{f.q}</div>
            <div className="mt-2 text-sm text-slate-600 leading-relaxed">{f.a}</div>
          </div>
        ))}
      </div>
    </Container>
  );
}
