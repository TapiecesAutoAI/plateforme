import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveToolOperation,
} from "../../lib/tools/ToolOperationResolver";

describe(
  "ToolOperationResolver",
  () => {

    it(
      "classifies oil filter removal as universal",
      () => {

        const result =
          resolveToolOperation(
            "Je veux demonter un filtre a huile",
          );

        expect(
          result.operation,
        ).toBe(
          "oil-filter-removal",
        );

        expect(
          result.kind,
        ).toBe(
          "universal",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          false,
        );
      },
    );

    it(
      "classifies wheel removal as universal",
      () => {

        const result =
          resolveToolOperation(
            "Je veux demonter une roue",
          );

        expect(
          result.operation,
        ).toBe(
          "wheel-removal",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          false,
        );
      },
    );

    it(
      "classifies Golf 4 driveshaft request as vehicle specific",
      () => {

        const result =
          resolveToolOperation(
            "Je veux de l'outillage pour demonter un cardan d'une Golf 4",
          );

        expect(
          result.operation,
        ).toBe(
          "driveshaft-removal",
        );

        expect(
          result.kind,
        ).toBe(
          "vehicle-specific",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          true,
        );
      },
    );

    it(
      "classifies Opel 1.3 Multijet timing request as vehicle specific",
      () => {

        const result =
          resolveToolOperation(
            "Je veux faire une distribution d'une Opel 1.3 Multijet",
          );

        expect(
          result.operation,
        ).toBe(
          "timing-service",
        );

        expect(
          result.kind,
        ).toBe(
          "vehicle-specific",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          true,
        );
      },
    );

    it(
      "classifies timing locking kit request as vehicle specific",
      () => {

        const result =
          resolveToolOperation(
            "Je cherche le bon kit de calage pour Opel 1.3 Multijet",
          );

        expect(
          result.operation,
        ).toBe(
          "timing-locking-tool",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          true,
        );
      },
    );

    it(
      "classifies battery testing as universal",
      () => {

        const result =
          resolveToolOperation(
            "Je veux tester la batterie",
          );

        expect(
          result.operation,
        ).toBe(
          "battery-test",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          false,
        );
      },
    );

    it(
      "classifies tester ma batterie as universal",
      () => {

        const result =
          resolveToolOperation(
            "Je veux tester ma batterie",
          );

        expect(
          result.operation,
        ).toBe(
          "battery-test",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          false,
        );
      },
    );

    it(
      "classifies alternator testing as universal",
      () => {

        const result =
          resolveToolOperation(
            "Je veux controler mon alternateur",
          );

        expect(
          result.operation,
        ).toBe(
          "alternator-test",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          false,
        );
      },
    );

    it(
      "classifies fuse testing as universal",
      () => {

        const result =
          resolveToolOperation(
            "Je veux controler les fusibles",
          );

        expect(
          result.operation,
        ).toBe(
          "fuse-test",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          false,
        );
      },
    );

    it(
      "classifies electrical diagnosis as universal",
      () => {

        const result =
          resolveToolOperation(
            "Je cherche une panne electrique",
          );

        expect(
          result.operation,
        ).toBe(
          "electrical-diagnosis",
        );

        expect(
          result.vehicleRequired,
        ).toBe(
          false,
        );
      },
    );

    it(
      "does not invent a classification for unknown operation",
      () => {

        const result =
          resolveToolOperation(
            "Je veux bricoler quelque chose",
          );

        expect(
          result.operation,
        ).toBe(
          "unknown",
        );

        expect(
          result.kind,
        ).toBe(
          "unknown",
        );
      },
    );

  },
);