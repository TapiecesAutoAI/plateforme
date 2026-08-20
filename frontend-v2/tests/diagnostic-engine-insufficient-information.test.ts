import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "DiagnosticEngineV2 insufficient information handling",
  () => {
    it(
      "must not complete when reasoning says insufficient_information",
      () => {
        const hypothesis = {
          id: "problem-test",
          domainId: "starting",
          name: "Hypothèse test",
          description: "Hypothèse test",
          severity: "medium",
          baseScore: 0.5,
          confidence: 0.6,
          supportingEvidenceIds: [],
          contradictingEvidenceIds: [],
          requiredEvidenceIds: [],
          recommendedTestIds: [],
          possiblePartIds: [],
        };

        const context = {
          evidences: new Map(),
          hypotheses: new Map([
            [hypothesis.id, hypothesis],
          ]),
          questions: new Map(),
          actions: new Map(),

          activeHypothesisIds: new Set([
            hypothesis.id,
          ]),
          eliminatedHypothesisIds: new Set(),

          confirmedEvidenceIds: new Set(),
          rejectedEvidenceIds: new Set(),
          completedQuestionIds: new Set(),

          metadata: {},
          progress: {
            answeredQuestionCount: 0,
            currentQuestionId: null,
            failureBranch: "unknown",
            answeredQuestionFamilies:
              new Set(),
            unavailableCapabilities:
              new Set(),
          },
        };

        const reasoningEngine = {
          reasonFromSource: () => ({
            context,

            decision: {
              type:
                "insufficient_information",

              diagnostic: {
                hypothesis,
                confidence: 0.6,
              },

              selectedQuestion:
                null,

              probabilities: [
                {
                  hypothesis,
                  score: 0.6,
                  probability: 0.6,
                },
              ],

              informationGains: [],
              contradictions: [],
              explanation: {
                summary:
                  "Informations insuffisantes.",
              },
            },

            graph: {},
            graphSnapshot: {},
            contextIssues: [],
            graphIssues: [],
          }),
        };

        const engine =
          new DiagnosticEngineV2(
            undefined,
            reasoningEngine as never,
          );

        const result =
          engine.createSession(
            "test-insufficient",
            "particulier",
            "starting",
          );

        expect(
          result.reasoning.decision.type,
        ).toBe(
          "insufficient_information",
        );

        expect(
          result.completed,
        ).toBe(false);

        expect(
          result.action,
        ).toBeNull();
      },
    );
  },
);