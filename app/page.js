import Button from "@/components/Button";
import Container from "@/components/Container";
import SecondaryButton from "@/components/SecondaryButton";
import Link from "next/link";

export default function HomePage() {
  return (
    <Container>
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Nursing Care & Learning Platform
          </div>

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome to <span className="text-blue-700">Nursing</span>{" "}
            <span className="text-red-600">Nepal</span>
          </h1>

          <p className="mt-4 text-slate-600 leading-relaxed">
            Your trusted place for nursing knowledge, patient-care guidance, and professional growth.
            Explore health articles, nursing tips, and practical information designed for Nepal.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/blogs"
            >
              <Button>
                Explore Articles
              </Button>
            </Link>

            <Link
              href="/contact"
            >
              <SecondaryButton>
                Contact Us

              </SecondaryButton>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-700">What you’ll find here</div>

          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              Nursing care tips for patients and families
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
              Study support for nursing students
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              Basic health awareness and prevention guides
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
              Articles, FAQs, and community support
            </li>
          </ul>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-800">
              Our goal
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Improve healthcare awareness and nursing excellence across Nepal through simple, practical resources.
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
