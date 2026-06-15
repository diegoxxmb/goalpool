export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center">
      <div className="animate-pulse rounded-3xl border border-white/10 bg-slate-950/80 p-10 text-center shadow-2xl shadow-black/40">
        <p className="text-xl font-semibold">Cargando panel de administración...</p>
      </div>
    </div>
  );
}
