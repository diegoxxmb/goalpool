import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BottomNav } from "@/components/navigation/bottom-nav";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const APP_URL = process.env.APP_URL || "";

async function notifyAdminTelegramPayment({
  name,
  email,
  amountBs,
  bank,
  reference,
}: {
  name: string;
  email: string;
  amountBs: number;
  bank: string;
  reference: string;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID || !APP_URL) {
    return;
  }

  const appUrl = APP_URL.replace(/\/$/, "");
  const telegramLink = `${appUrl}/admin/payments`;
  const text = [
    "🟢 Nuevo pago pendiente GOALPOOL",
    "",
    `👤 Usuario: ${name}`,
    `📧 Email: ${email}`,
    `💵 Monto: Bs ${amountBs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `🏦 Banco: ${bank}`,
    `🔢 Referencia: ${reference}`,
    "",
    `Revisar y aprobar:`,
    telegramLink,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Telegram send failed: ${response.status} ${details}`);
  }
}

export const metadata = {
  title: "Paga tu inscripción | GOALPOOL",
};

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { supabase, user } as const;
}

export async function submitPaymentAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const bank = String(formData.get("bank") ?? "");
  const reference = String(formData.get("reference") ?? "");
  const receiptFile = formData.get("receipt") as File | null;

  if (!bank || !reference || !receiptFile) {
    redirect(`/payment?error=${encodeURIComponent("All fields are required")}`);
  }

  const { data: usdRateSetting } = await supabase.from("settings").select("value").eq("key", "usd_rate_bs").single();
  const defaultUsdRate = 587.4;
  const parsedUsdRate = Number(usdRateSetting?.value);
  const usdRate = parsedUsdRate > 0 ? parsedUsdRate : defaultUsdRate;
  const amountBs = 10 * usdRate;
  const userId = user.id;
  const timestamp = Date.now();
  const sanitizedFilename = receiptFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storagePath = `${userId}/${timestamp}-${sanitizedFilename}`;

  const { error: uploadError } = await supabase.storage.from("payment-receipts").upload(storagePath, receiptFile);
  if (uploadError) {
    redirect(`/payment?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await supabase.from("payments").insert({
    user_id: userId,
    bank,
    reference,
    amount: amountBs,
    receipt_url: storagePath,
    status: "pending",
  });

  if (insertError) {
    redirect(`/payment?error=${encodeURIComponent(insertError.message)}`);
  }

  const { data: userProfile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single();
  const userName = userProfile?.full_name ?? user.email ?? "Usuario desconocido";
  const userEmail = userProfile?.email ?? user.email ?? "sin-email@goalpool.com";

  try {
    await notifyAdminTelegramPayment({
      name: userName,
      email: userEmail,
      amountBs,
      bank,
      reference,
    });
  } catch (error) {
    console.error("Telegram notification failed", error);
  }

  redirect("/payment?success=payment_submitted");
}

export default async function PaymentPage({ searchParams }: { searchParams?: { success?: string; error?: string } }) {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: settingsData }, { data: pendingPayments }] = await Promise.all([
    supabase.from("profiles").select("payment_status").eq("id", user.id).single(),
    supabase.from("settings").select("key, value"),
    supabase.from("payments").select("id, status").eq("user_id", user.id).eq("status", "pending").limit(1),
  ]);

  const settings = new Map<string, string>();
  (settingsData ?? []).forEach((setting: any) => {
    settings.set(setting.key, setting.value);
  });

  const defaultUsdRate = 587.4;
  const rawUsdRate = Number(settings.get("usd_rate_bs"));
  const usdRate = rawUsdRate > 0 ? rawUsdRate : defaultUsdRate;
  const paymentBank = settings.get("payment_bank") ?? "Banco Pago Móvil";
  const paymentPhone = settings.get("payment_phone") ?? "";
  const paymentIdNumber = settings.get("payment_id_number") ?? "";
  const amountBs = 10 * usdRate;
  const approved = profile?.payment_status === "approved";
  const hasPending = (pendingPayments ?? []).length > 0;

  const formatBs = (value: number) => value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-white px-6 py-10 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-4xl gap-8">
        <section className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-emerald-500/10">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/80">Paga tu inscripción</p>
            <h1 className="text-3xl font-black text-white">Paga tu inscripción</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">
              Sigue el flujo de Pago Móvil para inscribirte en GOALPOOL. Completa los datos, sube tu comprobante y espera la aprobación.
            </p>
          </div>

          {searchParams?.success ? (
            <div className="rounded-3xl border border-[#00E676]/20 bg-[#00E676]/10 p-4 text-sm text-emerald-100">
              Pago enviado. Espera la revisión del comprobante.
            </div>
          ) : null}
          {searchParams?.error ? (
            <div className="rounded-3xl border border-rose-400/20 bg-rose-600/10 p-4 text-sm text-rose-200">
              {searchParams.error}
            </div>
          ) : null}

          {approved ? (
            <Card className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <CardHeader>
                <CardTitle>Pago aprobado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">Ya puedes participar en GOALPOOL.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href="/predictions" className="inline-flex">
                    <Button variant="gold">Ir a predicciones</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : hasPending ? (
            <Card className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <CardHeader>
                <CardTitle>Comprobante enviado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">Tu pago está pendiente de revisión.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Detalles de pago</p>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Entry fee: <span className="font-black">$10</span></p>
                    <p className="text-sm text-slate-300">Tasa del día: Bs {usdRate.toFixed(2)} por $1</p>
                    <p className="text-lg font-semibold">Monto a pagar: <span className="font-black">Bs {formatBs(amountBs)}</span></p>
                    <p className="text-sm text-slate-300">Método de pago: Pago Móvil</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-[1.75rem] border border-white/10 bg-black/40 p-5">
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Información de Pago Móvil</p>
                  <div className="space-y-2 text-sm text-slate-300">
                    <p><span className="font-semibold text-white">Banco:</span> {paymentBank}</p>
                    <p><span className="font-semibold text-white">Cédula / RIF:</span> {paymentIdNumber}</p>
                    <p><span className="font-semibold text-white">Teléfono:</span> {paymentPhone}</p>
                    <p><span className="font-semibold text-white">Tasa BCV:</span> Bs {usdRate.toFixed(2)}</p>
                    <p><span className="font-semibold text-white">Entrada:</span> $10</p>
                    <p><span className="font-semibold text-white">Monto a pagar:</span> Bs {formatBs(amountBs)}</p>
                  </div>
                </div>
              </div>

              <Card className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6">
                <CardHeader>
                  <CardTitle>Enviar comprobante</CardTitle>
                  <CardDescription>Sube tu comprobante de Pago Móvil para completar la inscripción.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={submitPaymentAction} encType="multipart/form-data" className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Banco</label>
                      <Input name="bank" type="text" placeholder="Nombre del banco" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Referencia</label>
                      <Input name="reference" type="text" placeholder="Número de referencia" required />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Comprobante</label>
                      <Input name="receipt" type="file" accept="image/*" required />
                    </div>
                    <Button type="submit" variant="gold" className="w-full">Enviar comprobante</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </div>
      </main>
      <BottomNav />
    </>
  );
}
