import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  details?: string;
  accent?: "green" | "gold";
  children?: ReactNode;
}

const accentStyles: Record<NonNullable<AdminCardProps["accent"]>, string> = {
  green: "border-[#00E676]/20 bg-[#00E676]/10 text-white",
  gold: "border-[#F5C518]/20 bg-[#F5C518]/10 text-[#F5C518]",
};

export function AdminCard({ title, value, details, accent = "green", className, children, ...props }: AdminCardProps) {
  return (
    <div className={cn("rounded-[2rem] border p-6 shadow-xl shadow-black/20", accentStyles[accent], className)} {...props}>
      <p className="text-sm uppercase tracking-[0.32em] text-slate-400">{title}</p>
      <p className="mt-4 text-4xl font-black tracking-tight">{value}</p>
      {details ? <p className="mt-3 text-sm leading-6 text-slate-300">{details}</p> : null}
      {children}
    </div>
  );
}
