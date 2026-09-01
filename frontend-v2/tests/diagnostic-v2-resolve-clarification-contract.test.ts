import {
  describe,
  expect,
  it,
} from "vitest";

import {
  POST,
} from "../app/api/diagnostic-v2/route";

function createRequest(
  body:
    Record<string, unknown>,
): Request {

  return new Request(
    "http://localhost/api/diagnostic-v2",
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
  "diagnostic-v2 resolve clarification request contract",
  () => {

    it(
      "accepts a valid clarification choice at parsing boundary",
      async () => {

        const response =
          await POST(
            createRequest({
              command:
                "resolve-clarification",

              sessionId:
                "missing-contract-session",

              domain:
                "starting",

              choice:
                "confirm",

              clarificationToken:
                "contract-token",
            }),
          );

        expect(
          response.status,
        ).toBe(404);
      },
    );

    it(
      "rejects an invalid clarification choice",
      async () => {

        const response =
          await POST(
            createRequest({
              command:
                "resolve-clarification",

              sessionId:
                "invalid-choice-session",

              domain:
                "starting",

              choice:
                "inject-anything",
            }),
          );

        expect(
          response.status,
        ).toBe(400);

        const body =
          await response.json();

        expect(
          body.error,
        ).toMatch(
          /Choix de clarification invalide/,
        );
      },
    );

    it(
      "rejects a canonical evidence id used as choice",
      async () => {

        const response =
          await POST(
            createRequest({
              command:
                "resolve-clarification",

              sessionId:
                "injection-session",

              domain:
                "starting",

              choice:
                "symptom-single-click",

              evidenceId:
                "observation-battery-voltage-low",
            }),
          );

        expect(
          response.status,
        ).toBe(400);
      },
    );

  },
);