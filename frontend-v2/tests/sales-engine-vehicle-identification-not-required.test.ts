import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SalesEngine,
} from "../engine/sales/SalesEngine";

describe(
  "SalesEngine vehicle identification not required",
  () => {

    it(
      "must allow purchase recommendation when vehicle identification is not required",
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
                  "part-battery-terminal",

                partName:
                  "Cosse de batterie",

                score:
                  0.95,

                rank:
                  1,

                linkedHypothesisIds: [
                  "battery-terminal-failure",
                ],

                reason:
                  "Pièce fortement probable.",
              },

              alternatives:
                [],

              confidence:
                0.95,

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
          result.callToAction,
        ).toBe(
          "identify-vehicle",
        );
      },
    );
  },
);
