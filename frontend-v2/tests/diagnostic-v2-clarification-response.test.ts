import {
  describe,
  expect,
  it,
} from "vitest";

import {
  POST,
} from "../app/api/diagnostic-v2/route";

function createStartRequest(
  sessionId:
    string,
): Request {

  return new Request(
    "http://localhost/api/diagnostic-v2",
    {
      method:
        "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          command:
            "start",

          sessionId,

          domain:
            "starting",

          profile:
            "particulier",

          evidenceIds: [],

          message:
            "un seul clic",

          originalMessage:
            "un seul clic",

          deterministicMessage:
            "un seul clic",
        }),
    },
  );
}

describe(
  "diagnostic-v2 clarification response",
  () => {

    it(
      "exposes clarification contract on start response",
      async () => {

        const response =
          await POST(
            createStartRequest(
              crypto.randomUUID(),
            ),
          );

        expect(
          response.status,
        ).toBe(201);

        const body =
          await response.json();

        expect(
          body.clarification,
        ).toEqual({
          required:
            false,

          items: [],

          clarificationToken:
            null,
        });
      },
    );

    it(
      "does not give clarification diagnostic or commerce authority",
      async () => {

        const response =
          await POST(
            createStartRequest(
              crypto.randomUUID(),
            ),
          );

        const body =
          await response.json();

        expect(
          body.clarification,
        ).not.toHaveProperty(
          "diagnosis",
        );

        expect(
          body.clarification,
        ).not.toHaveProperty(
          "part",
        );

        expect(
          body.clarification,
        ).not.toHaveProperty(
          "price",
        );

        expect(
          body.clarification,
        ).not.toHaveProperty(
          "order",
        );
      },
    );

  },
);