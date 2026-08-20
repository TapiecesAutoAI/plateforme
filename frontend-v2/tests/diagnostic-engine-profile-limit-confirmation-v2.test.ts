import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "DiagnosticEngineV2 profile limit vs Confirmation V2",
  () => {

    it(
      "must not ask another question after particulier maximumQuestions is reached",
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

        const confirmationQuestion = {
          id: "starting-fuel-question",
          domainId: "starting",
          text:
            "Le réservoir contient-il suffisamment de carburant ?",
          type: "single-choice",
          options: [],
          targetHypothesisIds: [
            hypothesis.id,
          ],
          expectedEvidenceIds: [],
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
            new Map([
              [
                confirmationQuestion.id,
                confirmationQuestion,
              ],
            ]),

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
            answeredQuestionCount: 5,
            currentQuestionId: null,
            failureBranch:
              "engine-cranks",
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
                confidence: 0.8,
              },

              selectedQuestion:
                null,

              probabilities: [
                {
                  hypothesis,
                  score: 0.8,
                  probability: 0.8,
                },
              ],

              informationGains: [],
              contradictions: [],

              explanation: {
                summary:
                  "Confirmation supplémentaire souhaitable.",
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
            "profile-limit-confirmation-v2",
            "particulier",
            "starting",
          );

        initial.session.actionResults =
          Array.from(
            { length: 5 },
            (_, index) => ({
              actionId:
                `action-${index}`,
              optionId:
                "test",
              value:
                "test",
              completedAt:
                `2026-08-13T08:0${index}:00.000Z`,
              addedEvidenceIds: [],
              rejectedEvidenceIds: [],
              supportedHypothesisIds: [],
              rejectedHypothesisIds: [],
            }),
          );

        const result =
          engine.evaluateSession(
            initial.session,
            "starting",
          );

        expect(
          result.session
            .actionResults.length,
        ).toBe(5);

        expect(
          result.action,
        ).toBeNull();

        expect(
          result.completed,
        ).toBe(false);

        expect(
          result.session.status,
        ).toBe(
          "manual-review-required",
        );
      },
    );
  },
);
