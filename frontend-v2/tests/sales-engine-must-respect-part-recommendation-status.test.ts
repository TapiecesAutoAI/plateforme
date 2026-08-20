import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SalesEngine,
} from "../engine/sales/SalesEngine";

describe(
  "SalesEngine part recommendation status consistency",
  () => {

    it(
      "must not promote verify-before-purchase into purchase-recommended",
      () => {

        const engine =
          new SalesEngine();

        const result =
          engine.createRecommendation(
            {
              status:
                "verify-before-purchase",

              primaryPart: {
                partName:
                  "Démarreur",

                score:
                  0.85,

                rank:
                  1,

                linkedHypothesisIds: [
                  "starter-failure",
                ],

                reason:
                  "Pièce probable mais contrôle complémentaire nécessaire.",
              },

              alternatives:
                [],

              confidence:
                0.85,

              verificationRequired:
                true,

              verificationMessage:
                "Effectuer un contrôle avant achat.",
            },

            null,
          );

        expect(
          result.confidence.decision,
        ).not.toBe(
          "purchase-recommended",
        );

        expect(
          result.headline,
        ).not.toBe(
          "🛒 Pièce recommandée",
        );

        expect(
          result.callToAction,
        ).not.toBe(
          "identify-vehicle",
        );
      },
    );
  },
);
