import {
  describe,
  expect,
  test,
} from "vitest";

import {
  PurchaseConfidenceCalculator,
} from "../engine/sales";

describe(
  "Sales Engine",
  () => {
    const calculator =
      new PurchaseConfidenceCalculator();

    test(
      "conseille l'achat à 90 %",
      () => {
        const result =
          calculator.calculate(
            0.90,
          );

        expect(
          result.decision,
        ).toBe(
          "purchase-recommended",
        );

        expect(
          result.risk,
        ).toBe(
          "low",
        );
      },
    );

    test(
      "demande une vérification à 76 %",
      () => {
        const result =
          calculator.calculate(
            0.76,
          );

        expect(
          result.decision,
        ).toBe(
          "verification-required",
        );

        expect(
          result.risk,
        ).toBe(
          "medium",
        );
      },
    );

    test(
      "déconseille l'achat à 43 %",
      () => {
        const result =
          calculator.calculate(
            0.43,
          );

        expect(
          result.decision,
        ).toBe(
          "purchase-not-recommended",
        );

        expect(
          result.risk,
        ).toBe(
          "high",
        );
      },
    );
  },
);
