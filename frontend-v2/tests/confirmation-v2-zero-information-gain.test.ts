import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ConfirmationEngineV2,
} from "../engine/confirmation-v2/ConfirmationEngineV2";

describe(
  "ConfirmationEngineV2 zero information gain",
  () => {
    it(
      "must not request confirmation when the best question has zero information gain",
      () => {
        const engine =
          new ConfirmationEngineV2();

        const hypothesis = {
          id: "problem-test",
          name: "Hypothèse test",
        };

        const question = {
          id: "question-zero-gain",
          text: "Question sans gain ?",
          cost: 0,
          targetEvidenceIds: [],
          targetHypothesisIds: [],
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
            new Set(),

          metadata: {},

          progress: {
            answeredQuestionCount: 1,
            maximumQuestionCount: 5,
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
          result.selectedCandidate,
        ).toBeNull();

        expect(
          result.shouldConfirm,
        ).toBe(false);
      },
    );
  },
);
