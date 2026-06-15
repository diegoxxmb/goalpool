import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function logoutAction() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export const metadata = {
  title: "Profile | GOALPOOL",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileRes, predictionCountRes, nextMatchRes, rankingRes] = await Promise.all([
    supabase.from("profiles").select("alias, first_name, last_name, payment_status, role, email").eq("id", user.id).single(),
    supabase.from("predictions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("matches").select("home_team, away_team, starts_at").eq("status", "open").order("starts_at", { ascending: true }).limit(1).single(),
    supabase.from("ranking").select("position, total_points").eq("user_id", user.id).single(),
  ]);

  const profile = profileRes.data || { alias: null, first_name: null, last_name: null, payment_status: 'pending', role: 'player', email: user.email };
  const predictionCount = predictionCountRes.count ?? 0;
  const nextMatch = nextMatchRes.data;
  const ranking = rankingRes.data;

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

  return (
    <>
      <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-6 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Perfil</p>
                <h1 className="text-3xl font-black text-white">Hola, {displayName}</h1>
                <p className="mt-2 text-sm text-slate-400">
                  Revisa tu estado actual, predicciones y los próximos pasos para competir.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <form action={logoutAction} className="inline-flex">
                  <Button variant="secondary" size="sm" type="submit">
                    Cerrar sesión
                  </Button>
                </form>
                <a href="/predictions" className="inline-flex">
                  <Button variant="gold" size="sm">
                    Mis predicciones
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Alias</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-white truncate">{profile.alias || "-"}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-black text-white truncate max-w-full block break-all">{profile.email ?? "-"}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Estado de pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-white">{profile.payment_status ?? "-"}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 p-6 shadow-none border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base">Rol</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-white">{profile.role ?? "Jugador"}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                  <CardTitle className="text-base">Puntos y Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-black text-[#00E676]">{ranking?.total_points ?? 0} PTS</p>
                  <p className="mt-2 text-sm text-slate-400">Posición actual: <span className="text-white font-bold">#{ranking?.position ?? 'N/A'}</span></p>
                </CardContent>
              </Card>
            </div>
          </section>

          <aside className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-black/40">
            <div className="rounded-[2rem] border border-white/10 bg-black/40 p-6">
              <h2 className="text-lg font-black text-white">Resumen rápido</h2>
              <div className="mt-4 space-y-3 text-slate-300">
                <p>
                  <span className="font-semibold text-white">Siguiente partido:</span>{" "}
                  {nextMatch ? `${nextMatch.home_team} vs ${nextMatch.away_team}` : "Por determinar"}
                </p>
                {nextMatch ? (
                  <p className="text-sm text-slate-400">{formatVenezuelaDateTime(nextMatch.starts_at)}</p>
                ) : null}
                <p className="text-sm text-slate-400">
                  Actualiza tu comprobante si tu pago está pendiente y vuelve para seguir subiendo en el ranking.
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
              <h2 className="text-lg font-black text-white">Acciones</h2>
              <div className="grid gap-3">
                <a href="/payment" className="rounded-3xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Ver estado de pago
                </a>
                <a href="/predictions" className="rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20">
                  Continuar a predicciones
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
