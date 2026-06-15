import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminTable } from "@/components/admin/admin-table";
import { AdminTimeline } from "@/components/admin/admin-timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  approvePaymentAction,
  rejectPaymentAction,
  promoteUserAction,
  updateSettingsAction,
  matchAction,
  approvePaymentReviewAction,
  rejectPaymentReviewAction,
} from "./actions";

export const metadata = {
  title: "Admin | GOALPOOL",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/dashboard");
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const [
    usersRes,
    paymentsRes,
    matchesRes,
    tournamentsRes,
    settingsRes,
    auditRes,
    totalUsersRes,
    approvedUsersRes,
    pendingPaymentsRes,
    revenueRes,
    openMatchesRes,
    closedMatchesRes,
    finishedMatchesRes,
    activeTournamentRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, alias, first_name, last_name, phone, email, payment_status, role, created_at").order("created_at", { ascending: false }).limit(12),
    supabase.from("payments").select("id, receipt_url, reference, bank, amount, user_id, status").order("created_at", { ascending: false }).limit(12),
    supabase.from("matches").select("id, home_team, away_team, status, predictions_open, start_at").order("start_at", { ascending: true }).limit(12),
    supabase.from("tournaments").select("id, name, status").order("created_at", { ascending: false }).limit(6),
    supabase.from("settings").select("key, value"),
    supabase.from("audit_logs").select("id, action, details, actor, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("payment_status", "approved"),
    supabase.from("payments").select("*", { count: "exact", head: true }).neq("status", "approved"),
    supabase.from("payments").select("amount").eq("status", "approved"),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("predictions_open", true),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("predictions_open", false),
    supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "finished"),
    supabase.from("tournaments").select("name").eq("status", "active").limit(1).single(),
  ]);

  const totalUsers = totalUsersRes.count ?? 0;
  const approvedUsers = approvedUsersRes.count ?? 0;
  const pendingPayments = pendingPaymentsRes.count ?? 0;
  const totalRevenue = revenueRes.data?.reduce((sum, row) => sum + Number(row.amount ?? 0), 0) ?? 0;
  const activeTournament = activeTournamentRes.data?.name ?? tournamentsRes.data?.[0]?.name ?? "N/A";
  const totalMatches = Number(matchesRes.count ?? 0);
  const openMatches = Number(openMatchesRes.count ?? 0);
  const closedMatches = Number(closedMatchesRes.count ?? 0);
  const finishedMatches = Number(finishedMatchesRes.count ?? 0);

  const userRows = usersRes.data ?? [];
  const paymentRows = paymentsRes.data ?? [];
  const matchRows = matchesRes.data ?? [];
  const tournaments = tournamentsRes.data ?? [];
  const settings = settingsRes.data ?? [];
  const auditLogs = auditRes.data ?? [];

  const settingMap = Object.fromEntries(settings.map((item) => [item.key, item.value]));

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
    <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
          <div className="space-y-3">
            <div className="rounded-3xl bg-black/70 px-4 py-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">GOALPOOL</p>
              <h2 className="mt-2 text-2xl font-black">Admin Panel</h2>
              <p className="text-sm text-slate-300">Predict • Compete • Win</p>
            </div>
          </div>
          <AdminSidebar currentSection="#dashboard" />
          <div className="rounded-3xl border border-white/10 bg-[#111111]/90 p-5">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Quick actions</p>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="gold" size="sm">Create match</Button>
              <Button variant="secondary" size="sm">New notification</Button>
            </div>
          </div>
        </aside>

        <section className="space-y-8">
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Dashboard</p>
                <h1 className="text-3xl font-black">Admin Overview</h1>
              </div>
              <div className="rounded-3xl bg-black/70 px-4 py-3 text-sm text-slate-300">Live system status: stable</div>
            </div>
            <p className="max-w-2xl text-slate-300">Visualiza los datos clave, gestiona usuarios y pagos, y controla torneos y partidos desde un solo lugar.</p>
          </div>

          <div id="dashboard" className="grid gap-4 xl:grid-cols-2">
            <AdminCard title="Registered Users" value={totalUsers} accent="green" details="Usuarios registrados en la plataforma." />
            <AdminCard title="Approved Users" value={approvedUsers} accent="green" details="Usuarios con pago aprobado." />
            <AdminCard title="Pending Payments" value={pendingPayments} accent="gold" details="Pagos que requieren revisión." />
            <AdminCard title="Total Revenue" value={`Bs ${totalRevenue.toLocaleString()}`} accent="gold" details="Ingresos aprobados hasta ahora." />
            <AdminCard title="Prize Pool" value={`Bs ${Math.round(totalRevenue * 0.5).toLocaleString()}`} accent="green" details="Mitad de los ingresos destinados al premio." />
            <AdminCard title="Active Tournament" value={activeTournament} accent="green" details="Torneo que está en curso." />
            <AdminCard title="Total Matches" value={totalMatches} accent="green" details="Partidos registrados en el sistema." />
            <AdminCard title="Open Matches" value={openMatches} accent="gold" details="Partidos abiertos para predicciones." />
            <AdminCard title="Closed Matches" value={closedMatches} accent="green" details="Partidos cerrados para nuevas predicciones." />
            <AdminCard title="Finished Matches" value={finishedMatches} accent="green" details="Partidos ya finalizados." />
          </div>

          <div id="users" className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Users</h2>
                <p className="text-sm text-slate-400">Gestiona perfiles, roles y pagos de los competidores.</p>
              </div>
              <Button variant="secondary" size="sm">Export CSV</Button>
            </div>
            <AdminTable
              headings={["Alias", "Full Name", "Phone", "Email", "Payment Status", "Role", "Created Date", "Actions"]}
              rows={userRows.map((user) => [
                user.alias,
                `${user.first_name} ${user.last_name}`,
                user.phone,
                user.email,
                <Badge className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200">{user.payment_status}</Badge>,
                user.role,
                new Date(user.created_at).toLocaleDateString(),
                <div className="flex flex-wrap gap-2">
                  <form action={approvePaymentAction} className="inline-block">
                    <input type="hidden" name="paymentId" value={user.id} />
                    <Button variant="gold" size="sm" type="submit">Approve Payment</Button>
                  </form>
                  <form action={rejectPaymentAction} className="inline-block">
                    <input type="hidden" name="paymentId" value={user.id} />
                    <Button variant="secondary" size="sm" type="submit">Reject Payment</Button>
                  </form>
                  <form action={promoteUserAction} className="inline-block">
                    <input type="hidden" name="userId" value={user.id} />
                    <Button variant="default" size="sm" type="submit">Promote Admin</Button>
                  </form>
                </div>,
              ])}
            />
          </div>

          <div id="payments" className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Payments</h2>
                <p className="text-sm text-slate-400">Revisa recibos y confirma transacciones.</p>
              </div>
              <Button variant="gold" size="sm">Sync payments</Button>
            </div>
            <AdminTable
              headings={["Receipt", "Reference", "Bank", "Amount", "User", "Status", "Actions"]}
              rows={paymentRows.map((payment) => [
                payment.receipt_url ? (
                  <img src={payment.receipt_url} alt="Receipt" className="h-12 w-20 rounded-2xl object-cover" />
                ) : (
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-400">No image</span>
                ),
                payment.reference,
                payment.bank,
                `Bs ${payment.amount?.toLocaleString()}`,
                payment.user_id,
                <Badge className={payment.status === "approved" ? "bg-[#00E676]/10 text-emerald-200" : "bg-[#F5C518]/10 text-[#F5C518]"}>{payment.status}</Badge>,
                <div className="flex flex-wrap gap-2">
                  <form action={approvePaymentAction}>
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <Button variant="default" size="sm" type="submit">Approve</Button>
                  </form>
                  <form action={rejectPaymentAction}>
                    <input type="hidden" name="paymentId" value={payment.id} />
                    <Button variant="secondary" size="sm" type="submit">Reject</Button>
                  </form>
                </div>,
              ])}
            />
          </div>

          <div id="matches" className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Matches</h2>
                <p className="text-sm text-slate-400">Crea, cierra y finaliza partidos desde aquí.</p>
              </div>
              <form action={matchAction} className="flex gap-3">
                <input type="hidden" name="action" value="create" />
                <input type="hidden" name="home_team" value="Team A" />
                <input type="hidden" name="away_team" value="Team B" />
                <input type="hidden" name="start_at" value={new Date().toISOString()} />
                <Button variant="gold" size="sm" type="submit">Create Match</Button>
              </form>
            </div>
            <AdminTable
              headings={["Match", "Status", "Predictions", "Start", "Actions"]}
              rows={matchRows.map((match) => [
                `${match.home_team} vs ${match.away_team}`,
                match.status,
                match.predictions_open ? "Open" : "Closed",
                formatVenezuelaDateTime(match.start_at),
                <div className="flex flex-wrap gap-2">
                  <form action={matchAction}>
                    <input type="hidden" name="action" value="finish" />
                    <input type="hidden" name="matchId" value={match.id} />
                    <Button variant="default" size="sm" type="submit">Finish</Button>
                  </form>
                  <form action={matchAction}>
                    <input type="hidden" name="action" value="close" />
                    <input type="hidden" name="matchId" value={match.id} />
                    <Button variant="secondary" size="sm" type="submit">Close</Button>
                  </form>
                  <form action={matchAction}>
                    <input type="hidden" name="action" value="delete" />
                    <input type="hidden" name="matchId" value={match.id} />
                    <Button variant="ghost" size="sm" type="submit">Delete</Button>
                  </form>
                </div>,
              ])}
            />
          </div>

          <div id="tournaments" className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">Tournaments</h2>
                  <p className="text-sm text-slate-400">Selecciona un torneo activo para administrar partidos y premios.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select className="h-12 rounded-2xl border border-white/10 bg-black/70 px-4 text-sm text-white outline-none focus:border-[#00E676]/60 focus:ring-2 focus:ring-[#00E676]/20">
                    {tournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                    ))}
                  </select>
                  <Button variant="default" size="sm">Manage tournament</Button>
                </div>
              </div>
            </div>
          </div>

          <div id="notifications" className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">Notifications</h2>
                  <p className="text-sm text-slate-400">Envía anuncios rápidos y alertas a usuarios del torneo.</p>
                </div>
                <Button variant="gold" size="sm">Create notification</Button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/50 p-5">
                  <p className="text-sm font-semibold text-white">System update</p>
                  <p className="mt-2 text-sm text-slate-300">Programada para mañana a las 18:00.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/50 p-5">
                  <p className="text-sm font-semibold text-white">Payment reminder</p>
                  <p className="mt-2 text-sm text-slate-300">Recordatorio enviado a usuarios con pagos pendientes.</p>
                </div>
              </div>
            </div>
          </div>

          <div id="settings" className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black">Settings</h2>
                  <p className="text-sm text-slate-400">Ajusta tarifas, pagos y tiempos de cierre.</p>
                </div>
                <Button variant="gold" size="sm">Save settings</Button>
              </div>
              <form action={updateSettingsAction} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Entry Fee
                  <Input name="entry_fee" type="text" defaultValue={settingMap.entry_fee ?? "Bs 100"} />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Prize Distribution
                  <Input name="prize_distribution" type="text" defaultValue={settingMap.prize_distribution ?? "60/25/15"} />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Payment Information
                  <Input name="payment_information" type="text" defaultValue={settingMap.payment_information ?? "Bank transfer details"} />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Prediction Closing Minutes
                  <Input name="prediction_closing_minutes" type="number" defaultValue={settingMap.prediction_closing_minutes ?? "30"} />
                </label>
              </form>
            </div>
          </div>

          <div id="audit" className="space-y-6">
            <AdminTimeline entries={auditLogs} />
          </div>
        </section>
      </div>
    </main>
  );
}
