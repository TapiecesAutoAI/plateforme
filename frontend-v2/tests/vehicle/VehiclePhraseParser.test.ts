import {
  describe,
  expect,
  it,
} from "vitest";

import {
  mergeTechnicalVehicle,
  parseVehicleFromText,
} from "../../lib/vehicle/VehiclePhraseParser";

describe(
  "VehiclePhraseParser",
  () => {

    it(
      "extracts Golf IV",
      () => {

        const result =
          parseVehicleFromText(
            "Je veux demonter un cardan d'une Golf 4",
          );

        expect(
          result.make,
        ).toBe(
          "Volkswagen",
        );

        expect(
          result.model,
        ).toBe(
          "Golf",
        );

        expect(
          result.generation,
        ).toBe(
          "IV",
        );
      },
    );

    it(
      "extracts Opel 1.3 Multijet",
      () => {

        const result =
          parseVehicleFromText(
            "Je veux faire une distribution d'une Opel 1.3 Multijet",
          );

        expect(
          result.make,
        ).toBe(
          "Opel",
        );

        expect(
          result.engineName,
        ).toBe(
          "1.3 Multijet",
        );
      },
    );

    it(
      "extracts year",
      () => {

        const result =
          parseVehicleFromText(
            "Golf 4 2002 1.9 TDI",
          );

        expect(
          result.year,
        ).toBe(
          2002,
        );
      },
    );

    it(
      "merges parsed vehicle with stored showroom vehicle",
      () => {

        const result =
          mergeTechnicalVehicle(
            {
              make:
                "Volkswagen",

              model:
                "Golf",

              year:
                2001,

              engineName:
                "1.9 TDI",
            },
            {
              generation:
                "IV",
            },
          );

        expect(
          result.generation,
        ).toBe(
          "IV",
        );

        expect(
          result.engineName,
        ).toBe(
          "1.9 TDI",
        );
      },
    );

  },
);