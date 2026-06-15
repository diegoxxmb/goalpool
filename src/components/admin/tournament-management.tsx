"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  importGroupStageAction,
  generateFinalAction,
  generateQuarterfinalsAction,
  generateRoundOf16Action,
  generateRoundOf32Action,
  generateSemifinalsAction,
  generateThirdPlaceAction,
} from "@/app/admin/actions";

interface TournamentManagementProps {
  groupCount: number;
  round32Count: number;
  round16Count: number;
  quarterCount: number;
  semifinalCount: number;
  thirdPlaceCount: number;
  finalCount: number;
  successMessage?: string;
  errorMessage?: string;
}

interface ActionButton {
  key: string;
  label: string;
  action: (formData: FormData) => Promise<void>;
  visible: boolean;
  disabled: boolean;
  hint: string;
}

export function TournamentManagement({
  groupCount,
  round32Count,
  round16Count,
  quarterCount,
  semifinalCount,
  thirdPlaceCount,
  finalCount,
  successMessage,
  errorMessage,
}: TournamentManagementProps) {
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (successMessage) {
      setToast({ type: "success", message: successMessage });
    } else if (errorMessage) {
      setToast({ type: "error", message: errorMessage });
    }
  }, [successMessage, errorMessage]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const actions: ActionButton[] = [
    {
      key: "import-group-stage",
      label: "Import Group Stage",
      action: importGroupStageAction,
      visible: groupCount < 72,
      disabled: false,
      hint: "Load the full 72-group stage schedule.",
    },
    {
      key: "round-32",
      label: "Generate Round of 32",
      action: generateRoundOf32Action,
      visible: groupCount === 72,
      disabled: round32Count > 0,
      hint: round32Count > 0 ? "Already generated." : "Create the first knockout bracket.",
    },
    {
      key: "round-16",
      label: "Generate Round of 16",
      action: generateRoundOf16Action,
      visible: round32Count === 16,
      disabled: round16Count > 0,
      hint: round16Count > 0 ? "Already generated." : "Advance Round of 32 winners.",
    },
    {
      key: "quarterfinals",
      label: "Generate Quarterfinals",
      action: generateQuarterfinalsAction,
      visible: round16Count === 8,
      disabled: quarterCount > 0,
      hint: quarterCount > 0 ? "Already generated." : "Create the final eight bracket.",
    },
    {
      key: "semifinals",
      label: "Generate Semifinals",
      action: generateSemifinalsAction,
      visible: quarterCount === 4,
      disabled: semifinalCount > 0,
      hint: semifinalCount > 0 ? "Already generated." : "Advance quarterfinal winners.",
    },
    {
      key: "third-place",
      label: "Generate Third Place Match",
      action: generateThirdPlaceAction,
      visible: semifinalCount === 2,
      disabled: thirdPlaceCount > 0,
      hint: thirdPlaceCount > 0 ? "Already generated." : "Create the consolation match.",
    },
    {
      key: "final",
      label: "Generate Final",
      action: generateFinalAction,
      visible: semifinalCount === 2,
      disabled: finalCount > 0,
      hint: finalCount > 0 ? "Already generated." : "Create the championship match.",
    },
  ];

  return (
    <Card className="space-y-6 border-white/10 bg-slate-950/85 p-6 shadow-black/40">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Tournament Actions</CardTitle>
            <CardDescription>Manage the World Cup bracket from import through the final.</CardDescription>
          </div>
          <Badge className="bg-white/10 text-white">Live workflow</Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.filter((action) => action.visible).map((action) => (
          <Card key={action.key} className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-4">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{action.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{action.hint}</p>
              </div>
              <form action={action.action} className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  disabled={action.disabled || isPending}
                  className="w-full"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#00E676]" />
                      Processing...
                    </span>
                  ) : (
                    action.disabled ? "Already generated" : action.label
                  )}
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </CardContent>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 w-[min(320px,calc(100%-2rem)))] rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">{toast.type === "success" ? "Success" : "Error"}</p>
              <p className="mt-1 text-sm text-slate-300">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-sm font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
