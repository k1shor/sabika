import { cn } from "@/lib/utils";

export default function TextArea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-h-30 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none",
        "focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400",
        "placeholder:text-slate-400",
        className
      )}
    />
  );
}
