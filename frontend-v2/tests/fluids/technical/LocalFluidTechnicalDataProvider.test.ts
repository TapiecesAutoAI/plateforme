import {
  describe,
  expect,
  it,
} from "vitest";

import {
  LocalFluidTechnicalDataProvider,
} from "../../../lib/fluids/technical";

describe(
  "LocalFluidTechnicalDataProvider",
  () => {

    it(
      "asks only for missing vehicle data",
      async () => {

        const provider =
          new LocalFluidTechnicalDataProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              make:
                "Volkswagen",

              model:
                "Golf 7",
            },
          });

        expect(
          result.status,
        ).toBe(
          "vehicle-required",
        );

        if (
          result.status ===
          "vehicle-required"
        ) {

          expect(
            result.missing,
          ).toEqual([
            "motorisation",
          ]);
        }
      },
    );

    it(
      "does not invent specification for identified vehicle",
      async () => {

        const provider =
          new LocalFluidTechnicalDataProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              make:
                "Volkswagen",

              model:
                "Golf 7",

              engineName:
                "1.6 TDI",
            },
          });

        expect(
          result.status,
        ).toBe(
          "not-found",
        );
      },
    );

    it(
      "accepts VIN as vehicle identity path",
      async () => {

        const provider =
          new LocalFluidTechnicalDataProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              vin:
                "WVWZZZ1JZXW000001",
            },
          });

        expect(
          result.status,
        ).toBe(
          "not-found",
        );
      },
    );

  },
);