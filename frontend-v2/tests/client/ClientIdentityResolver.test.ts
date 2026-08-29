import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveCustomerIdByLoginEmail,
} from "../../lib/client/ClientIdentityResolver";

describe(
  "ClientIdentityResolver",
  () => {
    it(
      "maps TPA login account to customer C2",
      () => {
        expect(
          resolveCustomerIdByLoginEmail(
            "client@tpa.be",
          ),
        ).toBe(
          "C2",
        );
      },
    );

    it(
      "normalizes login email",
      () => {
        expect(
          resolveCustomerIdByLoginEmail(
            " CLIENT@TPA.BE ",
          ),
        ).toBe(
          "C2",
        );
      },
    );

    it(
      "returns null for unknown account",
      () => {
        expect(
          resolveCustomerIdByLoginEmail(
            "unknown@tpa.be",
          ),
        ).toBeNull();
      },
    );
  },
);