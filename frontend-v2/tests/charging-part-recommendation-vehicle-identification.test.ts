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
  "Charging part recommendation vehicle identification",
  () => {

    it(
      "must require vehicle identification for alternator recommendation from real charging knowledge",
      () => {

        const engine =
          new PartRecommendationEngineV2();

        const hypothesis =
          chargingHypotheses.find(
            item =>
              item.primaryPartId ===
              "part-alternator",
          );

        expect(
          hypothesis,
        ).toBeDefined();

        const knowledge = {
          evidences:
            chargingEvidences,

          hypotheses:
            chargingHypotheses.map(
              item => ({
                ...item,

                possibleParts: [
                  item.primaryPartId,
                  ...item.alternativePartIds,
                ]
                  .filter(
                    (
                      partId,
                    ): partId is string =>
                      partId !== null,
                  )
                  .map(
                    partId =>
                      chargingParts.find(
                        part =>
                          part.id ===
                          partId,
                      )?.name ??
                      partId,
                  ),
              }),
            ),

          parts:
            chargingParts,

          questions:
            chargingQuestions,

          rules:
            chargingRules,
        };

        const reasoning = {
          decision: {
            probabilities: [
              {
                hypothesis: {
                  id:
                    hypothesis!.id,

                  name:
                    hypothesis!.label,

                  possiblePartIds:
                    [],

                  recommendedTestIds:
                    [],

                  supportingEvidenceIds:
                    [],

                  contradictingEvidenceIds:
                    [],
                },

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

        expect(
          result.verificationMessage,
        ).toContain(
          "VIN",
        );
      },
    );
  },
);
