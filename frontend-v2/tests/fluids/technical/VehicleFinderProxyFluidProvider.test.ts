import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  VehicleFinderProxyFluidProvider,
} from "../../../lib/fluids/technical/VehicleFinderProxyFluidProvider";

describe(
  "VehicleFinderProxyFluidProvider",
  () => {

    afterEach(
      () => {

        vi.restoreAllMocks();
      },
    );

    it(
      "calls only the internal TPA API",
      async () => {

        const fetchMock =
          vi.spyOn(
            globalThis,
            "fetch",
          ).mockResolvedValueOnce(
            new Response(
              JSON.stringify({
                status:
                  "not-found",
              }),
              {
                status:
                  200,

                headers: {
                  "Content-Type":
                    "application/json",
                },
              },
            ),
          );

        const provider =
          new VehicleFinderProxyFluidProvider();

        const result =
          await provider.resolve({
            fluidId:
              "engine-oil",

            vehicle: {
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

        expect(
          fetchMock,
        ).toHaveBeenCalledTimes(
          1,
        );

        const call =
          fetchMock.mock.calls[0];

        expect(
          call[0],
        ).toBe(
          "/api/fluids/vehicle-finder",
        );
      },
    );

    it(
      "never requires Vehicle Finder API key client side",
      async () => {

        delete process.env
          .VEHICLE_FINDER_API_KEY;

        vi.spyOn(
          globalThis,
          "fetch",
        ).mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              status:
                "provider-unavailable",
            }),
            {
              status:
                200,

              headers: {
                "Content-Type":
                  "application/json",
              },
            },
          ),
        );

        const provider =
          new VehicleFinderProxyFluidProvider();

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

  },
);