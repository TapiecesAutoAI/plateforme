"use client";

import { useMemo, useState } from "react";

import { automotiveKnowledgeGraph } from "../../lib/ai/knowledge/data";
import { DiagnosticService } from "../../lib/ai/diagnostic/service";

import type {
  DiagnosticEvidence,
  DiagnosticSession,
  VehicleContext,
} from "../../lib/ai/diagnostic/types";

type DemoSymptom = {
  entityId: string;
  label: string;
};

const demoSymptoms: DemoSymptom[] = [
  {
    entityId: "symptom-no-start",
    label: "Le véhicule ne démarre pas",
  },
  {
    entityId: "symptom-click-start",
    label: "J’entends un clic au démarrage",
  },
  {
    entityId: "symptom-noise-clicking",
    label: "J’entends un claquement",
  },
  {
    entityId: "symptom-noise-humming",
    label: "J’entends un ronronnement",
  },
  {
    entityId: "observation-noise-front",
    label: "Le bruit vient de l’avant",
  },
  {
    entityId: "observation-noise-rear",
    label: "Le bruit vient de l’arrière",
  },
];

function createInitialSession(
  service: DiagnosticService,
): DiagnosticSession {
  const vehicle: VehicleContext = {
    make: "Peugeot",
    model: "308",
    year: 2018,
    mileageKm: 145000,
    fuelType: "diesel",
    transmissionType: "manual",
  };

  return service.createSession(vehicle);
}

function percentage(value: number): string {
  return `${Math.round(value * 100)} %`;
}

export default function DiagnosticDemoPage() {
  const service = useMemo(
    () =>
      new DiagnosticService(
        automotiveKnowledgeGraph,
      ),
    [],
  );

  const [session, setSession] =
    useState<DiagnosticSession>(() =>
      createInitialSession(service),
    );

  const [selectedSymptoms, setSelectedSymptoms] =
    useState<string[]>([]);

  function toggleSymptom(entityId: string) {
    setSelectedSymptoms((current) =>
      current.includes(entityId)
        ? current.filter((id) => id !== entityId)
        : [...current, entityId],
    );
  }

  function runDiagnostic() {
    let updatedSession =
      createInitialSession(service);

    selectedSymptoms.forEach((entityId) => {
      updatedSession = service.addEvidence(
        updatedSession,
        {
          entityId,
          value: "yes",
          confidence: 1,
          source: "user",
        },
      );
    });

    updatedSession =
      service.analyze(updatedSession);

    setSession(updatedSession);
  }

  function answerQuestion(
    value: DiagnosticEvidence["value"],
  ) {
    const question =
      session.currentResult?.nextQuestion;

    if (!question) {
      return;
    }

    const updatedSession =
      service.answerAndAnalyze(
        session,
        question,
        value,
        1,
      );

    setSession(updatedSession);
  }

  function resetDiagnostic() {
    setSelectedSymptoms([]);
    setSession(
      createInitialSession(service),
    );
  }

  const result = session.currentResult;

  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
  style={{
    fontSize: "34px",
    fontWeight: "bold",
    textAlign: "center",
  }}
>
  Ta Pièces Auto AI — Démonstration
</h1>

<p
  style={{
    marginTop: "18px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 600,
    color: "#1e3a8a",
  }}
>
  Identifier la bonne pièce avec le minimum de questions et le risque d'erreur
              <br />
              le plus faible possible.
</p>

<p
  style={{
    marginTop: "10px",
    textAlign: "center",
    fontSize: "17px",
    color: "#64748b",
    marginBottom: "30px",
  }}
>
  L'IA qui raisonne comme un vendeur expert en pièces automobiles.
</p>

      <p>
        Véhicule de démonstration :
        Peugeot 308 diesel, 2018,
        145 000 km.
      </p>

      <section
        style={{
          marginTop: "32px",
          padding: "24px",
          border: "1px solid #d1d5db",
          borderRadius: "12px",
        }}
      >
        <h2>1. Sélectionne les symptômes</h2>

        <div
          style={{
            display: "grid",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {demoSymptoms.map((symptom) => {
            const selected =
              selectedSymptoms.includes(
                symptom.entityId,
              );

            return (
              <button
                key={symptom.entityId}
                type="button"
                onClick={() =>
                  toggleSymptom(
                    symptom.entityId,
                  )
                }
                style={{
                  padding: "14px",
                  textAlign: "left",
                  borderRadius: "8px",
                  border: selected
                    ? "2px solid #111827"
                    : "1px solid #d1d5db",
                  background: selected
                    ? "#e5e7eb"
                    : "white",
                  cursor: "pointer",
                }}
              >
                {selected ? "✓ " : ""}
                {symptom.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={runDiagnostic}
            disabled={
              selectedSymptoms.length === 0
            }
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "white",
              cursor:
                selectedSymptoms.length === 0
                  ? "not-allowed"
                  : "pointer",
              opacity:
                selectedSymptoms.length === 0
                  ? 0.5
                  : 1,
            }}
          >
            Lancer le diagnostic
          </button>

          <button
            type="button"
            onClick={resetDiagnostic}
            style={{
              padding: "12px 20px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Recommencer
          </button>
        </div>
      </section>

      {result && (
        <>
          <section
            style={{
              marginTop: "24px",
              padding: "24px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
            }}
          >
            <h2>2. Résultat actuel</h2>

            <p>
              <strong>Statut :</strong>{" "}
              {result.status}
            </p>

            <p>{result.summary}</p>

            {result.explanation && (
              <p>{result.explanation}</p>
            )}

            {result.warnings.map(
              (warning) => (
                <div
                  key={warning.id}
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#f3f4f6",
                  }}
                >
                  <strong>
                    Avertissement :
                  </strong>{" "}
                  {warning.message}
                </div>
              ),
            )}
          </section>

          <section
            style={{
              marginTop: "24px",
              padding: "24px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
            }}
          >
            <h2>3. Pannes classées</h2>

            {result.hypotheses.length === 0 ? (
              <p>
                Aucune hypothèse pertinente.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                {result.hypotheses.map(
                  (hypothesis, index) => (
                    <article
                      key={
                        hypothesis.problemId
                      }
                      style={{
                        padding: "16px",
                        border:
                          index === 0
                            ? "2px solid #111827"
                            : "1px solid #d1d5db",
                        borderRadius: "10px",
                      }}
                    >
                      <h3>
                        {index + 1}.{" "}
                        {
                          hypothesis.problem
                            .name
                        }
                      </h3>

                      <p>
                        <strong>
                          Probabilité :
                        </strong>{" "}
                        {percentage(
                          hypothesis.score,
                        )}
                      </p>

                      <p>
                        <strong>
                          Confiance :
                        </strong>{" "}
                        {
                          hypothesis.confidenceLevel
                        }
                      </p>

                      <p>
                        Éléments favorables :{" "}
                        {
                          hypothesis
                            .supportingEvidence
                            .length
                        }
                      </p>

                      <p>
                        Éléments défavorables :{" "}
                        {
                          hypothesis
                            .contradictingEvidence
                            .length
                        }
                      </p>

                      {hypothesis
                        .recommendedTestIds
                        .length > 0 && (
                        <p>
                          <strong>
                            Tests proposés :
                          </strong>{" "}
                          {hypothesis.recommendedTestIds.join(
                            ", ",
                          )}
                        </p>
                      )}

                      {hypothesis
                        .requiredPartIds
                        .length > 0 && (
                        <p>
                          <strong>
                            Pièces possibles :
                          </strong>{" "}
                          {hypothesis.requiredPartIds.join(
                            ", ",
                          )}
                        </p>
                      )}
                    </article>
                  ),
                )}
              </div>
            )}
          </section>

          {result.nextQuestion && (
            <section
              style={{
                marginTop: "24px",
                padding: "24px",
                border: "2px solid #111827",
                borderRadius: "12px",
              }}
            >
              <h2>4. Question suivante</h2>

              <p>
                {result.nextQuestion.text}
              </p>

              {result.nextQuestion.reason && (
                <p>
                  <small>
                    {
                      result.nextQuestion
                        .reason
                    }
                  </small>
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    answerQuestion("yes")
                  }
                >
                  Oui
                </button>

                <button
                  type="button"
                  onClick={() =>
                    answerQuestion("no")
                  }
                >
                  Non
                </button>

                <button
                  type="button"
                  onClick={() =>
                    answerQuestion(
                      "unknown",
                    )
                  }
                >
                  Je ne sais pas
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}



