import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ReasoningAnalyticsEngine,
} from "../engine/reasoning/analytics/ReasoningAnalyticsEngine";

describe(
  "ReasoningAnalyticsEngine decision sell rate",
  () => {

    it(
      "must measure DecisionEngineV3 sell decisions",
      () => {

        const analytics =
          new ReasoningAnalyticsEngine();

        analytics.record({
          question: {
            id:
              "sale-ready-question",

            diagnosticPower:
              100,

            discriminates: [
              "primary",
            ],

            estimatedTimeSeconds:
              1,

            difficulty:
              1,

            requiresTool:
              false,
          },

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
        });

        const report =
          analytics.getReport();

        expect(
          report,
        ).toHaveLength(1);

        expect(
          report[0]
            .decisionSellRate,
        ).toBe(1);
      },
    );
  },
);
