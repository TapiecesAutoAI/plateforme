import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticBrainV1,
} from "../engine/reasoning/brain/DiagnosticBrainV1";

describe(
  "DiagnosticBrainV1 final sale consistency",
  () => {

    it(
      "must not expose a sell prediction when final guard blocks the sale",
      () => {

        const brain =
          new DiagnosticBrainV1();

        const result =
          brain.think({
            questions: [
              {
                id:
                  "test-question",
                family:
                  "test-family",
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
              1,

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
          });

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
