import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticAutopilot,
} from "../engine/reasoning/autopilot/DiagnosticAutopilot";

describe(
  "DiagnosticAutopilot legitimate finished state",
  () => {

    it(
      "must finish when DecisionEngineV3 stops and the guard allows conclusion",
      () => {

        const autopilot =
          new DiagnosticAutopilot();

        const result =
          autopilot.execute({
            questions: [
              {
                id:
                  "low-value-question",

                family:
                  "low-value",

                diagnosticPower:
                  0,

                discriminates:
                  [],

                estimatedTimeSeconds:
                  60,

                difficulty:
                  5,

                requiresTool:
                  true,

                importance:
                  1,

                complexity:
                  1,

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
            .shouldStop,
        ).toBe(true);

        expect(
          result.pipeline
            .decision
            .type,
        ).toBe(
          "conclude",
        );

        expect(
          result.guard
            .allowConclusion,
        ).toBe(true);

        expect(
          result.finished,
        ).toBe(true);
      },
    );

  },
);
