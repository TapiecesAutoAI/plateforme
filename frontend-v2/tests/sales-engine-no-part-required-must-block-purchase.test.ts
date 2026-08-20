import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SalesEngine,
} from "../engine/sales/SalesEngine";

describe(
  "SalesEngine no part required consistency",
  () => {

    it(
      "must not recommend or sell a part when technical status is no-part-required",
      () => {

        const engine =
          new SalesEngine();

        const result =
          engine.createRecommendation(
            {
              status:
                "no-part-required",

              primaryPart:
                null,

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
          result.partName,
        ).toBeNull();

        expect(
          result.headline,
        ).toBe(
          "Aucune pièce ne peut encore être conseillée",
        );

        expect(
          result.callToAction,
        ).toBe(
          "continue-diagnostic",
        );

        expect(
          result.confidence.decision,
        ).not.toBe(
          "purchase-recommended",
        );
      },
    );
  },
);
