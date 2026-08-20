import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SalesEngine,
} from "../engine/sales/SalesEngine";

describe(
  "SalesEngine insufficient confidence consistency",
  () => {

    it(
      "must block purchase even when raw confidence is high",
      () => {

        const engine =
          new SalesEngine();

        const result =
          engine.createRecommendation(
            {
              status:
                "insufficient-confidence",

              primaryPart: {
                partName:
                  "Alternateur",

                score:
                  0.95,

                rank:
                  1,

                linkedHypothesisIds: [
                  "alternator-failure",
                ],

                reason:
                  "Score brut élevé mais diagnostic non sécurisé.",
              },

              alternatives:
                [],

              confidence:
                0.95,

              verificationRequired:
                true,

              verificationMessage:
                "Le diagnostic reste insuffisant.",
            },

            null,
          );

        expect(
          result.confidence.decision,
        ).toBe(
          "purchase-not-recommended",
        );

        expect(
          result.headline,
        ).toBe(
          "❌ Achat non recommandé pour le moment",
        );

        expect(
          result.callToAction,
        ).toBe(
          "request-professional-check",
        );
      },
    );
  },
);
