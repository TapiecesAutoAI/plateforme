import fs from "node:fs";
import path from "node:path";

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

type ScenarioAnswer = {
  actionId: string;
  optionId: string;
};

type ScenarioExpected = {
  primaryHypothesisId?: string;
  primaryPartName?: string;
  purchaseDecision?: string;
  purchaseDecisionNot?: string;
  minimumConfidence?: number;
};

type Scenario = {
  id: string;
  name: string;
  profile:
    | "particulier"
    | "bricoleur"
    | "vendeur-pieces-auto"
    | "mecanicien-garage"
    | "depanneur";
  domain: "starting";
  initialText: string;
  answers: ScenarioAnswer[];
  expected: ScenarioExpected;
};

function loadScenarios(): Scenario[] {
  const filePath =
    path.join(
      process.cwd(),
      "tests",
      "scenarios",
      "starting-scenarios.json",
    );

  const raw =
    fs.readFileSync(
      filePath,
      "utf8",
    );

  const cleanRaw =
    raw.replace(
      /^\uFEFF/,
      "",
    );

  return JSON.parse(
    cleanRaw,
  ) as Scenario[];
}

describe(
  "Scénarios pilotés par données",
  () => {
    const scenarios =
      loadScenarios();

    for (
      const scenario
      of scenarios
    ) {
      test(
        scenario.name,
        () => {
          const diagnosticEngine =
            new DiagnosticEngine();

          const knowledgeLoader =
            new KnowledgeLoader();

          const partEngine =
            new PartRecommendationEngine();

          const salesEngine =
            new SalesEngine();

          let step =
            diagnosticEngine.createSession(
              `scenario-${scenario.id}`,
              scenario.profile,
              scenario.domain,
              scenario.initialText,
            );

          for (
            const answer
            of scenario.answers
          ) {
            expect(
              step.action?.id,
            ).toBe(
              answer.actionId,
            );

            step =
              diagnosticEngine.answer(
                step.session,
                scenario.domain,
                answer.actionId,
                answer.optionId,
              );
          }

          const knowledge =
            knowledgeLoader.loadDomain(
              scenario.domain,
            );

          const partRecommendation =
            step.reasoning
              ? partEngine.recommend(
                  knowledge,
                  step.reasoning,
                )
              : null;

          const salesRecommendation =
            salesEngine.createRecommendation(
              partRecommendation,
              step.explanation,
            );

          if (
            scenario.expected
              .primaryHypothesisId
          ) {
            expect(
              step.reasoning
                ?.confidence.primary
                ?.id,
            ).toBe(
              scenario.expected
                .primaryHypothesisId,
            );
          }

          if (
            scenario.expected
              .primaryPartName
          ) {
            expect(
              partRecommendation
                ?.primaryPart
                ?.partName,
            ).toBe(
              scenario.expected
                .primaryPartName,
            );
          }

          if (
            scenario.expected
              .purchaseDecision
          ) {
            expect(
              salesRecommendation
                .confidence.decision,
            ).toBe(
              scenario.expected
                .purchaseDecision,
            );
          }

          if (
            scenario.expected
              .purchaseDecisionNot
          ) {
            expect(
              salesRecommendation
                .confidence.decision,
            ).not.toBe(
              scenario.expected
                .purchaseDecisionNot,
            );
          }

          if (
            scenario.expected
              .minimumConfidence !==
            undefined
          ) {
            expect(
              salesRecommendation
                .confidence.score,
            ).toBeGreaterThanOrEqual(
              scenario.expected
                .minimumConfidence,
            );
          }
        },
      );
    }
  },
);

