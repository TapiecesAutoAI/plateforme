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
      method: "POST",

      headers: {
        "content-type":
          "application/json",
      },

      body:
        JSON.stringify(
          body,
        ),
    },
  );
}

describe(
  "commercial-demo session E2E",
  () => {

    beforeEach(
      () => {
        diagnosticSessionStore.clear();
      },
    );

    it(
      "rejects an unknown diagnostic session",
      async () => {

        const response =
          await POST(
            createRequest({
              mode:
                "offer",

              sessionId:
                "SESSION-NOT-FOUND",

              vin:
                "WVWZZZ1KZ9W000001",

              compatibilityConfirmed:
                false,
            }),
          );

        expect(
          response.status,
        ).toBe(
          404,
        );

        const data =
          await response.json();

        expect(
          data.ok,
        ).toBe(
          false,
        );

        expect(
          data.sessionId,
        ).toBe(
          "SESSION-NOT-FOUND",
        );
      },
    );

    it(
      "creates an offer from a stored diagnostic session",
      async () => {

        const session =
          createDiagnosticSession(
            "SESSION-COMMERCE-001",
            "particulier",
          );

        session.conclusion = {
          hypothesisId:
            "alternator-failure",

          hypothesisLabel:
            "Alternateur défectueux",

          confidence:
            0.96,

          possibleParts: [
            "Alternateur",
          ],

          recommendedTests: [],
        } as any;

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

        diagnosticSessionStore.save(
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
          data.diagnosticSessionId,
        ).toBe(
          "SESSION-COMMERCE-001",
        );

        expect(
          data.diagnosticPart.partName,
        ).toBe(
          "Alternateur",
        );

        expect(
          data.diagnosticPart.source,
        ).toBe(
          "sales-recommendation",
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

        expect(
          data.offer.offer.reference,
        ).toBe(
          "ALT-DEMO-001",
        );
      },
    );

    it(
      "creates an order from a stored diagnostic session after compatibility confirmation",
      async () => {

        const session =
          createDiagnosticSession(
            "SESSION-COMMERCE-002",
            "particulier",
          );

        session.conclusion = {
          hypothesisId:
            "alternator-failure",

          hypothesisLabel:
            "Alternateur défectueux",

          confidence:
            0.96,

          possibleParts: [
            "Alternateur",
          ],

          recommendedTests: [],
        } as any;

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

        diagnosticSessionStore.save(
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
                2,
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
          data.diagnosticSessionId,
        ).toBe(
          "SESSION-COMMERCE-002",
        );

        expect(
          data.diagnosticPart.partName,
        ).toBe(
          "Alternateur",
        );

        expect(
          data.offer.canOrder,
        ).toBe(
          true,
        );

        expect(
          data.order.status,
        ).toBe(
          "confirmed",
        );

        expect(
          data.order.lines[0].reference,
        ).toBe(
          "ALT-DEMO-001",
        );

        expect(
          data.order.lines[0].quantity,
        ).toBe(
          2,
        );

        expect(
          data.order.totals.totalExVat,
        ).toBe(
          438,
        );

        expect(
          data.order.totals.vatAmount,
        ).toBe(
          91.98,
        );

        expect(
          data.order.totals.totalIncVat,
        ).toBe(
          529.98,
        );
      },
    );
  },
);
