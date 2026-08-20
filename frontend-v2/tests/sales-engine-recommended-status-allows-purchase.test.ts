import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SalesEngine,
} from "../engine/sales/SalesEngine";

describe(
  "SalesEngine recommended status consistency",
  () => {

    it(
      "must allow purchase-recommended when technical status is recommended and confidence is sufficient",
      () => {

        const engine =
          new SalesEngine();

        const result =
          engine.createRecommendation(
            {
              status:
                "recommended",

              primaryPart: {
                partName:
                  "Démarreur",

                score:
                  0.90,

                rank:
                  1,

                linkedHypothesisIds: [
                  "starter-failure",
                ],

                reason:
                  "La pièce est suffisamment confirmée.",
              },

              alternatives:
                [],

              confidence:
                0.90,

              verificationRequired:
                false,

              verificationMessage:
                null,
            },

            null,
          );

        expect(
          result.confidence.decision,
        ).toBe(
          "purchase-recommended",
        );

        expect(
          result.headline,
        ).toBe(
          "🛒 Pièce recommandée",
        );

        expect(
          result.callToAction,
        ).toBe(
          "identify-vehicle",
        );
      },
    );
  },
);
