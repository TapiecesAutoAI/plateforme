import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "Diagnostic confirmation orchestrator fallback",
  () => {

    it(
      "must use orchestrator only when Confirmation V2 has no usable question",
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
          evidences: new Map(),
          hypotheses: new Map([
            [hypothesis.id, hypothesis],
          ]),
          questions: new Map(),
          actions: new Map(),

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
            failureBranch: "unknown",
            answeredQuestionFamilies:
              new Set(),
            unavailableCapabilities:
              new Set(),
            maximumQuestionCount: 5,
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

        const internal =
          engine as any;

        internal.confirmationEngineV2 = {
          evaluate: () => ({
            shouldConfirm: false,
            confidence: 0.8,
            selectedCandidate: null,
            candidates: [],
            metrics: {
              hypothesisCount: 1,
              evidenceCount: 0,
              questionCount: 0,
              averageScore: 0,
              bestScore: 0,
              informationGain: 0,
            },
            reason:
              "confirmation-v2-no-question",
          }),
        };

        internal.confirmationOrchestrator = {
          evaluate: () => ({
            decision: "confirm",
            selectedQuestion: {
              id:
                "starting-fuel-question",
              text:
                "Le réservoir contient-il suffisamment de carburant ?",
            },
            confirmation: {
              confidence: 0.8,
              gain: {
                expectedGain: 0.1,
              },
            },
            reason:
              "orchestrator-fallback",
          }),
        };

        const initial =
          engine.createSession(
            "confirmation-orchestrator-fallback",
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
          result.action?.id,
        ).toBe(
          "starting-fuel-question",
        );
      },
    );
  },
);
