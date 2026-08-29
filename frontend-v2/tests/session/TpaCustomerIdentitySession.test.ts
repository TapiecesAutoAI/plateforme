import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveAuthenticatedTpaSession,
} from "../../lib/session";

describe(
  "TPA customer identity session",
  () => {
    it(
      "keeps customerId in customer session",
      () => {
        const session =
          resolveAuthenticatedTpaSession({
            userId:
              "client-test-001",

            customerId:
              "C2",

            accountType:
              "customer",

            displayName:
              "Client TPA",
          });

        expect(
          session.customerId,
        ).toBe(
          "C2",
        );

        expect(
          session.channel,
        ).toBe(
          "customer-web",
        );

        expect(
          session.role,
        ).toBe(
          "customer",
        );
      },
    );
  },
);