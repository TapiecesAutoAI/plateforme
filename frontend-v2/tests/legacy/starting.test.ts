import {
  describe,
  expect,
  test,
} from "vitest";

import {
  createDiagnosticSession,
} from "../engine/core/sessionTypes";

import {
  KnowledgeLoader,
} from "../engine/knowledge";

import {
  PartRecommendationEngine,
} from "../engine/parts";

import {
  EvidenceExtractor,
  ReasoningEngine,
} from "../engine/reasoning";

describe(
  "Moteur démarrage TaPiècesAuto",
  () => {
    const loader =
      new KnowledgeLoader();

    const extractor =
      new EvidenceExtractor();

    const reasoningEngine =
      new ReasoningEngine();

    const partEngine =
      new PartRecommendationEngine();

    test(
      "extrait les clics rapides et la baisse des phares",
      () => {
        const evidence =
          extractor.extract(
            "Ma voiture ne démarre plus. J’entends plusieurs clics rapides et les phares baissent.",
          );

        const evidenceIds =
          evidence.map(
            (item) =>
              item.id,
          );

        expect(
          evidenceIds,
        ).toContain(
          "symptom-rapid-clicking",
        );

        expect(
          evidenceIds,
        ).toContain(
          "observation-lights-dim",
        );
      },
    );

    test(
      "classe la batterie comme hypothèse principale",
      () => {
        const knowledge =
          loader.loadDomain(
            "starting",
          );

        const session =
          createDiagnosticSession(
            "test-battery",
            "particulier",
          );

        session.evidence = [
          {
            id:
              "symptom-rapid-clicking",

            label:
              "Plusieurs clics rapides",

            source:
              "user-text",

            confidence:
              0.96,

            createdAt:
              new Date().toISOString(),
          },

          {
            id:
              "observation-lights-dim",

            label:
              "Les phares faiblissent",

            source:
              "user-text",

            confidence:
              0.86,

            createdAt:
              new Date().toISOString(),
          },
        ];

        const reasoning =
          reasoningEngine.reason(
            session,
            knowledge,
          );

        expect(
          reasoning.hypotheses[0]
            ?.id,
        ).toBe(
          "problem-weak-battery",
        );

        expect(
          reasoning.hypotheses[0]
            ?.probability,
        ).toBeGreaterThan(
          0.5,
        );
      },
    );

    test(
      "recommande la batterie comme première pièce",
      () => {
        const knowledge =
          loader.loadDomain(
            "starting",
          );

        const session =
          createDiagnosticSession(
            "test-part",
            "particulier",
          );

        session.evidence = [
          {
            id:
              "symptom-rapid-clicking",

            label:
              "Plusieurs clics rapides",

            source:
              "action-answer",

            confidence:
              0.96,

            createdAt:
              new Date().toISOString(),
          },

          {
            id:
              "observation-lights-dim",

            label:
              "Les phares faiblissent",

            source:
              "action-answer",

            confidence:
              0.86,

            createdAt:
              new Date().toISOString(),
          },

          {
            id:
              "observation-jump-start-success",

            label:
              "Le véhicule démarre avec un booster",

            source:
              "action-answer",

            confidence:
              0.97,

            createdAt:
              new Date().toISOString(),
          },
        ];

        session.completedActionIds = [
          "starting-main-behaviour",
          "starting-lights",
          "starting-booster-test",
        ];

        const reasoning =
          reasoningEngine.reason(
            session,
            knowledge,
          );

        const recommendation =
          partEngine.recommend(
            knowledge,
            reasoning,
          );

        expect(
          recommendation.primaryPart
            ?.partName,
        ).toBe(
          "Batterie",
        );

        expect(
          recommendation.confidence,
        ).toBeGreaterThan(
          0.8,
        );
      },
    );
  },
);
