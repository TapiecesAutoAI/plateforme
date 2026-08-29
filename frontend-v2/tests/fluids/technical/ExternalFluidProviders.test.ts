import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ManufacturerFluidProvider,
  TecAllianceFluidProvider,
} from "../../../lib/fluids/technical";

describe(
  "External fluid providers",
  () => {

    it(
      "keeps TecAlliance unavailable until configured",
      async () => {

        const provider =
          new TecAllianceFluidProvider();

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
          "provider-unavailable",
        );
      },
    );

    it(
      "does not scrape manufacturer data",
      async () => {

        const provider =
          new ManufacturerFluidProvider(
            "castrol",
          );

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
          "provider-unavailable",
        );
      },
    );

  },
);