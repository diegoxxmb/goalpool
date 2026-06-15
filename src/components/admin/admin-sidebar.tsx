import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "M3 3h18M3 12h18M3 21h18" },
  { href: "/predictions", label: "Predictions", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" },
  { href: "/admin/users", label: "Users", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
  { href: "/admin/payments", label: "Payments", icon: "M4 7h16M4 12h16M4 17h16" },
  { href: "/admin/matches", label: "Matches", icon: "M12 3v18M3 12h18" },
  { href: "/admin/tournaments", label: "Tournaments", icon: "M12 4l8 4-8 4-8-4 8-4zm0 8l8 4-8 4-8-4 8-4z" },
  { href: "/admin/notifications", label: "Notifications", icon: "M12 22c1.1 0 1.99-.9 1.99-2H10c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1 1v1h14v-1l-1-1z" },
  { href: "/admin/settings", label: "Settings", icon: "M12 8a4 4 0 100 8 4 4 0 000-8zm8.24 5.03l1.46 1.46-1.42 1.42-1.46-1.46A6.97 6.97 0 0112 18a6.97 6.97 0 01-5.82-2.55L4.72 17a1 1 0 01-1.42-1.42l1.46-1.46A6.97 6.97 0 014 12c0-.71.11-1.39.32-2.03L2.86 8.51A1 1 0 014.28 7.09l1.46 1.46A6.97 6.97 0 0112 6c.71 0 1.39.11 2.03.32L15.51 4.86a1 1 0 011.42 1.42l-1.46 1.46c.82.63 1.5 1.42 2 2.27zm-4.24 5.97a3 3 0 110-6 3 3 0 010 6z" },
  { href: "/admin/audit", label: "Audit Logs", icon: "M3 3l18 18M3 21V3h18v18H3z" },
];

interface AdminSidebarProps {
  currentSection?: string;
}

export function AdminSidebar({ currentSection }: AdminSidebarProps) {
  return (
    <nav className="space-y-4">
      {navItems.map((item) => {
        const active = item.href === currentSection;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
              active
                ? "bg-[#00E676]/10 text-white shadow-[0_10px_30px_-18px_rgba(0,230,118,0.5)]"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            )}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
