import { Card } from "@/components/ui/card";

interface UpcomingMatch {
  id: string;
  home_team: string;
  away_team: string;
  starts_at: string;
  tournament_id: string | null;
}

interface UpcomingMatchesProps {
  matches: UpcomingMatch[];
}

function getMatchPhase(match: UpcomingMatch) {
  if (match.tournament_id) {
    return "Fase Mundial";
  }
  return "Próximo partido";
}

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  function formatVenezuelaDateTime(value: string | Date) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Caracas",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(value)) + " VET";
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Próximos partidos</p>
        <h2 className="text-3xl font-black text-white">Compite con tus predicciones en la jornada</h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Visualiza los encuentros abiertos y llega primero en el ranking con cada resultado.
        </p>
      </div>

      {matches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {matches.map((match) => {
            const formattedDate = formatVenezuelaDateTime(match.starts_at);
            return (
              <Card key={match.id} className="group overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20">
                <div className="space-y-4 rounded-[2rem] bg-slate-950/90 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/80">{getMatchPhase(match)}</p>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {formattedDate.split(',')[0]}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-white">{match.home_team} vs {match.away_team}</h3>
                    <p className="text-sm leading-6 text-slate-400">{formattedDate}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 text-center text-slate-300">
          Aún no hay partidos cargados.
        </div>
      )}
    </section>
  );
}
