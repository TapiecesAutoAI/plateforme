import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildTpaUiProfile,
  createShowroomKioskSession,
  resolveAuthenticatedTpaSession,
  roleHasPermission,
} from "../../lib/session";

describe(
  "TPA session architecture",
  () => {

    it(
      "creates showroom kiosk session",
      () => {

        const session =
          createShowroomKioskSession({
            deviceId:
              "SHOWROOM-LOB-01",

            storeId:
              "LOB-01",
          });

        expect(
          session.channel,
        ).toBe(
          "showroom-kiosk",
        );

        expect(
          session.role,
        ).toBe(
          "kiosk",
        );

        expect(
          session.permissions,
        ).toContain(
          "request:send-counter",
        );

        expect(
          session.permissions,
        ).not.toContain(
          "pricing:margin",
        );
      },
    );

    it(
      "resolves customer web login",
      () => {

        const session =
          resolveAuthenticatedTpaSession({
            userId:
              "customer-1",

            accountType:
              "customer",
          });

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

        expect(
          session.permissions,
        ).toContain(
          "order:create",
        );

        expect(
          session.permissions,
        ).not.toContain(
          "pricing:margin",
        );
      },
    );

    it(
      "resolves professional login",
      () => {

        const session =
          resolveAuthenticatedTpaSession({
            userId:
              "pro-1",

            accountType:
              "professional",
          });

        expect(
          session.channel,
        ).toBe(
          "professional",
        );

        expect(
          session.permissions,
        ).toContain(
          "diagnostic:advanced",
        );

        expect(
          session.permissions,
        ).toContain(
          "pricing:professional",
        );
      },
    );

    it(
      "resolves counter seller login",
      () => {

        const session =
          resolveAuthenticatedTpaSession({
            userId:
              "seller-1",

            accountType:
              "seller",

            storeId:
              "LOB-01",
          });

        expect(
          session.channel,
        ).toBe(
          "counter",
        );

        expect(
          session.permissions,
        ).toContain(
          "request:receive-counter",
        );

        expect(
          session.permissions,
        ).toContain(
          "pricing:margin",
        );
      },
    );

    it(
      "resolves administrator login",
      () => {

        const session =
          resolveAuthenticatedTpaSession({
            userId:
              "admin-1",

            accountType:
              "administrator",
          });

        expect(
          session.channel,
        ).toBe(
          "admin",
        );

        expect(
          session.permissions,
        ).toContain(
          "admin:configure",
        );
      },
    );

    it(
      "builds kiosk UI profile",
      () => {

        const session =
          createShowroomKioskSession();

        const profile =
          buildTpaUiProfile(
            session,
          );

        expect(
          profile.largeTouchTargets,
        ).toBe(
          true,
        );

        expect(
          profile.showMargins,
        ).toBe(
          false,
        );

        expect(
          profile.showAdminTools,
        ).toBe(
          false,
        );
      },
    );

    it(
      "never gives margin permission to customer",
      () => {

        expect(
          roleHasPermission(
            "customer",
            "pricing:margin",
          ),
        ).toBe(
          false,
        );
      },
    );

  },
);