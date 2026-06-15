import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function approvePaymentAction(formData: FormData) {
  "use server";

  const paymentId = String(formData.get("paymentId"));
  const supabase = await createClient();

  await supabase.from("payments").update({ status: "approved" }).eq("id", paymentId);
  await supabase.from("audit_logs").insert({ action: "approve_payment", details: `Payment ${paymentId} approved`, actor: "admin" });

  redirect("/admin#payments");
}

export async function rejectPaymentAction(formData: FormData) {
  "use server";

  const paymentId = String(formData.get("paymentId"));
  const supabase = await createClient();

  await supabase.from("payments").update({ status: "rejected" }).eq("id", paymentId);
  await supabase.from("audit_logs").insert({ action: "reject_payment", details: `Payment ${paymentId} rejected`, actor: "admin" });

  redirect("/admin#payments");
}

export async function approvePaymentReviewAction(formData: FormData) {
  "use server";

  const paymentId = String(formData.get("paymentId"));
  if (!paymentId) throw new Error("Missing payment ID");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_payment", {
    payment_id: paymentId,
    approved: true,
    rejection_reason: null,
  });

  if (error) throw new Error(error.message);
  await supabase.from("audit_logs").insert({ action: "admin_review_payment", details: `Payment ${paymentId} approved`, actor: "admin" });

  redirect("/admin/payments?success=payment_approved");
}

export async function rejectPaymentReviewAction(formData: FormData) {
  "use server";

  const paymentId = String(formData.get("paymentId"));
  if (!paymentId) throw new Error("Missing payment ID");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_payment", {
    payment_id: paymentId,
    approved: false,
    rejection_reason: "Pago rechazado",
  });

  if (error) throw new Error(error.message);
  await supabase.from("audit_logs").insert({ action: "admin_review_payment", details: `Payment ${paymentId} rejected`, actor: "admin" });

  redirect("/admin/payments?success=payment_rejected");
}

export async function promoteUserAction(formData: FormData) {
  "use server";

  const userId = String(formData.get("userId"));
  const supabase = await createClient();

  await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);
  await supabase.from("audit_logs").insert({ action: "promote_user", details: `User ${userId} promoted to admin`, actor: "admin" });

  redirect("/admin#users");
}

  const START_DATE = "2026-06-15"; // YYYY-MM-DD - import only matches on/after this date
export async function updateSettingsAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const entries = [
    "usd_rate_bs",
    "payment_bank",
    "payment_phone",
    "payment_id_number",
  ];

  for (const key of entries) {
    const value = String(formData.get(key) ?? "");
    await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
  }

  await supabase.from("audit_logs").insert({ action: "update_settings", details: "Admin updated payment settings", actor: "admin" });
  redirect("/admin/settings?success=settings_saved");
}

export async function importWorldCupScheduleAction(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const tournamentName = "FIFA World Cup 2026";

  const { data: existingTournament } = await supabase.from("tournaments").select("id").eq("name", tournamentName).single();
  let tournamentId = existingTournament?.id;

  if (!tournamentId) {
    const { data: createdTournament, error: tournamentError } = await supabase
      .from("tournaments")
      .insert({ name: tournamentName })
      .select("id")
      .single();

    if (tournamentError || !createdTournament) {
      throw new Error(tournamentError?.message || "Unable to create tournament.");
    }

    tournamentId = createdTournament.id;
  }

  // Delete existing matches for this tournament before re-inserting
  await supabase.from("matches").delete().eq("tournament_id", tournamentId);

  // Fixed, ordered group-stage schedule (only matches >= START_DATE will be inserted)
  const fixedGroupSchedule: Array<{ home_team: string; away_team: string; starts_at: string }> = [
    { home_team: "Spain", away_team: "Cape Verde", starts_at: "2026-06-15T12:00:00.000Z" },
    { home_team: "Belgium", away_team: "Egypt", starts_at: "2026-06-15T15:00:00.000Z" },
    { home_team: "Saudi Arabia", away_team: "Uruguay", starts_at: "2026-06-15T18:00:00.000Z" },
    { home_team: "Iran", away_team: "New Zealand", starts_at: "2026-06-15T21:00:00.000Z" },
    { home_team: "France", away_team: "Senegal", starts_at: "2026-06-16T12:00:00.000Z" },
    { home_team: "Iraq", away_team: "Norway", starts_at: "2026-06-16T15:00:00.000Z" },
    { home_team: "Argentina", away_team: "Algeria", starts_at: "2026-06-16T18:00:00.000Z" },
    { home_team: "Austria", away_team: "Jordan", starts_at: "2026-06-16T21:00:00.000Z" },
    { home_team: "Brazil", away_team: "Morocco", starts_at: "2026-06-17T12:00:00.000Z" },
    { home_team: "Haiti", away_team: "Scotland", starts_at: "2026-06-17T15:00:00.000Z" },
    { home_team: "Canada", away_team: "Bosnia and Herzegovina", starts_at: "2026-06-17T18:00:00.000Z" },
    { home_team: "Qatar", away_team: "Switzerland", starts_at: "2026-06-17T21:00:00.000Z" },
    { home_team: "Mexico", away_team: "South Africa", starts_at: "2026-06-18T12:00:00.000Z" },
    { home_team: "South Korea", away_team: "Czechia", starts_at: "2026-06-18T15:00:00.000Z" },
    { home_team: "United States", away_team: "Paraguay", starts_at: "2026-06-18T18:00:00.000Z" },
    { home_team: "Australia", away_team: "Turkey", starts_at: "2026-06-18T21:00:00.000Z" },
    { home_team: "Germany", away_team: "Curacao", starts_at: "2026-06-19T12:00:00.000Z" },
    { home_team: "Ivory Coast", away_team: "Ecuador", starts_at: "2026-06-19T15:00:00.000Z" },
    { home_team: "Netherlands", away_team: "Japan", starts_at: "2026-06-19T18:00:00.000Z" },
    { home_team: "Sweden", away_team: "Tunisia", starts_at: "2026-06-19T21:00:00.000Z" },
    { home_team: "Portugal", away_team: "DR Congo", starts_at: "2026-06-20T12:00:00.000Z" },
    { home_team: "Uzbekistan", away_team: "Colombia", starts_at: "2026-06-20T15:00:00.000Z" },
    { home_team: "England", away_team: "Croatia", starts_at: "2026-06-20T18:00:00.000Z" },
    { home_team: "Ghana", away_team: "Panama", starts_at: "2026-06-20T21:00:00.000Z" },
    { home_team: "Mexico", away_team: "South Korea", starts_at: "2026-06-21T12:00:00.000Z" },
    { home_team: "South Africa", away_team: "Czechia", starts_at: "2026-06-21T15:00:00.000Z" },
    { home_team: "Canada", away_team: "Qatar", starts_at: "2026-06-21T18:00:00.000Z" },
    { home_team: "Bosnia and Herzegovina", away_team: "Switzerland", starts_at: "2026-06-21T21:00:00.000Z" },
    { home_team: "Brazil", away_team: "Haiti", starts_at: "2026-06-22T12:00:00.000Z" },
    { home_team: "Morocco", away_team: "Scotland", starts_at: "2026-06-22T15:00:00.000Z" },
    { home_team: "United States", away_team: "Australia", starts_at: "2026-06-22T18:00:00.000Z" },
    { home_team: "Paraguay", away_team: "Turkey", starts_at: "2026-06-22T21:00:00.000Z" },
    { home_team: "Germany", away_team: "Ivory Coast", starts_at: "2026-06-23T12:00:00.000Z" },
    { home_team: "Curacao", away_team: "Ecuador", starts_at: "2026-06-23T15:00:00.000Z" },
    { home_team: "Netherlands", away_team: "Sweden", starts_at: "2026-06-23T18:00:00.000Z" },
    { home_team: "Japan", away_team: "Tunisia", starts_at: "2026-06-23T21:00:00.000Z" },
    { home_team: "Portugal", away_team: "Uzbekistan", starts_at: "2026-06-24T12:00:00.000Z" },
    { home_team: "DR Congo", away_team: "Colombia", starts_at: "2026-06-24T15:00:00.000Z" },
    { home_team: "England", away_team: "Ghana", starts_at: "2026-06-24T18:00:00.000Z" },
    { home_team: "Croatia", away_team: "Panama", starts_at: "2026-06-24T21:00:00.000Z" },
    { home_team: "Spain", away_team: "Saudi Arabia", starts_at: "2026-06-25T12:00:00.000Z" },
    { home_team: "Cape Verde", away_team: "Uruguay", starts_at: "2026-06-25T15:00:00.000Z" },
    { home_team: "Belgium", away_team: "Iran", starts_at: "2026-06-25T18:00:00.000Z" },
    { home_team: "Egypt", away_team: "New Zealand", starts_at: "2026-06-25T21:00:00.000Z" },
    { home_team: "France", away_team: "Iraq", starts_at: "2026-06-26T12:00:00.000Z" },
    { home_team: "Senegal", away_team: "Norway", starts_at: "2026-06-26T15:00:00.000Z" },
    { home_team: "Argentina", away_team: "Austria", starts_at: "2026-06-26T18:00:00.000Z" },
    { home_team: "Algeria", away_team: "Jordan", starts_at: "2026-06-26T21:00:00.000Z" },
    { home_team: "Brazil", away_team: "Scotland", starts_at: "2026-06-27T12:00:00.000Z" },
    { home_team: "Morocco", away_team: "Haiti", starts_at: "2026-06-27T15:00:00.000Z" },
    { home_team: "Canada", away_team: "Switzerland", starts_at: "2026-06-27T18:00:00.000Z" },
    { home_team: "Bosnia and Herzegovina", away_team: "Qatar", starts_at: "2026-06-27T21:00:00.000Z" },
    { home_team: "Mexico", away_team: "Czechia", starts_at: "2026-06-28T12:00:00.000Z" },
    { home_team: "South Africa", away_team: "South Korea", starts_at: "2026-06-28T15:00:00.000Z" },
    { home_team: "United States", away_team: "Turkey", starts_at: "2026-06-28T18:00:00.000Z" },
    { home_team: "Paraguay", away_team: "Australia", starts_at: "2026-06-28T21:00:00.000Z" },
    { home_team: "Germany", away_team: "Ecuador", starts_at: "2026-06-29T12:00:00.000Z" },
    { home_team: "Curacao", away_team: "Ivory Coast", starts_at: "2026-06-29T15:00:00.000Z" },
    { home_team: "Netherlands", away_team: "Tunisia", starts_at: "2026-06-29T18:00:00.000Z" },
    { home_team: "Japan", away_team: "Sweden", starts_at: "2026-06-29T21:00:00.000Z" },
    { home_team: "Portugal", away_team: "Colombia", starts_at: "2026-06-30T12:00:00.000Z" },
    { home_team: "DR Congo", away_team: "Uzbekistan", starts_at: "2026-06-30T15:00:00.000Z" },
    { home_team: "England", away_team: "Panama", starts_at: "2026-06-30T18:00:00.000Z" },
    { home_team: "Croatia", away_team: "Ghana", starts_at: "2026-06-30T21:00:00.000Z" },
    { home_team: "Spain", away_team: "Uruguay", starts_at: "2026-07-01T12:00:00.000Z" },
    { home_team: "Saudi Arabia", away_team: "Cape Verde", starts_at: "2026-07-01T15:00:00.000Z" },
    { home_team: "Belgium", away_team: "New Zealand", starts_at: "2026-07-01T18:00:00.000Z" },
    { home_team: "Iran", away_team: "Egypt", starts_at: "2026-07-01T21:00:00.000Z" },
    { home_team: "France", away_team: "Jordan", starts_at: "2026-07-02T12:00:00.000Z" },
    { home_team: "Senegal", away_team: "Argentina", starts_at: "2026-07-02T15:00:00.000Z" },
    { home_team: "Iraq", away_team: "Algeria", starts_at: "2026-07-02T18:00:00.000Z" },
    { home_team: "Norway", away_team: "Austria", starts_at: "2026-07-02T21:00:00.000Z" },
    { home_team: "Brazil", away_team: "Colombia", starts_at: "2026-07-03T12:00:00.000Z" },
    { home_team: "Morocco", away_team: "Canada", starts_at: "2026-07-03T15:00:00.000Z" },
    { home_team: "Haiti", away_team: "Switzerland", starts_at: "2026-07-03T18:00:00.000Z" },
    { home_team: "Scotland", away_team: "Qatar", starts_at: "2026-07-03T21:00:00.000Z" },
    { home_team: "Mexico", away_team: "Turkey", starts_at: "2026-07-04T12:00:00.000Z" },
    { home_team: "South Africa", away_team: "Australia", starts_at: "2026-07-04T15:00:00.000Z" },
    { home_team: "South Korea", away_team: "Paraguay", starts_at: "2026-07-04T18:00:00.000Z" },
    { home_team: "Czechia", away_team: "United States", starts_at: "2026-07-04T21:00:00.000Z" },
  ];

  // Only keep matches on or after START_DATE
  const startBoundary = new Date(`${START_DATE}T00:00:00.000Z`);
  const groupMatches = fixedGroupSchedule.filter((m) => new Date(m.starts_at) >= startBoundary);

  // Sort by starts_at ascending (defensive)
  groupMatches.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  // Build knockout placeholders starting the day after the last group match
  const lastGroupDate = groupMatches.length ? new Date(groupMatches[groupMatches.length - 1].starts_at) : startBoundary;
  const knockoutStart = new Date(lastGroupDate.getTime() + 24 * 60 * 60 * 1000);
  const knockoutSlots = [12, 15, 18, 21];

  const knockoutPlaceholders: Array<{ home_team: string; away_team: string; starts_at: string }> = [];
  // Round of 32 (16 matches)
  for (let i = 0; i < 16; i++) {
    const dayOffset = Math.floor(i / knockoutSlots.length);
    const hour = knockoutSlots[i % knockoutSlots.length];
    const dt = new Date(knockoutStart);
    dt.setDate(knockoutStart.getDate() + dayOffset);
    dt.setHours(hour, 0, 0, 0);
    knockoutPlaceholders.push({ home_team: `Winner Group ${String.fromCharCode(65 + i)}`, away_team: `Runner-up Group ${String.fromCharCode(65 + i)}`, starts_at: dt.toISOString() });
  }

  // Further knockout placeholders (Round of 16, QF, SF, 3rd, Final) - spaced after R32
  let offsetIndex = 16;
  // Round of 16 (8)
  for (let i = 0; i < 8; i++, offsetIndex++) {
    const dayOffset = Math.floor(offsetIndex / knockoutSlots.length) + 2; // add small gap
    const hour = knockoutSlots[offsetIndex % knockoutSlots.length];
    const dt = new Date(knockoutStart);
    dt.setDate(knockoutStart.getDate() + dayOffset);
    dt.setHours(hour, 0, 0, 0);
    knockoutPlaceholders.push({ home_team: `Winner Match ${73 + i * 2}`, away_team: `Winner Match ${74 + i * 2}`, starts_at: dt.toISOString() });
  }

  // Quarterfinals (4)
  for (let i = 0; i < 4; i++, offsetIndex++) {
    const dayOffset = Math.floor(offsetIndex / knockoutSlots.length) + 4;
    const hour = knockoutSlots[offsetIndex % knockoutSlots.length];
    const dt = new Date(knockoutStart);
    dt.setDate(knockoutStart.getDate() + dayOffset);
    dt.setHours(hour, 0, 0, 0);
    knockoutPlaceholders.push({ home_team: `Winner Match ${89 + i * 2}`, away_team: `Winner Match ${90 + i * 2}`, starts_at: dt.toISOString() });
  }

  // Semifinals (2)
  for (let i = 0; i < 2; i++, offsetIndex++) {
    const dayOffset = Math.floor(offsetIndex / knockoutSlots.length) + 6;
    const hour = knockoutSlots[offsetIndex % knockoutSlots.length];
    const dt = new Date(knockoutStart);
    dt.setDate(knockoutStart.getDate() + dayOffset);
    dt.setHours(hour, 0, 0, 0);
    knockoutPlaceholders.push({ home_team: `Winner Match ${97 + i * 2}`, away_team: `Winner Match ${98 + i * 2}`, starts_at: dt.toISOString() });
  }

  // Third place and Final
  const thirdPlace = new Date(knockoutStart);
  thirdPlace.setDate(knockoutStart.getDate() + 9);
  thirdPlace.setHours(18, 0, 0, 0);
  const final = new Date(knockoutStart);
  final.setDate(knockoutStart.getDate() + 9);
  final.setHours(21, 0, 0, 0);
  knockoutPlaceholders.push({ home_team: "Loser Semi 1", away_team: "Loser Semi 2", starts_at: thirdPlace.toISOString() });
  knockoutPlaceholders.push({ home_team: "Winner Semi 1", away_team: "Winner Semi 2", starts_at: final.toISOString() });

  const fullSchedule = [...groupMatches, ...knockoutPlaceholders].map((m) => ({ ...m, status: "open", tournament_id: tournamentId }));

  if (fullSchedule.length > 0) {
    const { error } = await supabase.from("matches").insert(fullSchedule);
    if (error) throw new Error(error.message);
  }

  await supabase.from("audit_logs").insert({ action: "import_schedule", details: `${fullSchedule.length} matches imported for ${tournamentName}`, actor: "admin" });
  redirect(`/admin/matches?success=${fullSchedule.length}`);
}

// Minimal stubs for tournament generation actions referenced by admin UI.
export async function importGroupStageAction(formData: FormData): Promise<void> {
  "use server";
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({ action: "import_group_stage", details: "Stub: import group stage invoked", actor: "admin" });
}

export async function generateRoundOf32Action(formData: FormData): Promise<void> {
  "use server";
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({ action: "generate_round_of_32", details: "Stub: generate R32 invoked", actor: "admin" });
}

export async function generateRoundOf16Action(formData: FormData): Promise<void> {
  "use server";
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({ action: "generate_round_of_16", details: "Stub: generate R16 invoked", actor: "admin" });
}

export async function generateQuarterfinalsAction(formData: FormData): Promise<void> {
  "use server";
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({ action: "generate_quarterfinals", details: "Stub: generate QF invoked", actor: "admin" });
}

export async function generateSemifinalsAction(formData: FormData): Promise<void> {
  "use server";
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({ action: "generate_semifinals", details: "Stub: generate SF invoked", actor: "admin" });
}

export async function generateThirdPlaceAction(formData: FormData): Promise<void> {
  "use server";
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({ action: "generate_third_place", details: "Stub: generate third place invoked", actor: "admin" });
}

export async function generateFinalAction(formData: FormData): Promise<void> {
  "use server";
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({ action: "generate_final", details: "Stub: generate final invoked", actor: "admin" });
}

export async function matchAction(formData: FormData) {
  "use server";

  const action = String(formData.get("action"));
  const matchId = String(formData.get("matchId") ?? "");
  const homeTeam = String(formData.get("home_team") ?? "");
  const awayTeam = String(formData.get("away_team") ?? "");
  const startAt = String(formData.get("start_at") ?? "");
  const supabase = await createClient();

  if (action === "create") {
    await supabase.from("matches").insert({ home_team: homeTeam, away_team: awayTeam, starts_at: startAt, status: "scheduled", tournament_id: null });
    await supabase.from("audit_logs").insert({ action: "create_match", details: `Match ${homeTeam} vs ${awayTeam} created`, actor: "admin" });
  }

  if (action === "finish") {
    await supabase.from("matches").update({ status: "finished" }).eq("id", matchId);
    await supabase.from("audit_logs").insert({ action: "finish_match", details: `Match ${matchId} finished`, actor: "admin" });
  }

  if (action === "close") {
    await supabase.from("matches").update({ status: "closed" }).eq("id", matchId);
    await supabase.from("audit_logs").insert({ action: "close_predictions", details: `Closed predictions for match ${matchId}`, actor: "admin" });
  }

  if (action === "delete") {
    await supabase.from("matches").delete().eq("id", matchId);
    await supabase.from("audit_logs").insert({ action: "delete_match", details: `Match ${matchId} deleted`, actor: "admin" });
  }

  redirect("/admin#matches");
}
