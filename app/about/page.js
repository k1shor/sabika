import Container from "@/components/Container";
import Link from "next/link";

export default function AboutPage() {
  return (
    <Container>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/25">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100/80">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          About Nursing Nepal
        </div>

        <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Nursing Nepal — Care, Education & Guidance
        </h1>

        <p className="mt-4 text-slate-600 leading-relaxed dark:text-blue-100/75">
          Nursing Nepal is a digital platform built to support{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            nursing students, healthcare professionals, and families
          </span>{" "}
          by providing simplified nursing knowledge, practical patient-care guidance,
          and health awareness resources in a clear and accessible way.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-blue-400/20 dark:bg-blue-950/30">
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              For Nursing Students
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">
              Study-friendly notes, nursing concepts, exam guidance, and structured topics to help you
              build strong clinical understanding with confidence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-blue-400/20 dark:bg-blue-950/30">
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              For Nurses & Professionals
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">
              Improve patient safety and quality care through nursing protocols, documentation tips,
              monitoring guidance, and clinical best practices.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-blue-400/20 dark:bg-blue-950/30">
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">
              For Families & Caregivers
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">
              Simple home-care knowledge for recovery support, hygiene care, nutrition awareness,
              medication routines, and recognizing warning signs early.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-blue-400/20 dark:bg-blue-950/30">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Our Mission
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">
              To make nursing education and patient-care guidance more accessible, practical, and
              easy to understand for everyone in Nepal — from learners to working professionals and families.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-blue-400/20 dark:bg-blue-950/30">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Our Vision
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-blue-100/75">
              To grow into Nepal’s trusted nursing knowledge hub that encourages quality care,
              continuous learning, and a stronger healthcare community through digital support.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-blue-400/20 dark:bg-blue-950/30">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            What You’ll Find on Nursing Nepal
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-blue-400/20 dark:bg-slate-950/40">
              <div className="font-bold text-slate-900 dark:text-white">
                Nursing Articles & Notes
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-blue-100/75">
                Simple explanations, key points, and learning resources.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-blue-400/20 dark:bg-slate-950/40">
              <div className="font-bold text-slate-900 dark:text-white">
                Patient Care Guidance
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-blue-100/75">
                Daily care tips, monitoring, hygiene, nutrition, and safety practices.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-blue-400/20 dark:bg-slate-950/40">
              <div className="font-bold text-slate-900 dark:text-white">
                FAQs for Quick Answers
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-blue-100/75">
                Short, direct answers to common nursing and health questions.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-blue-400/20 dark:bg-slate-950/40">
              <div className="font-bold text-slate-900 dark:text-white">
                Learning Support & Tools
              </div>
              <div className="mt-1 text-sm text-slate-600 dark:text-blue-100/75">
                Study materials, reference points, and organized categories.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-600 to-red-500 p-6 text-white shadow-sm">
          <div>
            <div className="text-lg font-extrabold">Want to suggest a topic?</div>
            <div className="mt-1 text-sm text-white/90">
              Tell us what nursing topics you want next — wound care, injection safety, first aid,
              pediatric nursing, mental health, nutrition, and more.
            </div>
          </div>

          <Link
            href="/contact"
            className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm
            ring-1 ring-white/30 hover:brightness-110 hover:ring-white/50
            active:scale-[0.98] transition"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-6 text-xs text-slate-500 dark:text-blue-100/60">
          Disclaimer: Nursing Nepal provides educational and informational content only. It is not a
          substitute for professional medical diagnosis or treatment.
        </div>
      </div>
    </Container>
  );
}

