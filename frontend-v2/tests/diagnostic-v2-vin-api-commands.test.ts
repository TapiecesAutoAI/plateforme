import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  POST,
} from "../app/api/diagnostic-v2/route";

import {
  diagnosticSessionStore,
} from "../engine/core";

describe(
  "Diagnostic V2 VIN API commands",
  () => {

    const sessionIds = [
      "api-vin-answer-value",
      "api-vin-confirm",
    ];

    afterEach(
      () => {

        for (
          const sessionId
          of sessionIds
        ) {

          const store =
            diagnosticSessionStore as any;

          if (
            typeof store.delete ===
            "function"
          ) {
            store.delete(
              sessionId,
            );
          }
        }
      },
    );

    it(
      "must accept a VIN through answer-value",
      async () => {

        const sessionId =
          "api-vin-answer-value";

        const startRequest =
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

                  sessionId,

                  profile:
                    "particulier",

                  domain:
                    "starting",

                  evidenceIds:
                    [],
                }),
            },
          );

        const startResponse =
          await POST(
            startRequest,
          );

        expect(
          startResponse.status,
        ).toBe(201);

        const session =
          await diagnosticSessionStore.get(
            sessionId,
          );

        expect(
          session,
        ).not.toBeNull();

        const store =
          diagnosticSessionStore as any;

        const storedSession =
          session as any;

        storedSession.pendingAction = {
          id:
            "vehicle-vin",

          workflowId:
            "starting",

          type:
            "request-vin",

          text:
            "Quel est le VIN ?",

          audiences: [
            "particulier",
          ],

          complexity:
            "simple",

          priority:
            1,
        };

        storedSession.currentActionId =
          "vehicle-vin";

        if (
          typeof store.save ===
          "function"
        ) {
          await store.save(
            storedSession,
          );
        }

        const answerRequest =
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
                    "answer-value",

                  sessionId,

                  domain:
                    "starting",

                  actionId:
                    "vehicle-vin",

                  value:
                    "VF1RFB00612345678",
                }),
            },
          );

        const answerResponse =
          await POST(
            answerRequest,
          );

        expect(
          answerResponse.status,
        ).toBe(200);

        const updatedSession =
          await diagnosticSessionStore.get(
            sessionId,
          );

        expect(
          updatedSession
            ?.vehicle.vin,
        ).toBe(
          "VF1RFB00612345678",
        );

        expect(
          updatedSession
            ?.vehicle.vinValidated,
        ).toBe(false);
      },
    );

  },
);
