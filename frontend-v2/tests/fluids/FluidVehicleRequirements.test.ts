import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveFluidIntent,
} from "../../lib/fluids";

describe(
  "Fluid vehicle requirements",
  () => {

    it(
      "requires vehicle for engine oil",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux de l'huile moteur",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {

          expect(
            result.record.vehicleRequirement,
          ).toBe(
            "vehicle-required",
          );

          expect(
            result.record.specificationRequired,
          ).toBe(
            true,
          );
        }
      },
    );

    it(
      "requires vehicle for coolant",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux de l'antigel",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {

          expect(
            result.record.vehicleRequirement,
          ).toBe(
            "vehicle-required",
          );
        }
      },
    );

    it(
      "keeps screenwash universal",
      () => {

        const result =
          resolveFluidIntent(
            "Je veux du lave-glace",
          );

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {

          expect(
            result.record.vehicleRequirement,
          ).toBe(
            "universal",
          );

          expect(
            result.record.specificationRequired,
          ).toBe(
            false,
          );
        }
      },
    );

  },
);