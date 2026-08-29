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
      "extracts Golf VII 1.6 TDI",
      () => {

        const result =
          parseVehicleFromText(
            "Je veux de l'huile pour ma Golf 7 1.6 TDI",
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
          "VII",
        );

        expect(
          result.engineName,
        ).toBe(
          "1.6 TDI",
        );
      },
    );

    it(
      "tolerates Golf VII 16 TDI without decimal point",
      () => {

        const result =
          parseVehicleFromText(
            "je veux de l'huile pour ma golf 7 16 tdi",
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
          "VII",
        );

        expect(
          result.engineName,
        ).toBe(
          "1.6 TDI",
        );
      },
    );

    it(
      "tolerates customer typo Golf VII 16 RDI",
      () => {

        const result =
          parseVehicleFromText(
            "je veux de l'huile pour ma golf 7 16 rdi",
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
          "VII",
        );

        expect(
          result.engineName,
        ).toBe(
          "1.6 TDI",
        );
      },
    );
    it(
      "extracts Golf VIII",
      () => {

        const result =
          parseVehicleFromText(
            "Volkswagen Golf VIII 2.0 TDI",
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
          "VIII",
        );

        expect(
          result.engineName,
        ).toBe(
          "2.0 TDI",
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
      "normalizes Opel 1.3 CDTI as Multijet family",
      () => {

        const result =
          parseVehicleFromText(
            "Opel Corsa 1.3 CDTI",
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