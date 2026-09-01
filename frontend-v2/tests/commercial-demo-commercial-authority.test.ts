import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  diagnosticSessionStore,
} from "../engine/core";

import {
  createDiagnosticSession,
} from "../engine/core/sessionTypes";

import {
  POST,
} from "../app/api/commercial-demo/route";

function createRequest(
  body: unknown,
): Request {
  return new Request(
    "http://localhost/api/commercial-demo",
    {
      method:
        "POST",

      headers: {
        "content-type":
          "application/json",
      },

      body:
        JSON.stringify(body),
    },
  );
}

describe(
  "commercial-demo commercial authority",
  () => {

    beforeEach(
      async () => {
        await diagnosticSessionStore.clear();
      },
    );

    it(
      "blocks possibleParts when no commercial authority exists",
      async () => {

        const session =
          createDiagnosticSession(
            "AUTHORITY-NONE",
            "particulier",
          );

        session.conclusion = {
          diagnosisId:
            "alternator-failure",

          title:
            "Alternateur défectueux",

          confidence:
            0.99,

          explanation:
            "Hypothèse diagnostic.",

          recommendedChecks:
            [],

          possibleParts: [
            "Alternateur",
          ],
        };

        await diagnosticSessionStore.save(
          session,
        );

        const response =
          await POST(
            createRequest({
              mode:
                "order",

              sessionId:
                session.id,

              vin:
                "WVWZZZ1KZ9W000001",

              compatibilityConfirmed:
                true,

              quantity:
                1,
            }),
          );

        expect(
          response.status,
        ).toBe(
          409,
        );

        const data =
          await response.json();

        expect(
          data.ok,
        ).toBe(
          false,
        );

        expect(
          data.commercialAuthorization,
        ).toBeNull();
      },
    );

    it(
      "blocks verification-required even when compatibility is confirmed",
      async () => {

        const session =
          createDiagnosticSession(
            "AUTHORITY-VERIFY",
            "particulier",
          );

        session.commercialAuthorization = {
          decision:
            "verification-required",

          partName:
            "Alternateur",

          confidence:
            0.85,

          updatedAt:
            new Date().toISOString(),
        };

        await diagnosticSessionStore.save(
          session,
        );

        const response =
          await POST(
            createRequest({
              mode:
                "order",

              sessionId:
                session.id,

              vin:
                "WVWZZZ1KZ9W000001",

              compatibilityConfirmed:
                true,

              quantity:
                1,
            }),
          );

        expect(
          response.status,
        ).toBe(
          409,
        );

        const data =
          await response.json();

        expect(
          data.commercialAuthorization.decision,
        ).toBe(
          "verification-required",
        );
      },
    );

    it(
      "allows offer when authority is purchase-recommended",
      async () => {

        const session =
          createDiagnosticSession(
            "AUTHORITY-OK",
            "particulier",
          );

        session.commercialAuthorization = {
          decision:
            "purchase-recommended",

          partName:
            "Alternateur",

          confidence:
            0.96,

          updatedAt:
            new Date().toISOString(),
        };

        await diagnosticSessionStore.save(
          session,
        );

        const response =
          await POST(
            createRequest({
              mode:
                "offer",

              sessionId:
                session.id,

              vin:
                "WVWZZZ1KZ9W000001",

              compatibilityConfirmed:
                false,
            }),
          );

        expect(
          response.status,
        ).toBe(
          200,
        );

        const data =
          await response.json();

        expect(
          data.ok,
        ).toBe(
          true,
        );

        expect(
          data.diagnosticPart.partName,
        ).toBe(
          "Alternateur",
        );

        expect(
          data.offer.status,
        ).toBe(
          "compatibility-required",
        );

        expect(
          data.offer.canOrder,
        ).toBe(
          false,
        );
      },
    );
  },
);
