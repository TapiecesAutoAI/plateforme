import {
  describe,
  expect,
  it,
} from "vitest";

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
        JSON.stringify(
          body,
        ),
    },
  );
}

describe(
  "commercial-demo diagnostic injection guard",
  () => {

    it(
      "rejects a client supplied diagnostic when sessionId is missing",
      async () => {

        const response =
          await POST(
            createRequest({
              mode:
                "offer",

              vin:
                "WVWZZZ1KZ9W000001",

              compatibilityConfirmed:
                false,

              diagnostic: {
                partRecommendation: {
                  primaryPart: {
                    partName:
                      "Alternateur",
                  },
                },
              },
            }),
          );

        expect(
          response.status,
        ).toBe(
          400,
        );

        const data =
          await response.json();

        expect(
          data.ok,
        ).toBe(
          false,
        );

        expect(
          data.error,
        ).toBe(
          "sessionId est obligatoire pour une offre ou une commande.",
        );
      },
    );

    it(
      "rejects a client supplied diagnostic even when it contains a commercial part",
      async () => {

        const response =
          await POST(
            createRequest({
              mode:
                "order",

              vin:
                "WVWZZZ1KZ9W000001",

              compatibilityConfirmed:
                true,

              quantity:
                1,

              diagnostic: {
                conclusion: {
                  possibleParts: [
                    "Alternateur",
                  ],
                },
              },
            }),
          );

        expect(
          response.status,
        ).toBe(
          400,
        );

        const data =
          await response.json();

        expect(
          data.ok,
        ).toBe(
          false,
        );
      },
    );
  },
);
