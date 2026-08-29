import {
  describe,
  expect,
  it,
} from "vitest";

import {
  MotulExperimentalFluidProvider,
} from "../../../lib/fluids/technical/MotulExperimentalFluidProvider";

describe(
  "MotulExperimentalFluidProvider",
  () => {

    it(
      "returns Golf VII 1.6 TDI oil data",
      async () => {

        const provider =
          new MotulExperimentalFluidProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              make:
                "Volkswagen",

              model:
                "Golf",

              generation:
                "VII",

              engineName:
                "1.6 TDI",
            },
          });

        expect(
          result.status,
        ).toBe(
          "found",
        );

        if (
          result.status === "found"
        ) {

          expect(
            result.specification.viscosity,
          ).toBe(
            "0W-30",
          );

          expect(
            result.specification.manufacturerSpecification,
          ).toContain(
            "VW 507 00",
          );

          expect(
            result.specification.capacityLitres,
          ).toBe(
            4.7,
          );
        }
      },
    );
  },
);