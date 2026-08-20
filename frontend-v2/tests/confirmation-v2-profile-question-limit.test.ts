import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ConfirmationEngineV2,
} from "../engine/confirmation-v2/ConfirmationEngineV2";

describe(
  "ConfirmationEngineV2 profile question limit",
  () => {
    it(
      "must not stop at 5 when context allows more questions",
      () => {
        const engine =
          new ConfirmationEngineV2();

        const question = {
          id: "question-test",
          text: "Question test ?",
          cost: 1,
          targetEvidenceIds: [],
          targetHypothesisIds: [
            "problem-test",
          ],

          options: [
            {
              id: "yes",
              label: "Oui",
              addsEvidenceIds: [],
              rejectsEvidenceIds: [],
              supportsHypothesisIds: [],
              rejectsHypothesisIds: [],
            },
            {
              id: "no",
              label: "Non",
              addsEvidenceIds: [],
              rejectsEvidenceIds: [],
              supportsHypothesisIds: [],
              rejectsHypothesisIds: [],
            },
          ],
        };

        const hypothesis = {
          id: "problem-test",
          name: "Hypothèse test",
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
                question.id,
                question,
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
            new Set([
              "q1",
              "q2",
              "q3",
              "q4",
              "q5",
            ]),

          metadata: {},

          progress: {
            answeredQuestionCount: 5,
            maximumQuestionCount: 15,
            currentQuestionId: null,
            failureBranch: "unknown",
            answeredQuestionFamilies:
              new Set(),
            unavailableCapabilities:
              new Set(),
          },
        };

        const probabilities = [
          {
            hypothesis,
            score: 0.8,
            probability: 0.8,
          },
        ];

        const result =
          engine.evaluate(
            context as never,
            [
              question as never,
            ],
            probabilities as never,
          );

        expect(
          result.reason,
        ).not.toBe(
          "Nombre maximal de questions atteint.",
        );
      },
    );
  },
);
