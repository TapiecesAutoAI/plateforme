import {
  describe,
  expect,
  it,
} from "vitest";

import {
  LocalTechnicalDataProvider,
} from "../../lib/technical/LocalTechnicalDataProvider";

describe(
  "LocalTechnicalDataProvider",
  () => {

    const provider =
      new LocalTechnicalDataProvider();

    it(
      "returns universal wheel tools without vehicle",
      async () => {

        const result =
          await provider.resolveTools({
            operation:
              "wheel-removal",
          });

        expect(
          result.status,
        ).toBe(
          "found",
        );
      },
    );

    it(
      "requires vehicle for timing service",
      async () => {

        const result =
          await provider.resolveTools({
            operation:
              "timing-service",
          });

        expect(
          result.status,
        ).toBe(
          "vehicle-required",
        );
      },
    );

    it(
      "asks for engine and transmission for Golf IV driveshaft",
      async () => {

        const result =
          await provider.resolveTools({
            operation:
              "driveshaft-removal",

            vehicle: {
              make:
                "Volkswagen",

              model:
                "Golf",

              generation:
                "IV",
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
          ).toContain(
            "motorisation",
          );

          expect(
            result.missing,
          ).toContain(
            "boite / transmission",
          );
        }
      },
    );

    it(
      "asks for missing Opel timing identification",
      async () => {

        const result =
          await provider.resolveTools({
            operation:
              "timing-service",

            vehicle: {
              make:
                "Opel",

              engineName:
                "1.3 Multijet",
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
          ).toContain(
            "modele",
          );

          expect(
            result.missing,
          ).toContain(
            "annee",
          );

          expect(
            result.missing,
          ).toContain(
            "code moteur",
          );
        }
      },
    );

    it(
      "does not expose demo Golf IV driveshaft data as verified technical data",
      async () => {

        /*
         * Vehicule volontairement complet :
         * le provider ne doit plus bloquer sur
         * vehicle-required.
         *
         * Il doit ensuite refuser la fiche
         * demo-only et retourner not-found.
         */
        const result =
          await provider.resolveTools({
            operation:
              "driveshaft-removal",

            vehicle: {
              make:
                "Volkswagen",

              model:
                "Golf",

              generation:
                "IV",

              engineName:
                "1.9 TDI",

              transmission:
                "Boite manuelle",
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