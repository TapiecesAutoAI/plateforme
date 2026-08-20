import {
  describe,
  expect,
  test,
} from "vitest";

import {
  DiagnosticEngine,
} from "../engine/core";

import {
  KnowledgeLoader,
} from "../engine/knowledge";

import {
  PartRecommendationEngine,
} from "../engine/parts";

import {
  SalesEngine,
} from "../engine/sales";

function createSystem() {
  return {
    diagnosticEngine:
      new DiagnosticEngine(),

    knowledgeLoader:
      new KnowledgeLoader(),

    partEngine:
      new PartRecommendationEngine(),

    salesEngine:
      new SalesEngine(),
  };
}

describe(
  "Parcours complets TaPiècesAuto",
  () => {
    test(
      "batterie : clics rapides, phares faibles, booster efficace",
      () => {
        const {
          diagnosticEngine,
          knowledgeLoader,
          partEngine,
          salesEngine,
        } = createSystem();

        const firstStep =
          diagnosticEngine.createSession(
            "e2e-battery",
            "particulier",
            "starting",
            "Ma voiture ne démarre plus. J’entends plusieurs clics rapides et les phares baissent.",
          );

        expect(
          firstStep.action?.id,
        ).toBe(
          "starting-booster-test",
        );

        const secondStep =
          diagnosticEngine.answer(
            firstStep.session,
            "starting",
            "starting-booster-test",
            "yes",
          );

        expect(
          secondStep.completed,
        ).toBe(
          true,
        );

        expect(
          secondStep.reasoning
            ?.confidence.primary
            ?.id,
        ).toBe(
          "problem-weak-battery",
        );

        const knowledge =
          knowledgeLoader.loadDomain(
            "starting",
          );

        const partRecommendation =
          partEngine.recommend(
            knowledge,
            secondStep.reasoning!,
          );

        const salesRecommendation =
          salesEngine.createRecommendation(
            partRecommendation,
            secondStep.explanation,
          );

        expect(
          partRecommendation.primaryPart
            ?.partName,
        ).toBe(
          "Batterie",
        );

        expect(
          salesRecommendation.confidence
            .decision,
        ).toBe(
          "purchase-recommended",
        );

        expect(
          salesRecommendation.callToAction,
        ).toBe(
          "identify-vehicle",
        );
      },
    );

    test(
      "démarreur : booster inefficace, bornes correctes, clic unique",
      () => {
        const {
          diagnosticEngine,
          knowledgeLoader,
          partEngine,
          salesEngine,
        } = createSystem();

        const firstStep =
          diagnosticEngine.createSession(
            "e2e-starter",
            "particulier",
            "starting",
            "Ma voiture ne démarre plus. J’entends plusieurs clics rapides et les phares baissent.",
          );

        const secondStep =
          diagnosticEngine.answer(
            firstStep.session,
            "starting",
            "starting-booster-test",
            "no",
          );

        expect(
          secondStep.action?.id,
        ).toBe(
          "starting-check-battery-terminals",
        );

        const thirdStep =
          diagnosticEngine.answer(
            secondStep.session,
            "starting",
            "starting-check-battery-terminals",
            "good",
          );

        expect(
          thirdStep.action?.id,
        ).toBe(
          "starting-booster-sound",
        );

        const finalStep =
          diagnosticEngine.answer(
            thirdStep.session,
            "starting",
            "starting-booster-sound",
            "single-click",
          );

        expect(
          finalStep.completed,
        ).toBe(
          true,
        );

        expect(
          finalStep.reasoning
            ?.confidence.primary
            ?.id,
        ).toBe(
          "problem-starter",
        );

        const knowledge =
          knowledgeLoader.loadDomain(
            "starting",
          );

        const partRecommendation =
          partEngine.recommend(
            knowledge,
            finalStep.reasoning!,
          );

        const salesRecommendation =
          salesEngine.createRecommendation(
            partRecommendation,
            finalStep.explanation,
          );

        expect(
          partRecommendation.primaryPart
            ?.partName,
        ).toBe(
          "Démarreur",
        );

        expect(
          salesRecommendation.confidence
            .decision,
        ).toBe(
          "purchase-recommended",
        );
      },
    );

    test(
      "lanceur : démarreur tourne dans le vide puis confirmation",
      () => {
        const {
          diagnosticEngine,
          knowledgeLoader,
          partEngine,
        } = createSystem();

        const firstStep =
          diagnosticEngine.createSession(
            "e2e-drive",
            "particulier",
            "starting",
            "Ma voiture ne démarre pas.",
          );

        expect(
          firstStep.action?.id,
        ).toBe(
          "starting-sound",
        );

        const thirdStep =
          diagnosticEngine.answer(
            firstStep.session,
            "starting",
            "starting-sound",
            "starter-spins-free",
          );

        expect(
          thirdStep.action?.id,
        ).toBe(
          "starting-confirm-starter-drive",
        );

        const finalStep =
          diagnosticEngine.answer(
            thirdStep.session,
            "starting",
            "starting-confirm-starter-drive",
            "yes",
          );

        expect(
          finalStep.completed,
        ).toBe(
          true,
        );

        expect(
          finalStep.reasoning
            ?.confidence.primary
            ?.id,
        ).toBe(
          "problem-starter-drive",
        );

        const knowledge =
          knowledgeLoader.loadDomain(
            "starting",
          );

        const partRecommendation =
          partEngine.recommend(
            knowledge,
            finalStep.reasoning!,
          );

        expect(
          partRecommendation.primaryPart
            ?.partName,
        ).toBe(
          "Lanceur de démarreur",
        );
      },
    );

    test(
      "ne recommande pas l’achat quand la confiance reste insuffisante",
      () => {
        const {
          diagnosticEngine,
          knowledgeLoader,
          partEngine,
          salesEngine,
        } = createSystem();

        const firstStep =
          diagnosticEngine.createSession(
            "e2e-uncertain",
            "particulier",
            "starting",
            "Ma voiture ne démarre pas.",
          );

        const secondStep =
          diagnosticEngine.answer(
            firstStep.session,
            "starting",
            firstStep.action!.id,
            "rapid-clicking",
          );

        const knowledge =
          knowledgeLoader.loadDomain(
            "starting",
          );

        const partRecommendation =
          partEngine.recommend(
            knowledge,
            secondStep.reasoning!,
          );

        const salesRecommendation =
          salesEngine.createRecommendation(
            partRecommendation,
            secondStep.explanation,
          );

        expect(
          salesRecommendation.confidence
            .decision,
        ).not.toBe(
          "purchase-recommended",
        );

        expect(
          salesRecommendation.callToAction,
        ).not.toBe(
          "identify-vehicle",
        );
      },
    );
  },
);

