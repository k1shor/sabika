import { cn } from "@/lib/utils";

export default function Button({ children, className = "", type = "button", disabled, onClick }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer",
        "bg-linear-to-r from-blue-700 to-blue-500 text-white shadow-sm",
        "hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
