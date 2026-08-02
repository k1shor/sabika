import { cn } from "@/lib/utils";

export default function Input({ className = "", hasError = false, ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 outline-none",
        "dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-white",
        "focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400",
        "placeholder:text-slate-400 dark:placeholder:text-blue-100/30",
        hasError && "border-red-400 focus:ring-red-300 dark:border-red-400/50",
        className
      )}
    />
  );
}