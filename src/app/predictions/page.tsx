import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { upsertPredictionAction } from "./actions";

export const metadata = {
  title: "Predictions | GOALPOOL",
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user } as const;
}

export default async function PredictionsPage({ searchParams }: { searchParams?: { success?: string; error?: string } }) {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase.from("profiles").select("payment_status").eq("id", user.id).single();
  const approved = profile?.payment_status === "approved";

  if (!approved) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Tu pago aún no ha sido aprobado</CardTitle>
              <CardDescription>Cuando el admin apruebe tu pago podrás hacer predicciones.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">Contacta al soporte si crees que hay un error.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const tournamentName = "FIFA World Cup 2026";
  const { data: tournament } = await supabase.from("tournaments").select("id").eq("name", tournamentName).single();
  const tournamentId = tournament?.id;

  const matchQuery = supabase.from("matches").select("id, home_team, away_team, status, starts_at, tournament_id").order("starts_at", { ascending: true });
  if (tournamentId) matchQuery.eq("tournament_id", tournamentId);
  const { data: matchesData } = await matchQuery;
  const matches = matchesData ?? [];

  const { data: predictionsData } = await supabase.from("predictions").select("match_id, predicted_home_score, predicted_away_score").eq("user_id", user.id);
  const predictionMap = new Map((predictionsData ?? []).map((p: any) => [p.match_id, p]));

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

  // Group matches by date (date-first grouping)
  const dateGroups = (matches as any[]).reduce((acc: Record<string, any[]>, match) => {
    const dateKey = new Intl.DateTimeFormat("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric", 
      timeZone: "America/Caracas" 
    }).format(new Date(match.starts_at));
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-6 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {searchParams?.success ? (
            <div className="rounded-3xl border border-[#00E676]/20 bg-[#00E676]/10 p-4 text-sm text-emerald-100">{searchParams.success}</div>
          ) : null}
          {searchParams?.error ? (
            <div className="rounded-3xl border border-rose-400/20 bg-rose-600/10 p-4 text-sm text-rose-200">{searchParams.error}</div>
          ) : null}

          {Object.entries(dateGroups).map(([date, dayMatches]) => (
            <section key={date} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/40">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{date}</h2>
                  <p className="text-sm text-slate-400">{dayMatches.length} matches</p>
                </div>
                <Badge>{dayMatches.length} fixtures</Badge>
              </div>

              <div className="grid gap-4">
                {dayMatches.map((match: any) => {
                  const pred = predictionMap.get(match.id) ?? null;
                  const locked = match.status !== "open";
                  return (
                    <div key={match.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold">{match.home_team} vs {match.away_team}</p>
                        <p className="text-sm text-slate-400">{formatVenezuelaDateTime(match.starts_at)}</p>
                        <p className="text-xs text-slate-500">Status: {match.status}</p>
                      </div>

                      <form action={upsertPredictionAction} className="flex flex-wrap items-center gap-3">
                        <input type="hidden" name="match_id" value={match.id} />
                        <div className="w-20">
                          <Input type="number" name="predicted_home_score" min={0} defaultValue={pred?.predicted_home_score ?? ""} disabled={locked} />
                        </div>
                        <div className="text-sm">—</div>
                        <div className="w-20">
                          <Input type="number" name="predicted_away_score" min={0} defaultValue={pred?.predicted_away_score ?? ""} disabled={locked} />
                        </div>
                        <div>
                          <Button variant="gold" size="sm" type="submit" disabled={locked}>
                            {locked ? "Locked" : "Save"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
