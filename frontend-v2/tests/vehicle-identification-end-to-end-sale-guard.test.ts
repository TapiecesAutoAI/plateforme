import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PartRecommendationEngineV2,
} from "../engine/parts/PartRecommendationEngineV2";

import {
  SalesEngine,
} from "../engine/sales/SalesEngine";

import {
  DiagnosticGuardEngine,
} from "../engine/reasoning/guard/DiagnosticGuardEngine";

describe(
  "Vehicle identification end-to-end sale guard",
  () => {

    it(
      "must block sale end-to-end until VIN compatibility is validated",
      () => {

        const partEngine =
          new PartRecommendationEngineV2();

        const salesEngine =
          new SalesEngine();

        const guardEngine =
          new DiagnosticGuardEngine();

        const knowledge = {
          hypotheses: [
            {
              id:
                "alternator-failure",

              possibleParts: [
                "Alternateur",
              ],
            },
          ],

          parts: [
            {
              id:
                "part-alternator",

              name:
                "Alternateur",

              requiresVehicleIdentification:
                true,
            },
          ],
        };

        const hypothesis = {
          id:
            "alternator-failure",

          name:
            "Alternateur défectueux",

          possiblePartIds:
            [],

          recommendedTestIds:
            [],

          supportingEvidenceIds:
            [],

          contradictingEvidenceIds:
            [],
        };

        const reasoning = {
          decision: {
            probabilities: [
              {
                hypothesis,
                score:
                  0.96,

                probability:
                  0.96,
              },
            ],
          },
        };

        const partRecommendation =
          partEngine.recommend(
            knowledge as any,
            reasoning as any,
            "particulier",
          );

        expect(
          partRecommendation.status,
        ).toBe(
          "recommended",
        );

        expect(
          partRecommendation.verificationRequired,
        ).toBe(true);

        const salesRecommendation =
          salesEngine.createRecommendation(
            partRecommendation as any,
            null,
          );

        expect(
          salesRecommendation.confidence.decision,
        ).not.toBe(
          "purchase-recommended",
        );

        expect(
          salesRecommendation.callToAction,
        ).toBe(
          "continue-diagnostic",
        );

        const guardBeforeVin =
          guardEngine.evaluate({
            confidence:
              96,

            trustScore:
              95,

            answerQuality:
              95,

            contradictionCount:
              0,

            similarCases:
              30,

            validatedRepairs:
              30,

            vinValidated:
              false,
          });

        expect(
          guardBeforeVin.allowSell,
        ).toBe(false);

        const guardAfterVin =
          guardEngine.evaluate({
            confidence:
              96,

            trustScore:
              95,

            answerQuality:
              95,

            contradictionCount:
              0,

            similarCases:
              30,

            validatedRepairs:
              30,

            vinValidated:
              true,
          });

        expect(
          guardAfterVin.allowSell,
        ).toBe(true);
      },
    );
  },
);
