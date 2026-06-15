import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Leaderboard | GOALPOOL",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rankings } = await supabase
    .from("ranking")
    .select("*")
    .order("position", { ascending: true });

  return (
    <>
      <main className="min-h-screen bg-[#0B0B0B] text-white px-4 py-6 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/40">
            <CardHeader>
              <CardTitle className="text-2xl font-black italic tracking-tighter">
                LEADER<span className="text-[#00E676]">BOARD</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!rankings || rankings.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  Todavía no hay participantes clasificados.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-500">
                        <th className="pb-4 pl-2 font-medium">#</th>
                        <th className="pb-4 font-medium">Participante</th>
                        <th className="pb-4 pr-2 text-right font-medium">Puntos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rankings.map((row: any) => {
                        const isCurrentUser = row.user_id === user.id;
                        const displayName =
                          row.alias && row.alias.trim().length > 0
                            ? row.alias
                            : row.email?.split("@")[0] ?? "Usuario";

                        return (
                          <tr 
                            key={row.user_id} 
                            className={`group transition-colors hover:bg-white/5 ${isCurrentUser ? 'bg-[#00E676]/5' : ''}`}
                          >
                            <td className={`py-4 pl-2 font-black ${isCurrentUser ? 'text-[#00E676]' : 'text-slate-500'}`}>
                              {row.position}
                            </td>
                            <td className={`py-4 font-bold ${isCurrentUser ? 'text-white' : 'text-slate-300'}`}>
                              {displayName}
                              {isCurrentUser && <span className="ml-2 text-[9px] uppercase tracking-tighter text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded">Tú</span>}
                            </td>
                            <td className="py-4 pr-2 text-right font-mono font-bold text-[#00E676]">
                              {row.total_points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
