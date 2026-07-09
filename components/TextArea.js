import { cn } from "@/lib/utils";

export default function TextArea({ className = "", hasError, ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-h-30 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none",
        "dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white",
        "placeholder:text-slate-400 dark:placeholder:text-blue-100/30",
        "focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400",
        hasError && "border-red-400 focus:ring-red-300 dark:border-red-400/50",
        className
      )}
    />
  );
}