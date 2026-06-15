import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LivePrizeCardProps {
  participants: number;
  pot: number;
  entryFeeUsd: number;
  bcRate: number;
  amountBs: number;
  remainingMatches: number;
}

export function LivePrizeCard({ participants, pot, entryFeeUsd, bcRate, amountBs, remainingMatches }: LivePrizeCardProps) {
  return (
    <Card className="animate-glow overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Pot en vivo</CardTitle>
            <CardDescription>Participantes y premio acumulado en tiempo real.</CardDescription>
          </div>
          <Badge>En marcha</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="rounded-[1.75rem] bg-white/5 p-6 shadow-inner shadow-black/10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Bote actual</p>
          <p className="mt-4 text-4xl font-black text-emerald-300">Bs {pot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Participantes</p>
            <p className="mt-3 text-3xl font-black text-white">{participants.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Entrada</p>
            <p className="mt-3 text-3xl font-black text-white">${entryFeeUsd}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="space-y-3 text-sm text-slate-300">
        <div className="flex items-center justify-between gap-4">
          <span>Tasa BCV del día</span>
          <span className="font-semibold text-white">Bs {bcRate.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Monto a pagar</span>
          <span className="font-semibold text-white">Bs {amountBs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Partidos abiertos</span>
          <span className="font-semibold text-white">{remainingMatches}</span>
        </div>
        <p>50% del pago se destina al premio, el resto impulsa la experiencia en vivo.</p>
      </CardFooter>
    </Card>
  );
}
