import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 text-sm text-white shadow-sm shadow-black/10 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder:text-slate-500",
        className
      )}
      {...props}
    />
  );
}
