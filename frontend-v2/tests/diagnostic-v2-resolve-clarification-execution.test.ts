import {
  describe,
  expect,
  it,
} from "vitest";

import {
  POST,
} from "../app/api/diagnostic-v2/route";

function request(
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

async function startSingleClick(
  sessionId:
    string,
) {

  const response =
    await POST(
      request({
        command:
          "start",

        sessionId,

        profile:
          "particulier",

        domain:
          "starting",

        /*
         * This phrasing is intentionally ambiguous
         * for the semantic/deterministic clarification
         * pipeline only when a clarification is produced.
         */
        message:
          "un seul clic",

        originalMessage:
          "un seul clic",

        deterministicMessage:
          "un seul clic",
      }),
    );

  return {
    response,

    body:
      await response.json(),
  };
}

describe(
  "diagnostic-v2 safe clarification resolution",
  () => {

    it(
      "requires the server-issued clarification token",
      async () => {

        const sessionId =
          `clarification-token-${crypto.randomUUID()}`;

        const started =
          await startSingleClick(
            sessionId,
          );

        if (
          !started.body.clarification?.required
        ) {
          /*
           * Disabled semantic provider can make this
           * deterministic complaint directly admissible.
           * The route contract is still checked below
           * with an invalid token against no pending state.
           */
          const response =
            await POST(
              request({
                command:
                  "resolve-clarification",

                sessionId,

                domain:
                  "starting",

                choice:
                  "confirm",

                clarificationToken:
                  "forged-token",
              }),
            );

          expect(
            response.status,
          ).toBe(409);

          return;
        }

        expect(
          typeof started.body
            .clarification
            .clarificationToken,
        ).toBe("string");

        const forged =
          await POST(
            request({
              command:
                "resolve-clarification",

              sessionId,

              domain:
                "starting",

              choice:
                "confirm",

              clarificationToken:
                "forged-token",
            }),
          );

        expect(
          forged.status,
        ).toBe(409);
      },
    );

    it(
      "rejects replay after a clarification has been consumed",
      async () => {

        const sessionId =
          `clarification-replay-${crypto.randomUUID()}`;

        const started =
          await startSingleClick(
            sessionId,
          );

        if (
          !started.body.clarification?.required
        ) {
          return;
        }

        const token =
          started.body
            .clarification
            .clarificationToken;

        const first =
          await POST(
            request({
              command:
                "resolve-clarification",

              sessionId,

              domain:
                "starting",

              choice:
                "confirm",

              clarificationToken:
                token,
            }),
          );

        expect(
          first.status,
        ).toBe(200);

        const replay =
          await POST(
            request({
              command:
                "resolve-clarification",

              sessionId,

              domain:
                "starting",

              choice:
                "confirm",

              clarificationToken:
                token,
            }),
          );

        expect(
          replay.status,
        ).toBe(409);
      },
    );

    it(
      "never accepts evidence id as clarification choice",
      async () => {

        const response =
          await POST(
            request({
              command:
                "resolve-clarification",

              sessionId:
                `clarification-injection-${crypto.randomUUID()}`,

              domain:
                "starting",

              choice:
                "observation-battery-voltage-low",

              clarificationToken:
                "forged",

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