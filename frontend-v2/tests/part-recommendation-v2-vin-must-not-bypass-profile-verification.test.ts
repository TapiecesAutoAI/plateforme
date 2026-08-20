import {
  describe,
  expect,
  it,
} from "vitest";

import {
  KnowledgeLoader,
} from "../engine/knowledge";

import {
  PartRecommendationEngineV2,
} from "../engine/parts";

describe(
  "PartRecommendationEngineV2 VIN profile verification isolation",
  () => {

    const reasoning = {
      decision: {
        probabilities: [
          {
            probability:
              0.95,

            score:
              0.95,

            hypothesis: {
              id:
                "problem-alternator-failure",

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
            },
          },
        ],
      },
    } as any;

    it(
      "must keep seller verification even when VIN is validated",
      () => {

        const loader =
          new KnowledgeLoader();

        const engine =
          new PartRecommendationEngineV2();

        const result =
          engine.recommend(
            loader.loadDomain(
              "charging",
            ),
            reasoning,
            "vendeur-pieces-auto",
            true,
          );

        expect(
          result.status,
        ).toBe(
          "recommended",
        );

        expect(
          result.verificationRequired,
        ).toBe(true);
      },
    );

    it(
      "must keep mechanic verification even when VIN is validated",
      () => {

        const loader =
          new KnowledgeLoader();

        const engine =
          new PartRecommendationEngineV2();

        const result =
          engine.recommend(
            loader.loadDomain(
              "charging",
            ),
            reasoning,
            "mecanicien-garage",
            true,
          );

        expect(
          result.status,
        ).toBe(
          "recommended",
        );

        expect(
          result.verificationRequired,
        ).toBe(true);
      },
    );
  },
);
