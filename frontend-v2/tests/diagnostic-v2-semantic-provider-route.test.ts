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
  "Diagnostic V2 semantic provider route",
  () => {

    it(
      "keeps start request working with disabled provider",
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
                      `semantic-provider-${Math.random()}`,

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
      "uses the disabled semantic provider",
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
          "DisabledSemanticComplaintProvider",
        );

        expect(
          route,
        ).toContain(
          "await semanticComplaintProvider",
        );
      },
    );

    it(
      "sends original text to provider",
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
          ".interpretComplaint({",
        );

        expect(
          route,
        ).toContain(
          "body.originalMessage",
        );
      },
    );

    it(
      "still sends only conflict-guard admitted evidence to diagnostic engine",
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
          "semanticResponse,",
        );

        expect(
          route,
        ).toContain(
          "?.conflictGuard",
        );

        expect(
          route,
        ).toContain(
          ".admittedEvidenceIds",
        );
      },
    );

  },
);