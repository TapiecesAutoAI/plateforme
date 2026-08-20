import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ConfirmationEngineV2,
} from "../engine/confirmation-v2/ConfirmationEngineV2";

describe(
  "ConfirmationEngineV2 immobilizer semantic duplicate",
  () => {
    it(
      "must not ask an immobilizer question when immobilizer evidence is already known",
      () => {
        const engine =
          new ConfirmationEngineV2();

        const hypothesis = {
          id: "problem-immobilizer",
          domainId: "starting",
          name: "Antidémarrage",
          description: "Antidémarrage actif",
          severity: "medium",
          baseScore: 0.5,
          confidence: 0.8,
          supportingEvidenceIds: [
            "observation-immobilizer-warning",
          ],
          contradictingEvidenceIds: [],
          requiredEvidenceIds: [],
          possiblePartIds: [],
          recommendedTestIds: [],
        };

        const question = {
          id: "starting-immobilizer-question-alt",
          domainId: "starting",
          text:
            "Un voyant de clé, cadenas ou antivol reste-t-il allumé ou clignote-t-il ?",
          type: "single_choice",
          purpose: "confirmation",
          targetHypothesisIds: [
            "problem-immobilizer",
          ],
          targetEvidenceIds: [
            "observation-immobilizer-warning",
          ],
          options: [
            {
              id: "yes",
              label: "Oui",
              evidenceId:
                "observation-immobilizer-warning",
            },
            {
              id: "no",
              label: "Non",
              value: false,
            },
          ],
          cost: 1,
        };

        const evidence = {
          id:
            "observation-immobilizer-warning",
          label:
            "Voyant antidémarrage actif",
          description:
            "Un voyant clé ou antivol est actif.",
          status:
            "confirmed",
          confidence:
            1,
          source:
            "user_answer",
        };

        const context = {
          evidences:
            new Map([
              [
                evidence.id,
                evidence,
              ],
            ]),

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
            new Set([
              evidence.id,
            ]),

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
              new Set([
                "immobilizer",
              ]),
            unavailableCapabilities:
              new Set(),
          },
        };

        const probabilities = [
          {
            hypothesis,
            probability: 0.8,
            score: 0.8,
            support: 1,
            contradiction: 0,
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
