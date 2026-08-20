import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SalesEngine,
} from "../engine/sales/SalesEngine";

describe(
  "SalesEngine vehicle identification requirement",
  () => {
    it(
      "must not recommend immediate purchase when vehicle identification is still required",
      () => {
        const engine =
          new SalesEngine();

        const result =
          engine.createRecommendation(
            {
              status:
                "recommended",

              primaryPart: {
                partId:
                  "part-alternator",

                partName:
                  "Alternateur",

                score:
                  0.96,

                rank:
                  1,

                linkedHypothesisIds:
                  [
                    "hypothesis-alternator",
                  ],

                reason:
                  "Alternateur fortement probable.",
              },

              alternatives:
                [],

              confidence:
                0.96,

              verificationRequired:
                true,

              verificationMessage:
                "Confirmer la compatibilité par le VIN ou la référence constructeur.",
            },

            null,
          );

        expect(
          result.confidence.decision,
        ).not.toBe(
          "purchase-recommended",
        );

        expect(
          result.callToAction,
        ).toBe(
          "continue-diagnostic",
        );
      },
    );
  },
);
