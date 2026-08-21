"use client";

import PartImageGallery from "./PartImageGallery";
import DiagnosticConfirmationCard from "./DiagnosticConfirmationCard";

type DiagnosticConclusion = {
  title:
    string;

  confidence:
    number;

  recommendedChecks?:
    string[];

};

type ReasoningExplanation = {
  summary:
    string;

  supportingEvidence:
    string[];

  alternativeHypotheses: {
    id:
      string;

    label:
      string;

    probability:
      number;
  }[];

  selectedQuestionReason:
    string | null;
};

type SalesRecommendation = {
  partName:
    string | null;

  headline:
    string;

  confidence: {
    score:
      number;

    decision:
      | "purchase-recommended"
      | "verification-required"
      | "purchase-not-recommended";

    risk:
      | "low"
      | "medium"
      | "high";

    stars:
      number;

    label:
      string;
  };

  reasons:
    string[];

  alternativePart:
    string | null;

  verificationMessage:
    string | null;

  callToAction:
    | "identify-vehicle"
    | "continue-diagnostic"
    | "request-professional-check";
};

type DiagnosticAmbiguity = {
  active: boolean;
  reason: string;

  candidates: {
    hypothesisId: string;
    label: string;
    probability: number;
    confidencePercentage: number;
  }[];

  lead: number;

  finalCheck: {
    questionId: string | null;
    text: string | null;
  };

  message: string;
};

type DiagnosticCoexistence = {
  active: boolean;
  candidates: {
    hypothesisId: string;
    label: string;
    diagnosticWeightPercentage: number;
    supportingEvidenceCount: number;
  }[];
  verification: {
    actionId: string | null;
    text: string;
  };
  message: string;
};

type DiagnosticCausalChain = {
  active: boolean;

  primary: {
    hypothesisId: string;
    label: string;
    probabilityPercentage: number;
    supportingEvidenceCount: number;
  };

  secondary: {
    hypothesisId: string;
    label: string;
    probabilityPercentage: number;
    supportingEvidenceCount: number;
  };

  relation: {
    text: string;
    confidence: string;
  };

  verification: {
    actionId: string | null;
    text: string;
  };

  repairOrder: string[];

  message: string;
};
type Props = {
  conclusion:
    DiagnosticConclusion | null;

  causalChain?:
    DiagnosticCausalChain | null;
  coexistence?:
    DiagnosticCoexistence | null;

  ambiguity?:
    DiagnosticAmbiguity | null;

  explanation:
    ReasoningExplanation;

  salesRecommendation:
    SalesRecommendation | null;

  onContinue?:
    () => void;

  verificationResult?:
    "positive" |
    "negative" |
    "not-tested" |
    null;

  onVerificationResult?:
    (
      result:
        "positive" |
        "negative" |
        "not-tested",
    ) => void;
};

function normalizeConfidence(
  value:
    number,
): number {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        value <=
        1
          ? value *
            100
          : value,
      ),
    ),
  );
}

function cleanSummary(
  summary:
    string,
): string {
  return summary
    .replace(
      /^Cause la plus probable\s*:\s*[«"]?/,
      "",
    )
    .replace(
      /^L'hypothèse principale est\s*[«"]?/,
      "",
    )
    .replace(
      /[»"]?\s+avec une confiance de.*$/,
      "",
    )
    .trim();
}

function getPartImage(
  partName:
    string | null,
): string {
  const normalized =
    (
      partName ??
      ""
    )
      .normalize(
        "NFD",
      )
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase();

  if (
    normalized.includes(
      "batterie",
    ) ||
    normalized.includes(
      "cosse",
    )
  ) {
    return "/parts/battery.svg";
  }

  if (
    normalized.includes(
      "demarreur",
    ) ||
    normalized.includes(
      "solenoide",
    )
  ) {
    return "/parts/starter.svg";
  }

  return "/parts/generic-part.svg";
}

export default function UnifiedDiagnosticResult({
  conclusion,
  causalChain,
  coexistence,
  ambiguity,
  explanation,
  salesRecommendation,
  onContinue,
  verificationResult,
  onVerificationResult,
}: Props) {
  const diagnosticConfidence =
    conclusion
      ? normalizeConfidence(
          conclusion.confidence,
        )
      : 0;

  const partName =
    salesRecommendation
      ?.partName ??
    null;

  const imageSource =
    getPartImage(
      partName ??
        explanation.summary,
    );

  const confidenceClass =
    diagnosticConfidence >=
    80
      ? "bg-emerald-600"
      : diagnosticConfidence >=
          60
        ? "bg-amber-500"
        : "bg-red-600";

  return (
    <section className="mt-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <header className="bg-slate-950 px-6 py-5 text-white">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-300">
  RǸsultat de l&apos;analyse
</p>
      </header>

      <div className="p-6">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
            Cause la plus probable
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {
              cleanSummary(
                explanation.summary,
              )
            }
          </h2>
          {partName ? (
            <div className="mt-5">
              <PartImageGallery
                partName={
                  partName
                }
                fallbackImage={
                  imageSource
                }
              />
            </div>
          ) : (
            <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              La famille de panne est identifiée, mais aucune pièce précise ne peut encore être désignée. Effectuez la vérification conseillée avant toute commande.
            </div>
          )}

          {conclusion && (
            <div className="mx-auto mt-5 max-w-xl">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-600">
  Niveau de certitude
</span>

                <span className="text-xl font-bold text-slate-950">
                  {
                    diagnosticConfidence
                  }
                  %
                </span>
              </div>

              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${confidenceClass}`}
                  style={{
                    width:
                      `${diagnosticConfidence}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {causalChain?.active && (
          <div className="mt-7 rounded-2xl border-2 border-rose-300 bg-rose-50 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-rose-900">
              Chaǩne causale dǸtectǸe
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {causalChain.message}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="rounded-xl border border-rose-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
                  Cause primaire
                </p>

                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="font-bold text-slate-950">
                    {causalChain.primary.label}
                  </p>

                  <span className="rounded-full bg-rose-700 px-3 py-1 text-sm font-bold text-white">
                    {causalChain.primary.probabilityPercentage}%
                  </span>
                </div>
              </div>

              <div className="text-center text-2xl font-black text-rose-700">
                →
              </div>

              <div className="rounded-xl border border-orange-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
                  DǸfaut secondaire
                </p>

                <div className="mt-2 flex items-start justify-between gap-3">
                  <p className="font-bold text-slate-950">
                    {causalChain.secondary.label}
                  </p>

                  <span className="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white">
                    {causalChain.secondary.probabilityPercentage}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-100 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-900">
                Relation probable
              </p>

              <p className="mt-2 font-semibold leading-6 text-slate-950">
                {causalChain.relation.text}
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-900">
                Contrôle de confirmation
              </p>

              <p className="mt-2 font-semibold leading-6 text-slate-950">
                {causalChain.verification.text}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Ordre de rǸparation conseillǸ
              </p>

              <ol className="mt-3 space-y-2">
                {causalChain.repairOrder.map(
                  (step, index) => (
                    <li
                      key={`${index}-${step}`}
                      className="flex gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-800"
                    >
                      <span className="font-bold text-rose-700">
                        {index + 1}.
                      </span>

                      <span>
                        {step}
                      </span>
                    </li>
                  ),
                )}
              </ol>
            </div>

            <div className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-950">
              Traitez la cause primaire avant de remplacer uniquement la pièce secondaire.
            </div>
          </div>
        )}
        {!causalChain?.active && coexistence?.active && (
          <div className="mt-7 rounded-2xl border-2 border-violet-300 bg-violet-50 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-violet-900">
              Deux pannes peuvent Ǧtre prǸsentes
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {coexistence.message}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {coexistence.candidates.map(
                (candidate, index) => (
                  <div
                    key={candidate.hypothesisId}
                    className="rounded-xl border border-violet-200 bg-white p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {index === 0
                        ? "Défaut probable n°1"
                        : "Défaut probable n°2"}
                    </p>

                    <div className="mt-2 flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-950">
                        {candidate.label}
                      </p>

                      <span className="rounded-full bg-violet-700 px-3 py-1 text-sm font-bold text-white">
                        {candidate.diagnosticWeightPercentage}%
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {candidate.supportingEvidenceCount} ǸlǸment(s) concordant(s)
                    </p>
                  </div>
                ),
              )}
            </div>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-900">
                VǸrification des deux dǸfauts
              </p>

              <p className="mt-2 font-semibold leading-6 text-slate-950">
                {coexistence.verification.text}
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-violet-100 px-4 py-3 text-sm font-semibold text-violet-950">
              Ne vous arrêtez pas après avoir confirmé le premier défaut : vérifiez également le second.
            </div>
          </div>
        )}

        {!causalChain?.active &&
          !coexistence?.active &&
          ambiguity?.active &&
          ambiguity.candidates.length >= 2 && (
          <div className="mt-7 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-900">
              Diagnostic à confirmer
            </p>

            <p className="mt-2 text-sm text-slate-700">
              {ambiguity.message}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {ambiguity.candidates.slice(0, 2).map(
                (candidate, index) => (
                  <div
                    key={candidate.hypothesisId}
                    className="rounded-xl border border-amber-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {index === 0
                            ? "Cause probable n°1"
                            : "Cause probable n°2"}
                        </p>

                        <p className="mt-1 font-bold text-slate-950">
                          {candidate.label}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">
                        {candidate.confidencePercentage}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{
                          width: `${candidate.confidencePercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            {ambiguity.finalCheck.text && (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-900">
                  Contrôle final pour trancher
                </p>

                <p className="mt-2 font-semibold text-slate-950">
                  {ambiguity.finalCheck.text}
                </p>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
              Ne remplacez aucune pièce avant d&apos;avoir effectué ce contrôle final.
            </div>
          </div>
        )}

                {conclusion?.recommendedChecks &&
          conclusion.recommendedChecks.length > 0 && (
          <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
              VǸrification finale conseillǸe
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Avant de commander la pièce, effectuez de préférence ce contrôle :
            </p>

            <div className="mt-4 rounded-xl bg-white p-4">
              <p className="font-semibold text-slate-950">
                {
                  conclusion.recommendedChecks[0]
                }
              </p>

              {verificationResult === null && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() =>
                    onVerificationResult?.(
                      "positive",
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  Test positif
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onVerificationResult?.(
                      "negative",
                    )
                  }
                  className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  Test nǸgatif
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onVerificationResult?.(
                      "not-tested",
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Impossible à tester
                </button>
              </div>
              )}
            </div>

            {conclusion.recommendedChecks.length > 1 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-blue-800">
                  Voir les autres contrôles possibles
                </summary>

                <ul className="mt-3 grid gap-2">
                  {
                    conclusion.recommendedChecks
                      .slice(1)
                      .map(
                        check => (
                          <li
                            key={
                              check
                            }
                            className="rounded-xl bg-white px-4 py-3 text-sm text-slate-700"
                          >
                            {check}
                          </li>
                        ),
                      )
                  }
                </ul>
              </details>
            )}
          </div>
        )}
<DiagnosticConfirmationCard
          confidence={
            diagnosticConfidence
          }

          verificationResult={
            verificationResult
          }

          onContinue={
            onContinue
          }
        
          partName={partName}
        />

        {salesRecommendation?.alternativePart && (
          <p className="mt-5 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
            Autre pièce à vérifier :{" "}
            <strong className="text-slate-950">
              {
                salesRecommendation
                  .alternativePart
              }
            </strong>
          </p>
        )}

        

        <button
          type="button"
          onClick={() => {
            window.location.href = "/diagnostic-v2";
          }}
          className="mt-5 w-full rounded-2xl border-2 border-slate-300 bg-white px-6 py-4 text-lg font-bold text-slate-800 transition hover:bg-slate-100"
        >
          Recommencer le diagnostic
        </button>

        {salesRecommendation?.callToAction ===
          "request-professional-check" && (
          <button
            type="button"
            className="mt-7 w-full rounded-2xl bg-slate-800 px-6 py-4 text-lg font-bold text-white transition hover:bg-slate-950"
          >
            Demander un contrôle professionnel
          </button>
        )}
      </div>
    </section>
  );
}


