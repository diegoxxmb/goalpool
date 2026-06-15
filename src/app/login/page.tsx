import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export const metadata = {
  title: "Iniciar sesión | GOALPOOL",
};

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <div className="space-y-3 text-center">
          <Badge className="mx-auto">Iniciar sesión</Badge>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Accede a GOALPOOL
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-300">
            Ingresa con tu correo y contraseña para ver tu tablero, estado de pago y seguir prediciendo.
          </p>
        </div>

        <Card className="border border-white/10 bg-slate-950/90 shadow-xl shadow-emerald-500/10">
          <CardHeader>
            <CardTitle>Cuenta existente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            {searchParams.error ? (
              <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {searchParams.error}
              </div>
            ) : null}
            <form action={loginAction} className="grid gap-4">
              <label className="space-y-2 text-sm text-slate-300">
                Correo electrónico
                <Input name="email" type="email" required placeholder="usuario@mail.com" />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Contraseña
                <Input name="password" type="password" required placeholder="••••••••" />
              </label>
              <Button type="submit" size="lg" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
