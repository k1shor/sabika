import { cn } from "@/lib/utils";
export default function TextArea({ className = "", hasError, ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full min-h-30 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none",
        hasError && "border-red-400 focus:ring-red-300",
        className
      )}
    />
  );
}