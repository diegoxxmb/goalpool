interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  details: string;
  created_at: string;
}

interface AdminTimelineProps {
  entries: AuditEntry[];
}

export function AdminTimeline({ entries }: AdminTimelineProps) {
  return (
    <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Audit Logs</p>
          <h3 className="text-2xl font-black text-white">Admin actions timeline</h3>
        </div>
      </div>
      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-3xl border border-white/10 bg-black/50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-white">{entry.action.replace(/_/g, " ")}</p>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">{new Date(entry.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{entry.details}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.35em] text-emerald-300/70">{entry.actor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
