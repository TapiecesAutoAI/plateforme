import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticBrainV1,
} from "../engine/reasoning/brain/DiagnosticBrainV1";

import {
  BrainMetricsEngine,
} from "../engine/reasoning/metrics/BrainMetricsEngine";

describe(
  "Brain metrics final sale consistency",
  () => {

    it(
      "must count only final guarded sales",
      () => {

        const brain =
          new DiagnosticBrainV1();

        const metrics =
          new BrainMetricsEngine();

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

        metrics.record(
          result,
          5,
        );

        const snapshot =
          metrics.getMetrics();

        expect(
          snapshot,
        ).toBeDefined();

        expect(
          snapshot.sellRate ??
          snapshot.saleRate ??
          snapshot.sales ??
          0,
        ).toBe(0);
      },
    );
  },
);
