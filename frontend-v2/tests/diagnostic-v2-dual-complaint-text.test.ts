import {
  describe,
  expect,
  it,
} from "vitest";

import {
  readFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  POST,
} from "../app/api/diagnostic-v2/route";

describe(
  "Diagnostic V2 dual complaint text contract",
  () => {

    it(
      "accepts original and deterministic complaint texts",
      async () => {

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
                      "start",

                    sessionId:
                      `dual-text-${Math.random()}`,

                    profile:
                      "particulier",

                    domain:
                      "starting",

                    evidenceIds:
                      [],

                    message:
                      "un seul clic",

                    originalMessage:
                      "marş basmıyor, j'entends bir clik",

                    deterministicMessage:
                      "un seul clic",
                  }),
              },
            ),
          );

        expect(
          response.status,
        ).toBe(201);
      },
    );

    it(
      "keeps legacy message fallback compatible",
      async () => {

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
                      "start",

                    sessionId:
                      `legacy-message-${Math.random()}`,

                    profile:
                      "particulier",

                    domain:
                      "starting",

                    evidenceIds:
                      [],

                    message:
                      "un seul clic",
                  }),
              },
            ),
          );

        expect(
          response.status,
        ).toBe(201);
      },
    );

    it(
      "page sends original and deterministic messages separately",
      () => {

        const page =
          readFileSync(
            join(
              process.cwd(),
              "app",
              "diagnostic-v2",
              "page.tsx",
            ),
            "utf8",
          );

        expect(
          page,
        ).toContain(
          "originalMessage:",
        );

        expect(
          page,
        ).toContain(
          "deterministicMessage:",
        );

        expect(
          page,
        ).toContain(
          "originalTextOverride",
        );
      },
    );

    it(
      "server matcher uses deterministicMessage",
      () => {

        const route =
          readFileSync(
            join(
              process.cwd(),
              "app",
              "api",
              "diagnostic-v2",
              "route.ts",
            ),
            "utf8",
          );

        expect(
          route,
        ).toContain(
          "body.deterministicMessage.length > 0",
        );

        expect(
          route,
        ).toContain(
          "understandAutomotiveComplaint",
        );

        expect(
          route,
        ).toContain(
          "deterministicText:",
        );

        expect(
          route,
        ).toContain(
          "body.deterministicMessage,",
        );

        expect(
          route,
        ).toContain(
          "admittedEvidenceIds",
        );
      },
    );

  },
);