import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  VehicleFinderFluidProvider,
} from "../../../lib/fluids/technical/VehicleFinderFluidProvider";

describe(
  "VehicleFinderFluidProvider",
  () => {

    const previousKey =
      process.env
        .VEHICLE_FINDER_API_KEY;

    afterEach(
      () => {

        vi.restoreAllMocks();

        if (
          previousKey === undefined
        ) {

          delete process.env
            .VEHICLE_FINDER_API_KEY;

        } else {

          process.env
            .VEHICLE_FINDER_API_KEY =
              previousKey;
        }
      },
    );

    it(
      "stays unavailable without API key",
      async () => {

        delete process.env
          .VEHICLE_FINDER_API_KEY;

        const provider =
          new VehicleFinderFluidProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              make:
                "Volkswagen",

              model:
                "Golf",
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
      "asks year or VIN for brake fluid when year is unknown",
      async () => {

        process.env
          .VEHICLE_FINDER_API_KEY =
            "test-key";

        const provider =
          new VehicleFinderFluidProvider();

        const result =
          await provider.resolve({
            fluidId:
              "brake-fluid",

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
          "vehicle-required",
        );

        if (
          result.status ===
          "vehicle-required"
        ) {

          expect(
            result.missing,
          ).toContain(
            "annee exacte ou VIN",
          );
        }
      },
    );
    it(
      "rejects generic Golf when TPA knows the engine",
      async () => {

        process.env
          .VEHICLE_FINDER_API_KEY =
            "test-key";

        vi.spyOn(
          globalThis,
          "fetch",
        ).mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: 12440,
                  year: 2017,
                  make: "Volkswagen",
                  model: "Golf",
                  trim: null,
                  engine: null,
                },
              ],
            }),
            {
              status: 200,
              headers: {
                "Content-Type":
                  "application/json",
              },
            },
          ),
        );

        const provider =
          new VehicleFinderFluidProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              year:
                2017,

              make:
                "Volkswagen",

              model:
                "Golf",

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

    it(
      "accepts matching engine and maps real oil response",
      async () => {

        process.env
          .VEHICLE_FINDER_API_KEY =
            "test-key";

        const fetchMock =
          vi.spyOn(
            globalThis,
            "fetch",
          );

        fetchMock
          .mockResolvedValueOnce(
            new Response(
              JSON.stringify({
                data: [
                  {
                    id: 999,
                    year: 2017,
                    make: "Volkswagen",
                    model: "Golf",
                    trim: null,
                    engine: "1.6 TDI",
                  },
                ],
              }),
              {
                status: 200,
                headers: {
                  "Content-Type":
                    "application/json",
                },
              },
            ),
          )
          .mockResolvedValueOnce(
            new Response(
              JSON.stringify({
                data: {
                  vehicle_id: 999,
                  year: 2017,
                  make: "Volkswagen",
                  model: "Golf",
                  trim: null,
                  engine: "1.6 TDI",

                  oil_spec: {
                    viscosity:
                      "5W-30",

                    oil_type:
                      "Full Synthetic",

                    capacity_with_filter:
                      4.7,

                    capacity_without_filter:
                      4.2,

                    oem_spec:
                      "VW 507.00",

                    source:
                      "Curated",

                    last_verified_at:
                      "2026-03-17",
                  },
                },
              }),
              {
                status: 200,
                headers: {
                  "Content-Type":
                    "application/json",
                },
              },
            ),
          );

        const provider =
          new VehicleFinderFluidProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              year:
                2017,

              make:
                "Volkswagen",

              model:
                "Golf",

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
          result.status ===
          "found"
        ) {

          expect(
            result.specification.viscosity,
          ).toBe(
            "5W-30",
          );

          expect(
            result.specification.capacityLitres,
          ).toBe(
            4.7,
          );

          expect(
            result.specification.manufacturerSpecification,
          ).toContain(
            "VW 507.00",
          );
        }
      },
    );

    it(
      "accepts year-level brake fluid even when Vehicle Finder engine is null",
      async () => {

        process.env
          .VEHICLE_FINDER_API_KEY =
            "test-key";

        const fetchMock =
          vi.spyOn(
            globalThis,
            "fetch",
          );

        fetchMock
          .mockResolvedValueOnce(
            new Response(
              JSON.stringify({
                data: [
                  {
                    id: 12440,
                    year: 2017,
                    make: "Volkswagen",
                    model: "Golf",
                    trim: null,
                    engine: null,
                  },
                ],
              }),
              {
                status: 200,
                headers: {
                  "Content-Type":
                    "application/json",
                },
              },
            ),
          )
          .mockResolvedValueOnce(
            new Response(
              JSON.stringify({
                data: {
                  vehicle_id: 12440,
                  year: 2017,
                  make: "Volkswagen",
                  model: "Golf",
                  trim: null,
                  engine: null,

                  transmission_fluid: null,

                  brake_fluid: {
                    dot_type:
                      "DOT 4",

                    change_interval_miles:
                      30000,

                    change_interval_months:
                      null,

                    affiliate_url:
                      null,

                    source:
                      "manufacturer",

                    last_verified_at:
                      "2026-03-17",
                  },

                  coolant: null,

                  power_steering_fluid:
                    null,

                  differential_fluids:
                    [],

                  transfer_case_fluid:
                    null,
                },
              }),
              {
                status: 200,
                headers: {
                  "Content-Type":
                    "application/json",
                },
              },
            ),
          );

        const provider =
          new VehicleFinderFluidProvider();

        const result =
          await provider.resolve({
            fluidId:
              "brake-fluid",

            vehicle: {
              year:
                2017,

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
          result.status ===
          "found"
        ) {

          expect(
            result.specification
              .manufacturerSpecification,
          ).toContain(
            "DOT 4",
          );
        }
      },
    );
    it(
      "rejects different engine",
      async () => {

        process.env
          .VEHICLE_FINDER_API_KEY =
            "test-key";

        vi.spyOn(
          globalThis,
          "fetch",
        ).mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              data: [
                {
                  id: 999,
                  year: 2017,
                  make: "Volkswagen",
                  model: "Golf",
                  trim: null,
                  engine: "1.4 TSI",
                },
              ],
            }),
            {
              status: 200,
              headers: {
                "Content-Type":
                  "application/json",
              },
            },
          ),
        );

        const provider =
          new VehicleFinderFluidProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
              year:
                2017,

              make:
                "Volkswagen",

              model:
                "Golf",

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