import {
  describe,
  expect,
  it,
} from "vitest";

import {
  LocalVehicleIdentityProvider,
} from "../../lib/vehicle/LocalVehicleIdentityProvider";

describe(
  "LocalVehicleIdentityProvider",
  () => {

    it(
      "never invents VIN decoding locally",
      async () => {

        const provider =
          new LocalVehicleIdentityProvider();

        const result =
          await provider.resolveVin(
            "WVWZZZ1JZXW000001",
          );

        expect(
          result.status,
        ).toBe(
          "provider-unavailable",
        );
      },
    );

  },
);