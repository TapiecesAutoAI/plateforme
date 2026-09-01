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
  "Diagnostic V2 complaint orchestrator route",
  () => {

    it(
      "keeps deterministic complaint evidence working through orchestrator",
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
                      `route-orchestrator-${Math.random()}`,

                    profile:
                      "particulier",

                    domain:
                      "starting",

                    evidenceIds:
                      [],

                    message:
                      "un seul clic",

                    originalMessage:
                      "1 clik",

                    deterministicMessage:
                      "un seul clic",
                  }),
              },
            ),
          );

        expect(
          response.status,
        ).toBe(201);

        const data =
          await response.json();

        expect(
          data.session,
        ).toBeDefined();
      },
    );

    it(
      "route consumes admittedEvidenceIds instead of raw semantic evidence",
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
          "understandAutomotiveComplaint",
        );

        expect(
          route,
        ).toContain(
          "conflictGuard",
        );

        expect(
          route,
        ).toContain(
          "admittedEvidenceIds",
        );

        expect(
          route,
        ).not.toContain(
          "complaintInterpretation?.evidenceIds",
        );
      },
    );
    it(
      "uses only the disabled semantic provider",
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

        expect(
          route,
        ).not.toContain(
          "OpenAI",
        );

        expect(
          route,
        ).not.toContain(
          "Anthropic",
        );

        expect(
          route,
        ).not.toContain(
          "Gemini",
        );
      },
    );

  },
);
