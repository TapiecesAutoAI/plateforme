import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticAutopilot,
} from "../engine/reasoning/autopilot/DiagnosticAutopilot";

describe(
  "DiagnosticAutopilot final sale authority",
  () => {

    it(
      "must not allow the guard to authorize a sale rejected by DecisionEngineV3",
      () => {

        const autopilot =
          new DiagnosticAutopilot();

        const result =
          autopilot.execute({
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
              true,
          });

        expect(
          result.pipeline,
        ).toBeDefined();

        expect(
          result.pipeline
            .decision
            .shouldSell,
        ).toBe(false);

        /*
         * Règle d'autorité :
         *
         * une couche de sécurité aval peut
         * bloquer une vente autorisée,
         * mais elle ne peut jamais créer
         * une autorisation de vente que
         * DecisionEngineV3 n'a pas donnée.
         */
        expect(
          result.guard.allowSell,
        ).toBe(false);
      },
    );

  },
);