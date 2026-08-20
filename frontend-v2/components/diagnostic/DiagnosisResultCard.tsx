"use client";

import { useState } from "react";

import ActionCard from "./ActionCard";
import ConfidenceIndicator from "./ConfidenceIndicator";

export interface DiagnosisAlternative {
  id: string;
  label: string;
  confidence: number;
}

export interface DiagnosisResultCardProps {
  title: string;
  confidence: number;
  reasons: string[];
  estimatedRemainingSeconds?: number;
  estimatedGainPercentage?: number;
  alternatives?: DiagnosisAlternative[];
  onOrder?: () => void;
  onContinue?: () => void;
}

function formatRemainingTime(
  seconds: number | undefined,
): string {
  if (
    !seconds ||
    seconds <= 0
  ) {
    return "Quelques vérifications supplémentaires";
  }

  if (seconds < 60) {
    return `Environ ${seconds} secondes`;
  }

  const minutes =
    Math.max(
      1,
      Math.round(
        seconds / 60,
      ),
    );

  return `Environ ${minutes} minute${minutes > 1 ? "s" : ""}`;
}

export default function DiagnosisResultCard({
  title,
  confidence,
  reasons,
  estimatedRemainingSeconds,
  estimatedGainPercentage,
  alternatives = [],
  onOrder,
  onContinue,
}: DiagnosisResultCardProps) {
  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    alternativesOpen,
    setAlternativesOpen,
  ] = useState(false);

  const normalizedConfidence =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          confidence,
        ),
      ),
    );

  const visibleReasons =
    reasons
      .filter(
        reason =>
          reason.trim().length > 0,
      )
      .slice(
        0,
        3,
      );

  const visibleAlternatives =
    alternatives
      .filter(
        alternative =>
          alternative.label.trim().length > 0,
      )
      .slice(
        0,
        3,
      );

  const continueSubtitle =
    estimatedGainPercentage &&
    estimatedGainPercentage > 0
      ? `+${estimatedGainPercentage} % de certitude · ${formatRemainingTime(
          estimatedRemainingSeconds,
        )}`
      : formatRemainingTime(
          estimatedRemainingSeconds,
        );

  return (
    <section className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      <div className="px-6 pb-6 pt-8 sm:px-9">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
            🔧
          </div>

          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Panne probable
          </p>

          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h2>

          <div className="mt-6">
            <ConfidenceIndicator
              confidence={
                normalizedConfidence
              }
            />
          </div>
        </div>

        {visibleReasons.length > 0 && (
          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <button
              type="button"
              onClick={() =>
                setDetailsOpen(
                  current =>
                    !current,
                )
              }
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="font-bold text-slate-900">
                Pourquoi cette conclusion ?
              </span>

              <span className="text-xl text-slate-500">
                {detailsOpen
                  ? "−"
                  : "+"}
              </span>
            </button>

            {detailsOpen && (
              <ul className="mt-4 space-y-3">
                {visibleReasons.map(
                  reason => (
                    <li
                      key={reason}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        ✓
                      </span>

                      <span>
                        {reason}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        )}

        <div className="mt-7 grid gap-3">
          <ActionCard
            icon="🟢"
            title="Commander la pièce"
            subtitle="Voir les références compatibles"
            color="green"
            onClick={onOrder}
          />

          <ActionCard
            icon="🔵"
            title="Continuer le diagnostic"
            subtitle={
              continueSubtitle
            }
            color="blue"
            onClick={onContinue}
          />

          {visibleAlternatives.length >
            0 && (
            <ActionCard
              icon="⚪"
              title="Autres causes possibles"
              subtitle={`${visibleAlternatives.length} piste${
                visibleAlternatives.length >
                1
                  ? "s"
                  : ""
              } à consulter`}
              color="gray"
              onClick={() =>
                setAlternativesOpen(
                  current =>
                    !current,
                )
              }
            />
          )}
        </div>

        {alternativesOpen &&
          visibleAlternatives.length >
            0 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              {visibleAlternatives.map(
                (
                  alternative,
                  index,
                ) => (
                  <div
                    key={
                      alternative.id
                    }
                    className={`flex items-center justify-between gap-4 px-5 py-4 ${
                      index > 0
                        ? "border-t border-slate-200"
                        : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="h-3 w-3 shrink-0 rounded-full bg-yellow-400" />

                      <span className="truncate font-medium text-slate-800">
                        {
                          alternative.label
                        }
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-slate-500">
                      {Math.round(
                        alternative.confidence,
                      )}
                      %
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center text-xs leading-5 text-slate-500 sm:px-9">
        Vérifiez la compatibilité avec votre véhicule avant l'achat.
      </div>
    </section>
  );
}
