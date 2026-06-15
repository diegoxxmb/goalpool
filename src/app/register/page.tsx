import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

async function registerAction(formData: FormData) {
  "use server";

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const alias = String(formData.get("alias") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        alias,
        phone,
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/payment");
}

export const metadata = {
  title: "Registrarse | GOALPOOL",
};

export default function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="space-y-3 text-center">
          <Badge className="mx-auto">Crear cuenta</Badge>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Bienvenido a GOALPOOL
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300">
            Regístrate para comenzar a predecir partidos, entrar en el ranking y ganar el premio en vivo.
          </p>
        </div>

        <Card className="border border-white/10 bg-slate-950/90 shadow-xl shadow-emerald-500/10">
          <CardHeader>
            <CardTitle>Registro</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            {searchParams.error ? (
              <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {searchParams.error}
              </div>
            ) : null}
            <form action={registerAction} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Nombre
                  <Input name="first_name" type="text" required placeholder="Juan" />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Apellido
                  <Input name="last_name" type="text" required placeholder="Pérez" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Alias
                  <Input name="alias" type="text" required placeholder="ElTactico" />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Teléfono
                  <Input name="phone" type="tel" required placeholder="+58 412 123 4567" />
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-300">
                Correo electrónico
                <Input name="email" type="email" required placeholder="usuario@mail.com" />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                Contraseña
                <Input name="password" type="password" required placeholder="••••••••" minLength={8} />
              </label>

              <Button type="submit" size="lg" className="w-full">
                Crear cuenta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
