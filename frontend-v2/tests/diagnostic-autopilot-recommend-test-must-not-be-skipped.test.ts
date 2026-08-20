import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticAutopilot,
} from "../engine/reasoning/autopilot/DiagnosticAutopilot";

describe(
  "DiagnosticAutopilot recommend-test authority",
  () => {

    it(
      "must preserve a required technical test before finishing",
      () => {

        const autopilot =
          new DiagnosticAutopilot();

        const result =
          autopilot.execute({
            questions: [
              {
                id:
                  "low-roi-question",

                family:
                  "technical-check",

                diagnosticPower:
                  5,

                discriminates: [
                  "primary",
                  "alternative",
                ],

                estimatedTimeSeconds:
                  120,

                difficulty:
                  5,

                requiresTool:
                  true,
              } as any,
            ],

            answeredFamilies:
              [],

            hypotheses: [
              {
                id:
                  "primary",

                confidence:
                  70,
              },

              {
                id:
                  "alternative",

                confidence:
                  65,
              },
            ],

            audience:
              "expert",

            profileId:
              "mecanicien-garage",

            answeredQuestionCount:
              2,

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
              2,

            alternativeProbability:
              40,
          });

        expect(
          result.pipeline
            .decision
            .type,
        ).toBe(
          "recommend-test",
        );

        expect(
          result.pipeline
            .decision
            .shouldTest,
        ).toBe(true);

        expect(
          result.guard
            .requireSimpleTest,
        ).toBe(true);

        expect(
          result.guard
            .allowSell,
        ).toBe(false);

        /*
         * Un test demandé est une étape à exécuter,
         * pas une conclusion finale déjà accomplie.
         */
        expect(
          result.finished,
        ).toBe(false);
      },
    );

  },
);
