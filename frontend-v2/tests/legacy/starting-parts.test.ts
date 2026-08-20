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
  ReasoningEngine,
} from "../engine/reasoning";

function createEvidence(
  id: string,
  label: string,
) {
  return {
    id,
    label,
    source:
      "action-answer" as const,
    confidence:
      0.95,
    createdAt:
      new Date().toISOString(),
  };
}

describe(
  "Recommandations de pièces - démarrage",
  () => {
    const loader =
      new KnowledgeLoader();

    const reasoningEngine =
      new ReasoningEngine();

    const partEngine =
      new PartRecommendationEngine();

    test(
      "recommande le démarreur après booster inefficace, bornes correctes et clic unique",
      () => {
        const knowledge =
          loader.loadDomain(
            "starting",
          );

        const session =
          createDiagnosticSession(
            "test-starter",
            "particulier",
          );

        session.evidence = [
          createEvidence(
            "symptom-rapid-clicking",
            "Plusieurs clics rapides",
          ),

          createEvidence(
            "observation-lights-dim",
            "Les phares faiblissent",
          ),

          createEvidence(
            "observation-jump-start-fails",
            "Le booster ne permet pas de démarrer",
          ),

          createEvidence(
            "observation-battery-terminals-good",
            "Les bornes sont propres",
          ),

          createEvidence(
            "observation-booster-single-click",
            "Un seul clic avec le booster",
          ),
        ];

        session.completedActionIds = [
          "starting-main-behaviour",
          "starting-booster-test",
          "starting-check-battery-terminals",
          "starting-booster-sound",
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
          reasoning.hypotheses[0]
            ?.id,
        ).toBe(
          "problem-starter",
        );

        expect(
          recommendation.primaryPart
            ?.partName,
        ).toBe(
          "Démarreur",
        );

        expect(
          recommendation.confidence,
        ).toBeGreaterThanOrEqual(
          0.85,
        );
      },
    );

    test(
      "recommande le lanceur quand le démarreur tourne sans entraîner le moteur",
      () => {
        const knowledge =
          loader.loadDomain(
            "starting",
          );

        const session =
          createDiagnosticSession(
            "test-starter-drive",
            "particulier",
          );

        session.evidence = [
          createEvidence(
            "symptom-starter-spins-free",
            "Le démarreur tourne dans le vide",
          ),

          createEvidence(
            "observation-starter-spins-without-engine",
            "Le démarreur tourne sans entraîner le moteur",
          ),
        ];

        session.completedActionIds = [
          "starting-sound",
          "starting-confirm-starter-drive",
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
          reasoning.hypotheses[0]
            ?.id,
        ).toBe(
          "problem-starter-drive",
        );

        expect(
          recommendation.primaryPart
            ?.partName,
        ).toBe(
          "Lanceur de démarreur",
        );
      },
    );

    test(
      "ne recommande pas l'achat lorsque deux pièces restent trop proches",
      () => {
        const knowledge =
          loader.loadDomain(
            "starting",
          );

        const session =
          createDiagnosticSession(
            "test-uncertain",
            "particulier",
          );

        session.evidence = [
          createEvidence(
            "symptom-rapid-clicking",
            "Plusieurs clics rapides",
          ),

          createEvidence(
            "observation-jump-start-fails",
            "Le booster ne permet pas de démarrer",
          ),
        ];

        session.completedActionIds = [
          "starting-main-behaviour",
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
          recommendation.status,
        ).not.toBe(
          "recommended",
        );

        expect(
          recommendation.verificationRequired,
        ).toBe(
          true,
        );
      },
    );
  },
);
