import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticBrainV1,
} from "../engine/reasoning/brain/DiagnosticBrainV1";

describe(
  "DiagnosticBrainV1 final guarded sale",
  () => {

    it(
      "must not expose sell when DecisionEngineV3 approves but guard blocks the sale",
      () => {

        const brain =
          new DiagnosticBrainV1();

        const result =
          brain.think({
            questions: [
              {
                id:
                  "sale-ready-question",
                family:
                  "sale-ready",
                importance:
                  1,
                complexity:
                  0,
                expectedGain:
                  0,
              } as any,
            ],

            answeredFamilies:
              [],

            hypotheses: [
              {
                id:
                  "primary",
                confidence:
                  100,
              },
            ],

            audience:
              "expert",

            answeredQuestionCount:
              5,

            contradictionCount:
              0,

            similarCases:
              100,

            validatedRepairs:
              100,

            answerQuality:
              100,

            vinValidated:
              false,

            supportingEvidenceCount:
              5,

            alternativeProbability:
              0,
          });

        expect(
          result.decision
            ?.shouldSell,
        ).toBe(true);

        expect(
          result.guard
            ?.allowSell,
        ).toBe(false);

        expect(
          result.prediction
            ?.best
            .recommendation,
        ).not.toBe(
          "sell",
        );
      },
    );
  },
);
