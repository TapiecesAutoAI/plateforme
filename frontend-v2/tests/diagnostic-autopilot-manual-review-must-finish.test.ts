import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticAutopilot,
} from "../engine/reasoning/autopilot/DiagnosticAutopilot";

describe(
  "DiagnosticAutopilot manual review terminal state",
  () => {

    it(
      "must finish when contradictions require manual review",
      () => {

        const autopilot =
          new DiagnosticAutopilot();

        const result =
          autopilot.execute({
            questions: [
              {
                id:
                  "conflict-question",

                family:
                  "conflict",

                diagnosticPower:
                  50,

                discriminates: [
                  "primary",
                  "alternative",
                ],

                estimatedTimeSeconds:
                  5,

                difficulty:
                  1,

                requiresTool:
                  false,
              } as any,
            ],

            answeredFamilies:
              [],

            hypotheses: [
              {
                id:
                  "primary",
                confidence:
                  90,
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
              2,

            contradictionCount:
              3,

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
              20,
          });

        expect(
          result.pipeline
            .decision
            .type,
        ).toBe(
          "manual-review",
        );

        expect(
          result.pipeline
            .decision
            .shouldStop,
        ).toBe(true);

        expect(
          result.guard
            .requireHumanReview,
        ).toBe(true);

        expect(
          result.finished,
        ).toBe(true);
      },
    );

  },
);
