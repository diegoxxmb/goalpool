import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertPredictionAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const matchId = formData.get("match_id") as string;
  const rawHome = formData.get("predicted_home_score");
  const rawAway = formData.get("predicted_away_score");

  if (!matchId) {
    const message = "Missing match_id";
    console.error(message);
    redirect(`/predictions?error=${encodeURIComponent(message)}`);
  }

  const predictedHomeScore = Number(rawHome);
  const predictedAwayScore = Number(rawAway);

  console.log("upsertPredictionAction called", {
    matchId,
    rawHome,
    predictedHomeScore,
    rawAway,
    predictedAwayScore,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("upsertPredictionAction: no active user session");
    redirect("/login");
  }

  console.log("upsertPredictionAction user", user.id);

  const { error } = await supabase.rpc("upsert_prediction", {
    p_match_id: matchId,
    p_predicted_home_score: predictedHomeScore,
    p_predicted_away_score: predictedAwayScore,
  } as any);

  if (error) {
    console.error("RPC upsert_prediction error", error);
    try {
      revalidatePath("/predictions");
    } catch (e) {
      console.error("revalidatePath failed", e);
    }
    redirect(`/predictions?error=${encodeURIComponent(String(error.message ?? error))}`);
  }

  try {
    revalidatePath("/predictions");
  } catch (e) {
    console.error("revalidatePath failed", e);
  }

  redirect(`/predictions?success=${encodeURIComponent("prediction_saved")}`);
}
