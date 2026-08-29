import {
  describe,
  expect,
  it,
} from "vitest";

import {
  CastrolExperimentalFluidProvider,
} from "../../../lib/fluids/technical/CastrolExperimentalFluidProvider";

describe(
  "CastrolExperimentalFluidProvider",
  () => {

    const provider =
      new CastrolExperimentalFluidProvider();

    it(
      "returns experimental Golf VII 1.6 TDI engine oil data",
      async () => {

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
            "5W-30",
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

          expect(
            result.specification.confidence,
          ).toBe(
            "advisory",
          );
        }
      },
    );

    it(
      "does not invent data for another vehicle",
      async () => {

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              make:
                "Opel",

              model:
                "Corsa",

              engineName:
                "1.3 Multijet",
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
      "does not use engine oil data for another fluid",
      async () => {

        const result =
          await provider.resolve({
            fluidId:
              "coolant",

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
          "not-found",
        );
      },
    );
  },
);