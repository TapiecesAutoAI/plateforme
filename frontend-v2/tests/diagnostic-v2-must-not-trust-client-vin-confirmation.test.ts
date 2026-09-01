import {
  describe,
  expect,
  it,
} from "vitest";

import {
  POST,
} from "../app/api/diagnostic-v2/route";

import {
  diagnosticSessionStore,
} from "../engine/core";

describe(
  "Diagnostic V2 VIN trust boundary",
  () => {

    it(
      "must reject client supplied VIN compatibility confirmation",
      async () => {

        const sessionId =
          "vin-client-trust-boundary";

        const startResponse =
          await POST(
            new Request(
              "http://localhost/api/diagnostic-v2",
              {
                method:
                  "POST",

                headers: {
                  "content-type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    command:
                      "start",

                    sessionId,

                    profile:
                      "particulier",

                    domain:
                      "charging",

                    evidenceIds:
                      [],
                  }),
              },
            ),
          );

        expect(
          startResponse.status,
        ).toBe(201);

        const session =
          await diagnosticSessionStore.get(
            sessionId,
          );

        if (!session) {
          throw new Error(
            "Session introuvable.",
          );
        }

        session.vehicle.vin =
          "VF1RFB00612345678";

        session.vehicle.vinValidated =
          false;

        await diagnosticSessionStore.save(
          session,
        );

        const response =
          await POST(
            new Request(
              "http://localhost/api/diagnostic-v2",
              {
                method:
                  "POST",

                headers: {
                  "content-type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    command:
                      "confirm-vin",

                    sessionId,

                    domain:
                      "charging",

                    compatible:
                      true,
                  }),
              },
            ),
          );

        expect(
          response.status,
        ).toBeGreaterThanOrEqual(
          400,
        );

        const updatedSession =
          await diagnosticSessionStore.get(
            sessionId,
          );

        expect(
          updatedSession
            ?.vehicle
            .vinValidated,
        ).toBe(false);
      },
    );
  },
);
