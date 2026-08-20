import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticAutopilot,
} from "../engine/reasoning/autopilot/DiagnosticAutopilot";

describe(
  "DiagnosticAutopilot sale evidence propagation",
  () => {

    it(
      "must propagate supporting evidence and alternative probability to DecisionEngineV3",
      () => {

        const autopilot =
          new DiagnosticAutopilot();

        const result =
          autopilot.execute({
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
              true,

            supportingEvidenceCount:
              5,

            alternativeProbability:
              0,
          } as any);

        expect(
          result.pipeline,
        ).toBeDefined();

        expect(
          result.pipeline
            .decision
            .shouldSell,
        ).toBe(true);

        expect(
          result.pipeline
            .decision
            .type,
        ).toBe(
          "sell-part",
        );

        expect(
          result.guard
            .allowSell,
        ).toBe(true);
      },
    );

  },
);
