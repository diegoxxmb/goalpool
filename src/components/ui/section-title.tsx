import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  eyebrow?: string;
}

export function SectionTitle({
  title,
  description,
  eyebrow,
  className,
  ...props
}: SectionTitleProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300/90">
          {eyebrow}
        </p>
      ) : null}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
