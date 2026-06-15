import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  participants: number;
  pot: number;
  entryFeeUsd: number;
  bcRate: number;
  amountBs: number;
  remainingMatches: number;
}

export function HeroSection({ participants, pot, entryFeeUsd, bcRate, amountBs, remainingMatches }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.17),_transparent_45%),_linear-gradient(180deg,_rgba(0,0,0,0.95),_rgba(8,16,16,0.92))] p-8 sm:p-10 lg:p-12 shadow-[0_40px_120px_-50px_rgba(16,185,129,0.6)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(16,185,129,0.18),_transparent_15%),radial-gradient(circle_at_80%_80%,_rgba(255,255,255,0.08),_transparent_20%)] opacity-80" />
      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.8)]">
            <span className="text-xl">⚽</span>
            <span>Compite • Predice • Gana</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              GOALPOOL
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Compite con tus amigos, predice resultados y sube al ranking para ganar el premio final. Todo en un entorno deportivo con estilo negro, verde y dorado.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/register" size="lg" className="w-full sm:w-auto">
              Iniciar sesión
            </Button>
            <Button href="/register" variant="secondary" size="lg" className="w-full sm:w-auto">
              Registrarse
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Competidores</p>
              <p className="mt-3 text-3xl font-black text-white">{participants.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Premio</p>
              <p className="mt-3 text-3xl font-black text-white">Bs {pot.toLocaleString('es-VE')}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Partidos abiertos</p>
              <p className="mt-3 text-3xl font-black text-white">{remainingMatches}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/60 p-6 shadow-2xl shadow-black/40 sm:p-8">
          <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-emerald-300/15 bg-white/5 p-5 backdrop-blur-xl">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Bote actual</p>
                <p className="mt-3 text-3xl font-black text-white">Bs {pot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-200 shadow-[0_10px_30px_-20px_rgba(16,185,129,0.9)]">
                🏆
              </span>
            </div>

            <div className="grid gap-3 rounded-3xl bg-white/5 p-5">
              <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                <span>Entrada</span>
                <span className="font-semibold text-white">${entryFeeUsd}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                <span>Tasa BCV del día</span>
                <span className="font-semibold text-white">Bs {bcRate.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                <span>Monto a pagar</span>
                <span className="font-semibold text-white">Bs {amountBs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                <span>Partidos abiertos</span>
                <span className="font-semibold text-white">{remainingMatches}</span>
              </div>
            </div>

            <div className="rounded-3xl bg-emerald-500/10 p-5 text-slate-200">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-100/80">Competencia</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">Compite con tus amigos, predice resultados y sube al ranking para ganar el premio final.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
