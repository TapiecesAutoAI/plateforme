import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ReasoningPipeline,
} from "../engine/reasoning/pipeline/ReasoningPipeline";

describe(
  "ReasoningPipeline sale evidence propagation",
  () => {

    it(
      "must allow DecisionEngineV3 to sell when all sale evidence is sufficient",
      () => {

        const pipeline =
          new ReasoningPipeline();

        const result =
          pipeline.evaluate({
            question: {
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

            hypotheses: [
              {
                id:
                  "primary",

                confidence:
                  100,
              },
            ],

            answeredQuestionCount:
              5,

            contradictionCount:
              0,

            similarCases:
              100,

            validatedRepairs:
              100,

            supportingEvidenceCount:
              5,

            alternativeProbability:
              0,
          } as any);

        expect(
          result.confidence,
        ).toBeGreaterThanOrEqual(
          90,
        );

        expect(
          result.decision.shouldSell,
        ).toBe(true);

        expect(
          result.decision.type,
        ).toBe(
          "sell-part",
        );
      },
    );
  },
);
