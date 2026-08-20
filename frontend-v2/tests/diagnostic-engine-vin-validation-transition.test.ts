import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "DiagnosticEngineV2 VIN validation transition",
  () => {

    it(
      "must mark VIN compatibility as validated only after an explicit compatible result",
      () => {

        const engine =
          new DiagnosticEngineV2();

        const session = {
          vehicle: {
            brand: null,
            model: null,
            year: null,
            engine: null,
            fuel: null,
            vin:
              "VF1RFB00612345678",
            vinValidated:
              false,
          },
        } as any;

        const confirm =
          (engine as any)
            .confirmVinCompatibility;

        expect(
          typeof confirm,
        ).toBe(
          "function",
        );

        confirm.call(
          engine,
          session,
          true,
        );

        expect(
          session.vehicle.vinValidated,
        ).toBe(true);
      },
    );

    it(
      "must keep VIN compatibility unvalidated when compatibility is rejected",
      () => {

        const engine =
          new DiagnosticEngineV2();

        const session = {
          vehicle: {
            brand: null,
            model: null,
            year: null,
            engine: null,
            fuel: null,
            vin:
              "VF1RFB00612345678",
            vinValidated:
              false,
          },
        } as any;

        const confirm =
          (engine as any)
            .confirmVinCompatibility;

        expect(
          typeof confirm,
        ).toBe(
          "function",
        );

        confirm.call(
          engine,
          session,
          false,
        );

        expect(
          session.vehicle.vinValidated,
        ).toBe(false);
      },
    );

    it(
      "must refuse compatibility confirmation when no VIN is stored",
      () => {

        const engine =
          new DiagnosticEngineV2();

        const session = {
          vehicle: {
            brand: null,
            model: null,
            year: null,
            engine: null,
            fuel: null,
            vin:
              null,
            vinValidated:
              false,
          },
        } as any;

        const confirm =
          (engine as any)
            .confirmVinCompatibility;

        expect(
          typeof confirm,
        ).toBe(
          "function",
        );

        expect(
          () =>
            confirm.call(
              engine,
              session,
              true,
            ),
        ).toThrow(
          "Impossible de valider la compatibilité sans VIN.",
        );

        expect(
          session.vehicle.vinValidated,
        ).toBe(false);
      },
    );
  },
);
