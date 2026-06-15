import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/navigation/bottom-nav";

async function logoutAction() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export const metadata = {
  title: "Dashboard | GOALPOOL",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileRes, approvedUsersRes, usdRateRes, openMatchesRes, nextMatchRes, predictionCountRes, rankingRes] = await Promise.all([
    supabase.from("profiles").select("alias, first_name, last_name, payment_status, role, email").eq("id", user.id).single(),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("payment_status", "approved"),
    supabase.from("settings").select("value").eq("key", "usd_rate_bs").single(),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("matches").select("home_team, away_team, starts_at").eq("status", "open").order("starts_at", { ascending: true }).limit(1).single(),
    supabase.from("predictions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("ranking").select("position").eq("user_id", user.id).single(),
  ]);

  const profile = profileRes.data || { alias: null, first_name: null, last_name: null, payment_status: 'pending', role: 'player', email: user.email };
  const approvedUsers = approvedUsersRes.count ?? 0;
  const defaultUsdRate = 587.4;
  const parsedUsdRate = Number(usdRateRes.data?.value);
  const usdRate = parsedUsdRate > 0 ? parsedUsdRate : defaultUsdRate;

  const displayName = profile.alias || profile.email?.split("@")[0] || "Usuario";

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

  const entryFeeUsd = 10;
  const amountBs = entryFeeUsd * usdRate;
  const prizePool = approvedUsers * amountBs * 0.5;
  const openMatches = openMatchesRes.count ?? 0;
  const predictionCount = predictionCountRes.count ?? 0;
  const nextMatch = nextMatchRes.data;
  const approved = profile.payment_status === "approved";

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-white px-6 py-12 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-xl shadow-emerald-500/10">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Panel</p>
                <h1 className="text-3xl font-black text-white">Hola, {displayName}</h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300">
                  Tu panel personal de GOALPOOL. Sigue tu pago, predicciones y la próxima jornada aquí.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <form action={logoutAction} className="inline-flex">
                  <Button variant="secondary" size="sm" type="submit">
                    Cerrar sesión
                  </Button>
                </form>
                <a href={approved ? "/predictions" : "/payment"} className="inline-flex">
                  <Button variant="gold" size="sm">
                    {approved ? "Ir a predicciones" : "Completa tu inscripción"}
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Estado de pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Badge className={approved ? "bg-emerald-500/10 text-emerald-200" : "bg-amber-400/10 text-amber-200"}>
                      {profile.payment_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Bote de premios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-white">Bs {prizePool.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Participantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-white">{approvedUsers}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Predicciones enviadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-white">{predictionCount}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Próximo partido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-black text-white">
                    {nextMatch ? `${nextMatch.home_team} vs ${nextMatch.away_team}` : "Sin partidos abiertos"}
                  </p>
                  {nextMatch ? (
                    <p className="mt-2 text-sm text-slate-400">{formatVenezuelaDateTime(nextMatch.starts_at)}</p>
                  ) : null}
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Posición</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-white">{rankingRes.data?.position ? `#${rankingRes.data.position}` : "N/A"}</p>
                  <p className="mt-2 text-sm text-slate-400">Tu puesto actual en el ranking global.</p>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-none">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Tu progreso</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Revisa tu estado de pago y continúa con tus predicciones para subir en GOALPOOL.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href={approved ? "/predictions" : "/payment"}>
                    <Button variant="gold">Continuar</Button>
                  </a>
                  <a href="/profile">
                    <Button variant="secondary">Ver perfil</Button>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-xl shadow-emerald-500/10">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Insights</p>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Tu participación ayuda a construir el premio. Cada pago aprobado incrementa el bote.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-slate-300">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Siguiente paso</p>
              <p className="mt-4 text-base leading-7">
                {approved
                  ? "Completa tus predicciones y vuelve cada vez que haya un nuevo partido abierto."
                  : "Envía tu comprobante de pago y espera la aprobación para empezar a competir."}
              </p>
            </div>
          </aside>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
