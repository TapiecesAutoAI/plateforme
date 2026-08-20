"use client";

import Image from "next/image";
import UnifiedDiagnosticResult from "@/components/diagnostic/UnifiedDiagnosticResult";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Profile =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

type ActionOption = {
  id: string;
  label: string;
};

type DiagnosticAction = {
  id: string;
  text: string;
  options?: ActionOption[];
};

type DiagnosticConclusion = {
  title: string;
  confidence: number;
  explanation: string;
  recommendedChecks: string[];
  possibleParts: string[];
};

type ReasoningExplanation = {
  summary: string;

  supportingEvidence: string[];

  alternativeHypotheses: {
    id: string;
    label: string;
    probability: number;
  }[];

  selectedQuestionReason: string | null;
};

type PartRecommendation = {
  partName: string;
  score: number;
  rank: number;
  reason: string;
};

type PartRecommendationResult = {
  status:
    | "recommended"
    | "verify-before-purchase"
    | "insufficient-confidence"
    | "no-part-required";

  primaryPart: PartRecommendation | null;

  alternatives: PartRecommendation[];

  confidence: number;

  verificationRequired: boolean;

  verificationMessage: string | null;
};

type SalesRecommendation = {
  partName: string | null;

  headline: string;

  confidence: {
    score: number;
    decision:
      | "purchase-recommended"
      | "verification-required"
      | "purchase-not-recommended";
    risk:
      | "low"
      | "medium"
      | "high";
    stars: number;
    label: string;
  };

  reasons: string[];

  alternativePart: string | null;

  verificationMessage: string | null;

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
  reason: string;
  candidates: {
    hypothesisId: string;
    label: string;
    diagnosticWeight: number;
    diagnosticWeightPercentage: number;
    supportingEvidenceCount: number;
  }[];
  combinedDiagnosticWeight: number;
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
type DiagnosticResponse = {
  causalChain: DiagnosticCausalChain | null;
  session: {
    id: string;
    conclusion: DiagnosticConclusion | null;
  };

  action: DiagnosticAction | null;

  completed: boolean;

  explanation: ReasoningExplanation | null;

  partRecommendation: PartRecommendationResult | null;

  salesRecommendation: SalesRecommendation;

  error?: string;
  ambiguity: DiagnosticAmbiguity | null;
  coexistence: DiagnosticCoexistence | null;
};

type ConversationEntry = {
  id: string;

  role:
    | "assistant"
    | "user";

  text: string;
};

const profiles: {
  id: Profile;
  label: string;
}[] = [
  {
    id:
      "particulier",

    label:
      "Particulier",
  },

  {
    id:
      "bricoleur",

    label:
      "Bricoleur",
  },

  {
    id:
      "vendeur-pieces-auto",

    label:
      "Vendeur de pièces auto",
  },

  {
    id:
      "mecanicien-garage",

    label:
      "Mécanicien / Garage",
  },

  {
    id:
      "depanneur",

    label:
      "Dépanneur",
  },
];

function detectDomain(
  message: string,
): "starting" | null {
  const text =
    message
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase();

  if (
    text.includes("demarre") ||
    text.includes("demarreur") ||
    text.includes("clic") ||
    text.includes("claquement") ||
    text.includes("clac") ||
    text.includes("lancement") ||
    text.includes("mise en route") ||
    text.includes("tourne pas") ||
    text.includes("ne part pas")
  ) {
    return "starting";
  }

  return null;
}

function createEntryId():
  string {
  return crypto.randomUUID();
}

export default function DiagnosticV2Page({
  initialProfile = null,
}: {
  initialProfile?: Profile | null;
} = {}) {
  const pageEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );
  const [
    profile,
    setProfile,
  ] = useState<Profile | null>(initialProfile,);

  
  useEffect(
    () => {

      if (initialProfile) {
        return;
      }

      const storedProfile =
        window.sessionStorage.getItem(
          "tapiecesauto-showroom-profile",
        );

      if (
        storedProfile === "particulier" ||
        storedProfile === "bricoleur" ||
        storedProfile === "vendeur-pieces-auto" ||
        storedProfile === "mecanicien-garage" ||
        storedProfile === "depanneur"
      ) {

        setProfile(
          storedProfile,
        );
      }

    },
    [
      initialProfile,
    ],
  );

const [
    complaint,
    setComplaint,
  ] = useState("");

  const [
    sessionId,
    setSessionId,
  ] = useState<string | null>(
    null,
  );

  const [
    action,
    setAction,
  ] = useState<DiagnosticAction | null>(
    null,
  );

  const [
    conclusion,
    setConclusion,
  ] = useState<DiagnosticConclusion | null>(
    null,
  );

  const [
    explanation,
    setExplanation,
  ] = useState<ReasoningExplanation | null>(
    null,
  );

  const [
    partRecommendation,
    setPartRecommendation,
  ] = useState<PartRecommendationResult | null>(
    null,
  );

  const [
    salesRecommendation,
    setSalesRecommendation,
  ] = useState<SalesRecommendation | null>(
    null,
  );

  const [
    ambiguity,
    setAmbiguity,
  ] = useState<DiagnosticAmbiguity | null>(
    null,
  );

  const [
    coexistence,
    setCoexistence,
  ] = useState<DiagnosticCoexistence | null>(
    null,
  );

  const [
    causalChain,
    setCausalChain,
  ] = useState<DiagnosticCausalChain | null>(
    null,
  );

  const [
    verificationResult,
    setVerificationResult,
  ] = useState<
    "positive" |
    "negative" |
    "not-tested" |
    null
  >(
    null,
  );

  const [
    history,
    setHistory,
  ] = useState<ConversationEntry[]>(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  async function startDiagnostic() {
    if (
      !profile ||
      !complaint.trim()
    ) {
      return;
    }

    const domain =
      detectDomain(
        complaint,
      );

    if (
      !domain
    ) {
      setError(
        "Pour l’instant, le nouveau moteur reconnaît uniquement les problèmes de démarrage.",
      );

      return;
    }

    setLoading(true);
    setError(null);
    setConclusion(null);

    try {
      const newSessionId =
        crypto.randomUUID();

      const response =
        await fetch(
          "/api/diagnostic-v2",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                command:
                  "start",

                sessionId:
                  newSessionId,

                profile,

                domain,

                message:
                  complaint.trim(),
              }),
          },
        );

      const data =
        await response.json() as
          DiagnosticResponse;

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ??
          "Impossible de démarrer le diagnostic.",
        );
      }

      setSessionId(
        newSessionId,
      );

      setAction(
        data.action,
      );

      setConclusion(
        data.session.conclusion,
      );

      setExplanation(
        data.explanation,
      );

      setPartRecommendation(
        data.partRecommendation,
      );

      setSalesRecommendation(
        data.salesRecommendation,
      );

      setAmbiguity(
        data.ambiguity ?? null,
      );

      setCoexistence(
        data.coexistence ?? null,
      );

      setCausalChain(
        data.causalChain ?? null,
      );

      const initialHistory:
        ConversationEntry[] = [
          {
            id:
              createEntryId(),

            role:
              "assistant",

            text:
              "Bonjour, je suis l’assistant Ta Pièces Auto AI. Décrivez votre problème avec vos propres mots.",
          },

          {
            id:
              createEntryId(),

            role:
              "user",

            text:
              complaint.trim(),
          },
        ];

      if (
        data.action
      ) {
        initialHistory.push({
          id:
            createEntryId(),

          role:
            "assistant",

          text:
            data.action.text,
        });
      }

      setHistory(
        initialHistory,
      );
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Erreur inconnue.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function answerQuestion(
    option: ActionOption,
  ) {
    if (
      !sessionId ||
      !action
    ) {
      return;
    }

    const currentAction =
      action;

    setLoading(true);
    setError(null);

    setHistory(
      (currentHistory) => [
        ...currentHistory,

        {
          id:
            createEntryId(),

          role:
            "user",

          text:
            option.label,
        },
      ],
    );

    try {
      const response =
        await fetch(
          "/api/diagnostic-v2",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                command:
                  "answer",

                sessionId,

                domain:
                  "starting",

                actionId:
                  currentAction.id,

                optionId:
                  option.id,
              }),
          },
        );

      const data =
        await response.json() as
          DiagnosticResponse;

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ??
          "Impossible d’enregistrer la réponse.",
        );
      }

      setAction(
        data.action,
      );

      setConclusion(
        data.session.conclusion,
      );

      setExplanation(
        data.explanation,
      );

      setPartRecommendation(
        data.partRecommendation,
      );

      setSalesRecommendation(
        data.salesRecommendation,
      );

      setAmbiguity(
        data.ambiguity ?? null,
      );

      setCoexistence(
        data.coexistence ?? null,
      );

      setCausalChain(
        data.causalChain ?? null,
      );

      if (
        data.action
      ) {
        setHistory(
          (currentHistory) => [
            ...currentHistory,

            {
              id:
                createEntryId(),

              role:
                "assistant",

              text:
                data.action?.text ??
                "",
            },
          ],
        );
      }
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Erreur inconnue.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(
    () => {
      const timeoutId =
        window.setTimeout(
          () => {
            pageEndRef.current
              ?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "end",
              });
          },
          100,
        );

      return () => {
        window.clearTimeout(
          timeoutId,
        );
      };
    },
    [
      history,
      action,
      conclusion,
      explanation,
      partRecommendation,
      salesRecommendation,
      loading,
      error,
    ],
  );


  async function continueDiagnostic() {
    if (
      !sessionId
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/diagnostic-v2",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                command:
                  "evaluate",

                sessionId,

                domain:
                  "starting",
              }),
          },
        );

      const data =
        await response.json() as
          DiagnosticResponse;

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ??
          "Impossible de continuer le diagnostic.",
        );
      }

      setAction(
        data.action,
      );

      setConclusion(
        data.session.conclusion,
      );

      if (
        data.explanation
      ) {
        setExplanation(
          data.explanation,
        );
      }

      setPartRecommendation(
        data.partRecommendation,
      );

      setSalesRecommendation(
        data.salesRecommendation,
      );

      setAmbiguity(
        data.ambiguity ?? null,
      );

      setCoexistence(
        data.coexistence ?? null,
      );

      setCausalChain(
        data.causalChain ?? null,
      );

      if (
        data.action
      ) {
        setHistory(
          currentHistory => [
            ...currentHistory,

            {
              id:
                createEntryId(),

              role:
                "assistant",

              text:
                data.action?.text ??
                "",
            },
          ],
        );
      }
    } catch (
      currentError
    ) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Erreur inconnue.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function answerVerification(
    result:
      "positive" |
      "negative" |
      "not-tested",
  ) {
    if (
      !sessionId
    ) {
      return;
    }

    const optionId =
      result === "positive"
        ? "yes"
        : result === "negative"
          ? "no"
          : "unknown";

    setLoading(true);
    setError(null);

    setVerificationResult(
      result,
    );
    try {
      const response =
        await fetch(
          "/api/diagnostic-v2",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                command:
                  "answer",

                sessionId,

                domain:
                  "starting",

                actionId:
                  "starting-starter-command-check",

                optionId,
              }),
          },
        );

      const data =
        await response.json() as
          DiagnosticResponse;

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ??
          "Impossible d'enregistrer la vérification.",
        );
      }

      setAction(
        data.action,
      );

      setConclusion(
        data.session.conclusion,
      );

      if (
        data.explanation
      ) {
        setExplanation(
          data.explanation,
        );
      }

      setPartRecommendation(
        data.partRecommendation,
      );

      setSalesRecommendation(
        data.salesRecommendation,
      );

      setAmbiguity(
        data.ambiguity ?? null,
      );

      setCoexistence(
        data.coexistence ?? null,
      );

      setCausalChain(
        data.causalChain ?? null,
      );

      setHistory(
        currentHistory => {
          const verificationText =
            result === "positive"
              ? "Vérification : tension de commande présente."
              : result === "negative"
                ? "Vérification : tension de commande absente."
                : "Vérification non effectuée.";

          const withoutPreviousVerification =
            currentHistory.filter(
              entry =>
                !entry.text.startsWith(
                  "Vérification : tension de commande",
                ) &&
                entry.text !==
                  "Vérification non effectuée.",
            );

          return [
            ...withoutPreviousVerification,
            {
              id:
                createEntryId(),

              role:
                "user",

              text:
                verificationText,
            },
          ];
        },
      );

    } catch (
      currentError
    ) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Erreur inconnue.",
      );
    } finally {
      setLoading(false);
    }
  }
  function resetDiagnostic() {
    setProfile(null);
    setComplaint("");
    setSessionId(null);
    setAction(null);
    setConclusion(null);
    setExplanation(null);
    setPartRecommendation(null);
    setSalesRecommendation(null);
    setAmbiguity(null);
    setCoexistence(null);
    setCausalChain(null);
    setHistory([]);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-7 py-8 text-white">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-black shadow-xl">
              <Image
                src="/zt-consult-logo.png"
                alt="Logo ZT Consult"
                width={512}
                height={512}
                priority
                className="h-full w-full object-cover"
              />
            </div>

 <h1 className="mt-5 text-3xl font-bold">
  Ta Pièces Auto AI
</h1>

<p className="mt-3 max-w-3xl text-center text-lg text-blue-100">
  Identifier la bonne pièce avec le minimum de questions et le risque d'erreur
              <br />
              le plus faible possible.
</p>

<p className="mt-3 max-w-3xl text-center text-sm text-blue-200">
  L'IA qui raisonne comme un vendeur expert en pièces automobiles.
</p>          </div>
        </header>

        <div className="p-7">
          {!profile && (
            <>
              <h2 className="text-xl font-semibold text-slate-950">
                Quel est votre profil ?
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {profiles.map(
                  (item) => (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        setProfile(
                          item.id,
                        )
                      }
                      className="rounded-2xl border border-slate-200 px-5 py-4 text-left font-semibold text-slate-900 transition hover:border-blue-700 hover:bg-blue-50"
                    >
                      {
                        item.label
                      }
                    </button>
                  ),
                )}
              </div>
            </>
          )}

          {profile &&
            !sessionId && (
            <>
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                  {
                    profiles.find(
                      (item) =>
                        item.id ===
                        profile,
                    )?.label
                  }
                </span>

                <button
                  type="button"
                  onClick={
                    resetDiagnostic
                  }
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                  Changer de profil
                </button>
              </div>

              <h2 className="mt-7 text-xl font-semibold text-slate-950">
                Décrivez votre problème avec vos propres mots
              </h2>

              <textarea
                value={
                  complaint
                }
                onChange={(
                  event,
                ) =>
                  setComplaint(
                    event.target.value,
                  )
                }
                placeholder="Exemple : Ma voiture ne démarre plus et j’entends plusieurs clics rapides…"
                rows={5}
                className="mt-4 w-full rounded-2xl border border-slate-300 p-4 text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                disabled={
                  loading ||
                  !complaint.trim()
                }
                onClick={
                  startDiagnostic
                }
                className="mt-4 rounded-xl bg-blue-950 px-6 py-3 font-semibold text-white disabled:opacity-40"
              >
                Commencer le diagnostic
              </button>
            </>
          )}

          {sessionId && (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                  {
                    profiles.find(
                      (item) =>
                        item.id ===
                        profile,
                    )?.label
                  }
                </span>

                <button
                  type="button"
                  onClick={
                    resetDiagnostic
                  }
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                  Recommencer
                </button>
              </div>

              <div className="space-y-4 rounded-2xl bg-slate-50 p-5">
                {history.map(
                  (entry) => (
                    <div
                      key={
                        entry.id
                      }
                      className={
                        entry.role ===
                        "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >
                      <div
                        className={
                          entry.role ===
                          "user"
                            ? "max-w-[85%] rounded-2xl rounded-br-md bg-blue-950 px-4 py-3 text-white"
                            : "max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm"
                        }
                      >
                        {
                          entry.text
                        }
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}

          {sessionId &&
            action && (
            <div className="mt-6 grid gap-3">
              {action.options?.map(
                (option) => (
                  <button
                    key={
                      option.id
                    }
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={() =>
                      answerQuestion(
                        option,
                      )
                    }
                    className="rounded-2xl border border-slate-200 px-5 py-4 text-left font-medium text-slate-800 transition hover:border-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    {
                      option.label
                    }
                  </button>
                ),
              )}
            </div>
          )}
          {sessionId &&
            explanation &&
            !action && (
            <UnifiedDiagnosticResult
              conclusion={
                conclusion
              }
              causalChain={
                causalChain
              }
              coexistence={
                coexistence
              }

              ambiguity={
                ambiguity
              }

              explanation={
                explanation
              }
              salesRecommendation={
                salesRecommendation
              }

              verificationResult={
                verificationResult
              }

                onContinue={
                  continueDiagnostic
                }

                onVerificationResult={
                  answerVerification
                }


            />
          )}

          {loading && (
            <p className="mt-5 text-sm text-slate-500">
              Analyse en cours…
            </p>
          )}

          {error && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {
                error
              }
            </p>
          )}

          <div
            ref={
              pageEndRef
            }
            aria-hidden="true"
            className="h-px"
          />
        </div>
      </section>
    </main>
  );
}














