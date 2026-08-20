import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "Diagnostic confirmation orchestrator execution",
  () => {

    it(
      "must not call orchestrator when Confirmation V2 already has a usable question",
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

        let orchestratorCalls =
          0;

        internal.confirmationOrchestrator = {
          evaluate: () => {

            orchestratorCalls +=
              1;

            return {
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
                "orchestrator-should-not-run",
            };
          },
        };

        internal.confirmationEngineV2 = {
          evaluate: () => ({
            shouldConfirm: true,
            confidence: 0.8,

            selectedCandidate: {
              question: {
                id:
                  "starting-main-behaviour",
                text:
                  "Que se passe-t-il lorsque vous essayez de démarrer le véhicule ?",
              },

              score: 10,
              informationGain: 0.2,
              branchCompatible: true,
            },

            candidates: [],

            metrics: {
              hypothesisCount: 1,
              evidenceCount: 0,
              questionCount: 1,
              averageScore: 10,
              bestScore: 10,
              informationGain: 0.2,
            },

            reason:
              "confirmation-v2-usable",
          }),
        };

        const initial =
          engine.createSession(
            "confirmation-orchestrator-call-test",
            "particulier",
            "starting",
          );

        orchestratorCalls =
          0;

        const result =
          engine.evaluateSession(
            initial.session,
            "starting",
          );

        expect(
          result.action?.id,
        ).toBe(
          "starting-main-behaviour",
        );

        expect(
          orchestratorCalls,
        ).toBe(0);
      },
    );
  },
);
