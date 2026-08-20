import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "Diagnostic confirmation engine priority",
  () => {

    it(
      "must not let two confirmation engines select conflicting questions in the same evaluation",
      () => {

        const hypothesis = {
          id: "problem-test",
          domainId: "starting",
          name: "Hypothèse test",
          description: "Hypothèse test",
          severity: "medium",
          baseScore: 0.8,
          confidence: 0.8,
          supportingEvidenceIds: [],
          contradictingEvidenceIds: [],
          requiredEvidenceIds: [],
          recommendedTestIds: [],
          possiblePartIds: [],
        };

        const context = {
          evidences:
            new Map(),

          hypotheses:
            new Map([
              [
                hypothesis.id,
                hypothesis,
              ],
            ]),

          questions:
            new Map(),

          actions:
            new Map(),

          activeHypothesisIds:
            new Set([
              hypothesis.id,
            ]),

          eliminatedHypothesisIds:
            new Set(),

          confirmedEvidenceIds:
            new Set(),

          rejectedEvidenceIds:
            new Set(),

          completedQuestionIds:
            new Set(),

          metadata: {},

          progress: {
            answeredQuestionCount: 2,
            currentQuestionId: null,
            failureBranch:
              "unknown",
            answeredQuestionFamilies:
              new Set(),
            unavailableCapabilities:
              new Set(),
            maximumQuestionCount:
              5,
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
                confidence:
                  0.8,
              },

              selectedQuestion:
                null,

              probabilities: [
                {
                  hypothesis,
                  score:
                    0.8,
                  probability:
                    0.8,
                },
              ],

              informationGains: [],
              contradictions: [],

              explanation: {
                summary:
                  "Confirmation nécessaire.",
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

        const initial =
          engine.createSession(
            "confirmation-priority-test",
            "particulier",
            "starting",
          );

        const result =
          engine.evaluateSession(
            initial.session,
            "starting",
          );

        expect(
          result.completed,
        ).toBe(false);

        expect(
          result.action,
        ).not.toBeNull();

        expect(
          result.action?.id,
        ).toBeDefined();
      },
    );
  },
);
