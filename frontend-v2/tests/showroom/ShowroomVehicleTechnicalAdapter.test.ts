import {
  describe,
  expect,
  it,
} from "vitest";

import {
  adaptShowroomVehicleToTechnical,
} from "../../lib/showroom/ShowroomVehicleTechnicalAdapter";

describe(
  "ShowroomVehicleTechnicalAdapter",
  () => {

    it(
      "maps showroom vehicle fields",
      () => {

        const result =
          adaptShowroomVehicleToTechnical({
            brand:
              "Opel",

            model:
              "Corsa",

            year:
              2010,

            engine:
              "1.3 CDTI",

            fuel:
              "Diesel",

            powerHp:
              75,

            powerKw:
              55,
          });

        expect(
          result.make,
        ).toBe(
          "Opel",
        );

        expect(
          result.model,
        ).toBe(
          "Corsa",
        );

        expect(
          result.engineName,
        ).toBe(
          "1.3 CDTI",
        );

        expect(
          result.year,
        ).toBe(
          2010,
        );
      },
    );

    it(
      "keeps VIN from showroom vehicle",
      () => {

        const result =
          adaptShowroomVehicleToTechnical({
            vin:
              "WVWZZZ1JZXW000001",

            brand:
              "Volkswagen",

            model:
              "Golf 4",

            year:
              2001,

            engine:
              "1.9 TDI",
          });

        expect(
          result.vin,
        ).toBe(
          "WVWZZZ1JZXW000001",
        );
      },
    );

    it(
      "infers Golf IV generation from model",
      () => {

        const result =
          adaptShowroomVehicleToTechnical({
            brand:
              "Volkswagen",

            model:
              "Golf 4",

            year:
              2002,

            engine:
              "1.9 TDI",
          });

        expect(
          result.generation,
        ).toBe(
          "IV",
        );
      },
    );

  },
);