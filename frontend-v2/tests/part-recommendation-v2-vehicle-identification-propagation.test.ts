import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PartRecommendationEngineV2,
} from "../engine/parts/PartRecommendationEngineV2";

describe(
  "PartRecommendationEngineV2 vehicle identification propagation",
  () => {

    it(
      "must require vehicle identification when the recommended part requires it",
      () => {

        const engine =
          new PartRecommendationEngineV2();

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
          "Alternateur",
        );

        expect(
          result.verificationRequired,
        ).toBe(true);
      },
    );
  },
);
