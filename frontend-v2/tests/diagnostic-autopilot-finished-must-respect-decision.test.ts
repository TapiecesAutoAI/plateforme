import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticAutopilot,
} from "../engine/reasoning/autopilot/DiagnosticAutopilot";

describe(
  "DiagnosticAutopilot finished authority",
  () => {

    it(
      "must not finish when DecisionEngineV3 still wants another useful question",
      () => {

        const autopilot =
          new DiagnosticAutopilot();

        const result =
          autopilot.execute({
            questions: [
              {
                id:
                  "high-value-question",

                family:
                  "high-value",

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

                importance:
                  1,

                complexity:
                  0,

                expectedGain:
                  1,
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

              {
                id:
                  "alternative",

                confidence:
                  80,
              },
            ],

            audience:
              "expert",

            profileId:
              "mecanicien-garage",

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
              true,

            supportingEvidenceCount:
              1,

            alternativeProbability:
              50,
          });

expect(
          result.pipeline,
        ).toBeDefined();

        expect(
          result.pipeline
            .decision
            .shouldSell,
        ).toBe(false);

        expect(
          result.pipeline
            .decision
            .shouldStop,
        ).toBe(false);

        expect(
          result.pipeline
            .decision
            .shouldAsk,
        ).toBe(true);

        expect(
          result.guard
            .allowConclusion,
        ).toBe(true);

        expect(
          result.finished,
        ).toBe(false);
      },
    );

  },
);
