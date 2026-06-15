"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  importGroupStageAction,
  generateRoundOf32Action,
  generateRoundOf16Action,
  generateQuarterfinalsAction,
  generateSemifinalsAction,
  generateThirdPlaceAction,
  generateFinalAction,
} from "@/app/admin/actions";

type PhaseCounts = {
  groupStage: number;
  roundOf32: number;
  roundOf16: number;
  quarterfinals: number;
  semifinals: number;
  thirdPlace: number;
  final: number;
};

interface TournamentActionsProps {
  matchCount: number;
  phaseCounts: PhaseCounts;
}

const Spinner = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
);

export function TournamentActions({ matchCount, phaseCounts }: TournamentActionsProps) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasGroupStage = phaseCounts.groupStage >= 72;
  const hasRoundOf32 = phaseCounts.roundOf32 >= 16;
  const hasRoundOf16 = phaseCounts.roundOf16 >= 8;
  const hasQuarterfinals = phaseCounts.quarterfinals >= 4;
  const hasSemifinals = phaseCounts.semifinals >= 2;
  const hasThirdPlace = phaseCounts.thirdPlace >= 1;
  const hasFinal = phaseCounts.final >= 1;

  const buttons = [
    {
      label: "Import Group Stage",
      action: () => importGroupStageAction(new FormData()).then(() => "Imported group stage"),
      visible: !hasGroupStage,
      disabled: false,
      note: undefined,
    },
    {
      label: "Generate Round of 32",
      action: () => generateRoundOf32Action(new FormData()).then(() => "Round of 32 generated"),
      visible: hasGroupStage,
      disabled: hasRoundOf32,
      note: hasRoundOf32 ? "Already generated" : undefined,
    },
    {
      label: "Generate Round of 16",
      action: () => generateRoundOf16Action(new FormData()).then(() => "Round of 16 generated"),
      visible: hasRoundOf32,
      disabled: hasRoundOf16,
      note: hasRoundOf16 ? "Already generated" : undefined,
    },
    {
      label: "Generate Quarterfinals",
      action: () => generateQuarterfinalsAction(new FormData()).then(() => "Quarterfinals generated"),
      visible: hasRoundOf16,
      disabled: hasQuarterfinals,
      note: hasQuarterfinals ? "Already generated" : undefined,
    },
    {
      label: "Generate Semifinals",
      action: () => generateSemifinalsAction(new FormData()).then(() => "Semifinals generated"),
      visible: hasQuarterfinals,
      disabled: hasSemifinals,
      note: hasSemifinals ? "Already generated" : undefined,
    },
    {
      label: "Generate Third Place Match",
      action: () => generateThirdPlaceAction(new FormData()).then(() => "Third place generated"),
      visible: hasSemifinals,
      disabled: hasThirdPlace,
      note: hasThirdPlace ? "Already generated" : undefined,
    },
    {
      label: "Generate Final",
      action: () => generateFinalAction(new FormData()).then(() => "Final generated"),
      visible: hasSemifinals,
      disabled: hasFinal,
      note: hasFinal ? "Already generated" : undefined,
    },
  ];

  const visibleButtons = buttons.filter((button) => button.visible);

  async function runAction(action: () => Promise<string>) {
    setToast(null);
    setError(null);
    startTransition(async () => {
      try {
        const message = await action();
        setToast(message);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to complete action.";
        setError(message);
      }
    });
  }

  return (
    <Card className="space-y-6">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Tournament Actions</CardTitle>
            <CardDescription>Run the next valid World Cup round generation workflow from the admin console.</CardDescription>
          </div>
          <Badge>{matchCount} total matches</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {visibleButtons.map((button) => (
            <div key={button.label} className="rounded-3xl border border-white/10 bg-slate-950/90 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{button.label}</p>
                {button.note ? <Badge className="bg-white/10 text-slate-200">{button.note}</Badge> : null}
              </div>
              <Button
                variant="gold"
                className="w-full"
                onClick={() => runAction(button.action)}
                disabled={button.disabled || isPending}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Processing
                  </span>
                ) : (
                  button.disabled ? "Already generated" : button.label
                )}
              </Button>
            </div>
          ))}
        </div>
        {(toast || error) && (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/70 p-4 text-sm text-white shadow-xl shadow-black/40">
            {toast ? <p className="text-emerald-300">{toast}</p> : <p className="text-rose-300">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
