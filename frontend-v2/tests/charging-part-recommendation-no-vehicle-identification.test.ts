import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PartRecommendationEngineV2,
} from "../engine/parts/PartRecommendationEngineV2";

import {
  chargingEvidences,
  chargingHypotheses,
  chargingParts,
  chargingQuestions,
  chargingRules,
} from "../engine/knowledge/charging";

describe(
  "Charging part recommendation without vehicle identification",
  () => {

    it(
      "must not require vehicle identification for a part that does not require it",
      () => {

        const engine =
          new PartRecommendationEngineV2();

        const knowledge = {
          evidences:
            chargingEvidences,

          hypotheses: [
            {
              id:
                "battery-terminal-failure",

              label:
                "Cosse de batterie défectueuse",

              possibleParts: [
                "Cosse de batterie",
              ],
            },
          ],

          parts:
            chargingParts,

          questions:
            chargingQuestions,

          rules:
            chargingRules,
        };

        const hypothesis = {
          id:
            "battery-terminal-failure",

          name:
            "Cosse de batterie défectueuse",

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
                  0.95,

                probability:
                  0.95,
              },
            ],
          },
        };

        const result =
          engine.recommend(
            knowledge as any,
            reasoning as any,
            "particulier",
          );

        expect(
          result.status,
        ).toBe(
          "recommended",
        );

        expect(
          result.primaryPart?.partName,
        ).toBe(
          "Cosse de batterie",
        );

        expect(
          result.verificationRequired,
        ).toBe(false);

        expect(
          result.verificationMessage,
        ).toBeNull();
      },
    );
  },
);
