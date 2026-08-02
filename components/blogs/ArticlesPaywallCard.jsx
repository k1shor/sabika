import Link from "next/link";
import Button from "@/components/Button";

export default function ArticlesPaywallCard() {
  return (
    <div className="md:col-span-2 rounded-3xl border border-blue-200 bg-blue-50/60 p-8 text-center dark:border-blue-400/20 dark:bg-blue-950/30">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
        Continue reading trusted nursing content
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-blue-100/75">
        by creating a free account or signing in. Unlock articles from NursingNepal and other verified contributors.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link href="/register"><Button>Create account</Button></Link>
        <Link
          href="/login"
          className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-extrabold text-blue-700 transition hover:bg-blue-50 dark:border-blue-400/30 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-950/30"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}