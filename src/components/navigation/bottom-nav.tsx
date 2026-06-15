"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "🏠", title: "Home" },
  { href: "/predictions", label: "⚽", title: "Predictions" },
  { href: "/leaderboard", label: "🏆", title: "Leaderboard" },
  { href: "/profile", label: "👤", title: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 rounded-3xl border border-white/10 bg-slate-900/95 px-3 py-2 shadow-2xl shadow-black/40">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[60px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-[0.78rem] font-semibold transition ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-100 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-slate-400 hover:text-emerald-200"
              }`}
              aria-label={item.title}
            >
              <span className="text-xl">{item.label}</span>
              <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.26em] text-current">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
