import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fluidTechnicalService,
} from "../../../lib/fluids/technical/FluidTechnicalService";

describe(
  "Castrol + Motul experimental consensus",
  () => {

    it(
      "builds consensus on Golf VII 1.6 TDI",
      async () => {

        const result =
          await fluidTechnicalService.resolve({
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
          "consensus",
        );

        if (
          result.status ===
          "consensus"
        ) {

          expect(
            result.sourceCount,
          ).toBeGreaterThanOrEqual(
            2,
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
            [
              result.specification.viscosity,
              ...(result.specification.alternativeViscosities ?? []),
            ],
          ).toEqual(
            expect.arrayContaining([
              "5W-30",
              "0W-30",
            ]),
          );
        }
      },
    );

  },
);