import {
  describe,
  expect,
  it,
} from "vitest";

import {
  POST,
} from "../app/api/diagnostic-v2/route";

function createStartRequest(
  evidenceIds: string[],
): Request {
  return new Request(
    "http://localhost/api/diagnostic-v2",
    {
      method: "POST",
      headers: {
        "content-type":
          "application/json",
      },
      body:
        JSON.stringify({
          command:
            "start",
          sessionId:
            `canonical-input-${Math.random()}`,
          profile:
            "particulier",
          domain:
            "starting",
          evidenceIds,
        }),
    },
  );
}

describe(
  "Diagnostic V2 canonical evidence input",
  () => {
    it(
      "accepts canonical evidence ids",
      async () => {
        const response =
          await POST(
            createStartRequest([
              "symptom-single-click",
            ]),
          );

        expect(
          response.status,
        ).toBe(201);
      },
    );

    it(
      "rejects legacy evidence ids from the client",
      async () => {
        const response =
          await POST(
            createStartRequest([
              "symptom-single-click-start",
            ]),
          );

        expect(
          response.status,
        ).toBe(400);
      },
    );

    it(
      "rejects arbitrary evidence ids from the client",
      async () => {
        const response =
          await POST(
            createStartRequest([
              "invented-by-browser",
            ]),
          );

        expect(
          response.status,
        ).toBe(400);
      },
    );
  },
);