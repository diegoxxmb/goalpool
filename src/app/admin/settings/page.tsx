import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { updateSettingsAction } from "@/app/admin/actions";

export const metadata = {
  title: "Admin Settings | GOALPOOL",
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

export default async function AdminSettingsPage({ searchParams }: { searchParams?: { success?: string } }) {
  await verifyAdmin();

  const supabase = await createClient();
  const { data: settingsData } = await supabase.from("settings").select("key, value");

  const settingMap = new Map<string, string>();
  (settingsData ?? []).forEach((setting: any) => {
    settingMap.set(setting.key, setting.value);
  });

  const defaultUsdRate = 587.4;
  const parsedUsdRate = Number(settingMap.get("usd_rate_bs"));
  const usdRate = parsedUsdRate > 0 ? parsedUsdRate : defaultUsdRate;
  const paymentBank = settingMap.get("payment_bank") ?? "Banco Pago Móvil";
  const paymentPhone = settingMap.get("payment_phone") ?? "";
  const paymentIdNumber = settingMap.get("payment_id_number") ?? "";
  const amountBs = 10 * usdRate;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-8 rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
          <div className="space-y-3">
            <div className="rounded-3xl bg-black/70 px-4 py-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">GOALPOOL</p>
              <h2 className="mt-2 text-2xl font-black">Admin Settings</h2>
              <p className="text-sm text-slate-300">Configure payment settings for Pago Móvil.</p>
            </div>
          </div>
          <AdminSidebar currentSection="/admin/settings" />
        </aside>

        <section className="space-y-8">
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Settings</p>
                <h1 className="text-3xl font-black">Payment configuration</h1>
              </div>
              <Badge>{searchParams?.success ? "Saved" : "Editable"}</Badge>
            </div>
            {searchParams?.success ? (
              <div className="rounded-3xl border border-[#00E676]/20 bg-[#00E676]/10 p-4 text-sm text-emerald-100">
                Configuración guardada correctamente.
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Resumen de inscripción</p>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <p><span className="font-semibold text-white">Precio inscripción:</span> $10</p>
                  <p><span className="font-semibold text-white">Tasa BCV:</span> Bs {usdRate.toFixed(2)}</p>
                  <p><span className="font-semibold text-white">Monto total:</span> Bs {amountBs.toFixed(2)}</p>
                </div>
              </div>

              <Card className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6">
                <CardHeader>
                  <CardTitle>Pago Móvil</CardTitle>
                  <CardDescription>Actualiza los datos que los usuarios verán en la página de pago.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={updateSettingsAction} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Tasa USD/BS</label>
                      <Input name="usd_rate_bs" type="number" min={1} step="0.01" defaultValue={usdRate.toFixed(2)} required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Banco</label>
                      <Input name="payment_bank" type="text" defaultValue={paymentBank} required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Teléfono</label>
                      <Input name="payment_phone" type="text" defaultValue={paymentPhone} required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Cédula / RIF</label>
                      <Input name="payment_id_number" type="text" defaultValue={paymentIdNumber} required />
                    </div>
                    <Button type="submit" variant="gold" className="w-full">Guardar configuración</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
