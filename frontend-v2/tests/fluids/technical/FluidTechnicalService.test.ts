import {
  describe,
  expect,
  it,
} from "vitest";

import {
  FluidTechnicalService,
} from "../../../lib/fluids/technical";

import type {
  FluidTechnicalDataProvider,
} from "../../../lib/fluids/technical";

describe(
  "FluidTechnicalService",
  () => {

    it(
      "returns missing vehicle fields from provider",
      async () => {

        const provider:
          FluidTechnicalDataProvider = {

          id:
            "test-provider",

          async resolve() {

            return {
              status:
                "vehicle-required",

              missing: [
                "motorisation",
              ],
            };
          },
        };

        const service =
          new FluidTechnicalService([
            provider,
          ]);

        const result =
          await service.resolve({
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
      },
    );

    it(
      "builds consensus from multiple providers",
      async () => {

        const providerA:
          FluidTechnicalDataProvider = {

          id:
            "a",

          async resolve() {

            return {
              status:
                "found",

              specification: {
                fluidId:
                  "engine-oil",

                viscosity:
                  "5W-30",

                manufacturerSpecification: [
                  "VW 507 00",
                ],

                source:
                  "tecalliance",

                sourceName:
                  "TecAlliance",

                confidence:
                  "verified",
              },
            };
          },
        };

        const providerB:
          FluidTechnicalDataProvider = {

          id:
            "b",

          async resolve() {

            return {
              status:
                "found",

              specification: {
                fluidId:
                  "engine-oil",

                viscosity:
                  "5W-30",

                manufacturerSpecification: [
                  "VW 507 00",
                ],

                source:
                  "manufacturer",

                sourceName:
                  "Castrol",

                confidence:
                  "advisory",
              },
            };
          },
        };

        const service =
          new FluidTechnicalService([
            providerA,
            providerB,
          ]);

        const result =
          await service.resolve({
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
          "consensus",
        );
      },
    );


    it(
      "returns Castrol and Motul consensus for Golf VII 1.6 TDI",
      async () => {

        const {
          fluidTechnicalService,
        } =
          await import(
            "../../../lib/fluids/technical/FluidTechnicalService"
          );

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