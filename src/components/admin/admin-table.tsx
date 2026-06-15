import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminTableProps {
  headings: string[];
  rows: Array<ReactNode[]>;
}

export function AdminTable({ headings, rows }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-xl shadow-black/20">
      <table className="min-w-full border-separate border-spacing-0">
        <thead className="bg-slate-900/90">
          <tr>
            {headings.map((heading) => (
              <th key={heading} className="border-b border-white/10 px-5 py-4 text-left text-xs uppercase tracking-[0.35em] text-slate-400">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-slate-950/80" : "bg-slate-900/80"}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b border-white/10 px-5 py-4 text-sm text-slate-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
