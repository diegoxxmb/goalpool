import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTable } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { approvePaymentReviewAction, rejectPaymentReviewAction } from "@/app/admin/actions";

export const metadata = {
  title: "Payments | GOALPOOL Admin",
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

function formatPaymentStatus(status: string) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function statusBadgeClass(status: string) {
  if (status === "approved") return "bg-[#00E676]/10 text-emerald-200";
  if (status === "rejected") return "bg-rose-500/10 text-rose-200";
  return "bg-[#F5C518]/10 text-[#F5C518]";
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams?: { success?: string } }) {
  await verifyAdmin();

  const supabase = await createClient();
  const paymentsRes = await supabase
    .from("payments")
    .select("id, receipt_url, reference, bank, amount, user_id, status, created_at")
    .order("created_at", { ascending: false });

  const payments = paymentsRes.data ?? [];
  const userIds = Array.from(new Set(payments.map((payment) => payment.user_id).filter(Boolean)));
  const profilesRes = userIds.length
    ? await supabase.from("profiles").select("id, first_name, last_name, email").in("id", userIds)
    : { data: [] };

  const profiles = profilesRes.data ?? [];
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  const sortedPayments = [...payments].sort((a, b) => {
    if (a.status === b.status) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (a.status === "pending") return -1;
    if (b.status === "pending") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const receiptUrls = new Map(
    sortedPayments.map((payment) => {
      const url = payment.receipt_url ? supabase.storage.from("payment-receipts").getPublicUrl(payment.receipt_url).data.publicUrl : "";
      return [payment.id, url];
    })
  );

  const paymentsSummary = {
    total: sortedPayments.length,
    pending: sortedPayments.filter((payment) => payment.status === "pending").length,
    approved: sortedPayments.filter((payment) => payment.status === "approved").length,
    rejected: sortedPayments.filter((payment) => payment.status === "rejected").length,
  };

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
          <div className="space-y-3">
            <div className="rounded-3xl bg-black/70 px-4 py-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">GOALPOOL</p>
              <h2 className="mt-2 text-2xl font-black">Admin Payments</h2>
              <p className="text-sm text-slate-300">Aprueba o rechaza comprobantes de Pago Móvil.</p>
            </div>
          </div>
          <AdminSidebar currentSection="/admin/payments" />
        </aside>

        <section className="space-y-8">
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Payments</p>
                <h1 className="text-3xl font-black">Payment approvals</h1>
              </div>
              <Badge>{searchParams?.success ? "Updated" : "Review needed"}</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <CardHeader>
                  <CardTitle>Total Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-black text-white">{paymentsSummary.total}</p>
                </CardContent>
              </Card>
              <Card className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <CardHeader>
                  <CardTitle>Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-black text-[#F5C518]">{paymentsSummary.pending}</p>
                </CardContent>
              </Card>
              <Card className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <CardHeader>
                  <CardTitle>Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-black text-emerald-200">{paymentsSummary.approved}</p>
                </CardContent>
              </Card>
              <Card className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <CardHeader>
                  <CardTitle>Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-black text-rose-200">{paymentsSummary.rejected}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">All payments</h2>
                <p className="text-sm text-slate-400">Ordenadas por estado pendiente primero, luego por fecha.</p>
              </div>
            </div>

            <AdminTable
              headings={["User", "Email", "Amount", "Bank", "Reference", "Status", "Created", "Receipt", "Actions"]}
              rows={sortedPayments.map((payment) => {
                const profile = profileMap.get(payment.user_id ?? "") ?? { first_name: "Unknown", last_name: "", email: "-" };
                const displayName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown user";
                const receiptUrl = receiptUrls.get(payment.id) || "";
                const formattedDate = payment.created_at ? new Date(payment.created_at).toLocaleString() : "-";

                return [
                  displayName,
                  profile.email ?? "-",
                  `Bs ${Number(payment.amount ?? 0).toLocaleString()}`,
                  payment.bank ?? "-",
                  payment.reference ?? "-",
                  <Badge className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em] ${statusBadgeClass(payment.status ?? "pending")}`}>
                    {formatPaymentStatus(payment.status ?? "pending")}
                  </Badge>,
                  formattedDate,
                  receiptUrl ? (
                    <a href={receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-left text-sm text-emerald-200 hover:text-white">
                      <img src={receiptUrl} alt="Receipt preview" className="h-14 w-20 rounded-2xl object-cover" />
                      <span className="max-w-[8rem] truncate">View</span>
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">No receipt</span>
                  ),
                  <div className="flex flex-wrap gap-2">
                    <form action={approvePaymentReviewAction} className="inline-block">
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <Button variant="gold" size="sm" type="submit" disabled={payment.status === "approved"}>
                        Approve
                      </Button>
                    </form>
                    <form action={rejectPaymentReviewAction} className="inline-block">
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <Button variant="secondary" size="sm" type="submit" disabled={payment.status === "rejected"}>
                        Reject
                      </Button>
                    </form>
                  </div>,
                ];
              })}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
