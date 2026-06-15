import Link from "next/link";
import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "gold";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[#00E676] text-black shadow-[0_25px_50px_-25px_rgba(0,230,118,0.65)] hover:bg-[#00e066] focus-visible:ring-2 focus-visible:ring-[#00E676]/70",
  secondary:
    "bg-white/10 text-white border border-white/10 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30",
  gold:
    "bg-[#F5C518] text-black shadow-[0_25px_50px_-25px_rgba(245,197,24,0.45)] hover:bg-[#f1bc17] focus-visible:ring-2 focus-visible:ring-[#F5C518]/70",
  ghost:
    "bg-transparent text-white/90 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#00E676]/70",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-5 text-sm md:text-base",
  lg: "h-14 px-6 text-base",
};

export function Button({
  className,
  variant = "default",
  size = "md",
  href,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {props.children}
      </Link>
    );
  }

  return <button className={classes} {...props} />;
}
