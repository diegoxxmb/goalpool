import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { importWorldCupScheduleAction } from "../actions";

export const metadata = {
  title: "Matches | GOALPOOL Admin",
};

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
}

async function finishMatchAction(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const matchId = formData.get("matchId") as string;
  const homeScore = parseInt(formData.get("homeScore") as string);
  const awayScore = parseInt(formData.get("awayScore") as string);

  const { error } = await supabase.rpc("admin_finish_match", {
    match_id: matchId,
    home_score: homeScore,
    away_score: awayScore,
  });

  if (error) throw error;

  revalidatePath("/admin/matches");
  revalidatePath("/leaderboard");
}

export default async function AdminMatchesPage({ searchParams }: { searchParams?: { success?: string } }) {
  await verifyAdmin();

  const supabase = await createClient();
  const tournamentRes = await supabase.from("tournaments").select("id").eq("name", "FIFA World Cup 2026").single();
  const tournamentId = tournamentRes.data?.id;
  const matchQuery = supabase.from("matches").select("id, home_team, away_team, status, starts_at, tournament_id, home_score, away_score").order("starts_at", { ascending: true });

  if (tournamentId) {
    matchQuery.eq("tournament_id", tournamentId);
  }

  const matchRes = await matchQuery;
  const matches = matchRes.data ?? [];

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
      year: "numeric", month: "short", day: "numeric", 
      timeZone: "America/Caracas" 
    }).format(new Date(match.starts_at));
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, typeof matches>);

  const totalMatches = matches.length;
  const successCount = searchParams?.success;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
          <div className="space-y-3">
            <div className="rounded-3xl bg-black/70 px-4 py-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">GOALPOOL</p>
              <h2 className="mt-2 text-2xl font-black">Admin Matches</h2>
              <p className="text-sm text-slate-300">Import World Cup schedule and manage fixtures.</p>
            </div>
          </div>
          <AdminSidebar currentSection="/admin/matches" />
        </aside>

        <section className="space-y-8">
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Matches</p>
                <h1 className="text-3xl font-black">Match schedule</h1>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form action={importWorldCupScheduleAction} className="inline-block">
                  <Button variant="gold" size="md" type="submit">
                    Import World Cup 2026 Schedule
                  </Button>
                </form>
                <div className="rounded-3xl bg-black/70 px-4 py-3 text-sm text-slate-300">Total matches: {totalMatches}</div>
              </div>
            </div>
            {successCount ? (
              <div className="rounded-3xl border border-[#00E676]/20 bg-[#00E676]/10 p-4 text-sm text-emerald-100">
                Successfully inserted {successCount} match(es).
              </div>
            ) : null}
            {tournamentId ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Tournament</p>
                <p className="mt-2 text-lg font-semibold">FIFA World Cup 2026</p>
              </div>
            ) : null}
          </div>

          {Object.entries(dateGroups).map(([date, dayMatches]) => (
            <div key={date} className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/40">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{date}</h2>
                  <p className="text-sm text-slate-400">{dayMatches.length} matches</p>
                </div>
                <Badge>{dayMatches.length} fixtures</Badge>
              </div>
              <AdminTable
                headings={["Match", "Starts At", "Tournament", "Result & Action"]}
                rows={dayMatches.map((match) => [
                  `${match.home_team} vs ${match.away_team}`,
                  <span key={match.id}>{formatVenezuelaDateTime(match.starts_at)}</span>,
                  match.tournament_id ? "World Cup 2026" : "-",
                  match.status === "finished" ? (
                    <div className="flex items-center gap-3">
                      <span className="font-black text-[#00E676]">{match.home_score} - {match.away_score}</span>
                      <Badge variant="outline" className="text-[9px] uppercase border-emerald-500/30 text-emerald-500">Finalizado</Badge>
                    </div>
                  ) : (
                    <form action={finishMatchAction} className="flex items-center gap-2">
                      <input type="hidden" name="matchId" value={match.id} />
                      <div className="flex items-center gap-1">
                        <Input name="homeScore" type="number" className="h-7 w-10 bg-black/50 text-center border-white/10 p-0 text-xs" defaultValue={match.home_score ?? 0} required />
                        <span className="text-slate-600 text-[10px] font-bold">VS</span>
                        <Input name="awayScore" type="number" className="h-7 w-10 bg-black/50 text-center border-white/10 p-0 text-xs" defaultValue={match.away_score ?? 0} required />
                      </div>
                      <Button variant="gold" size="sm" type="submit" className="h-7 px-2 text-[9px] uppercase font-black tracking-tighter">
                        Finalizar
                      </Button>
                    </form>
                  )
                ])}
              />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
