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
  DiagnosticResponseBuilder,
} from "../engine/response/DiagnosticResponseBuilder";

import {
  POST as commercialPOST,
} from "../app/api/commercial-demo/route";

function createCommercialRequest(
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
  "Diagnostic -> Commerce real chain E2E",
  () => {

    beforeEach(
      async () => {
        await diagnosticSessionStore.clear();
      },
    );

    it(
      "must build commercial authority from diagnostic and create an order",
      async () => {

        const builder =
          new DiagnosticResponseBuilder();

        const session =
          createDiagnosticSession(
            "REAL-DIAGNOSTIC-COMMERCE-001",
            "particulier",
          );

        session.vehicle = {
          brand:
            "Renault",

          model:
            "Megane",

          year:
            2020,

          engine:
            "1.5 dCi",

          fuel:
            "diesel",

          vin:
            "VF1RFB00612345678",

          vinValidated:
            true,
        };

        session.conclusion = {
          diagnosisId:
            "problem-alternator-failure",

          title:
            "Alternateur defectueux",

          confidence:
            0.95,

          explanation:
            "Alternateur fortement probable.",

          recommendedChecks:
            [],

          possibleParts: [
            "Alternateur",
          ],
        };

        const diagnosticResult = {
          completed:
            true,

          action:
            null,

          session,

          reasoning: {
            decision: {
              probabilities: [
                {
                  probability:
                    0.95,

                  hypothesis: {
                    id:
                      "problem-alternator-failure",

                    name:
                      "Alternateur defectueux",

                    possiblePartIds: [
                      "Alternateur",
                    ],

                    recommendedTestIds:
                      [],

                    supportingEvidenceIds:
                      [],

                    contradictingEvidenceIds:
                      [],
                  },
                },
              ],

              diagnostic: {
                hypothesis: {
                  id:
                    "problem-alternator-failure",

                  name:
                    "Alternateur defectueux",

                  possiblePartIds: [
                    "Alternateur",
                  ],

                  recommendedTestIds:
                    [],

                  supportingEvidenceIds:
                    [],

                  contradictingEvidenceIds:
                    [],
                },

                confidence:
                  0.95,

                explanation:
                  "Alternateur fortement probable.",
              },

              type:
                "conclude",

              selectedQuestion:
                null,

              informationGains:
                [],

              contradictions:
                [],
            },

            context: {
              completedQuestionIds:
                new Set(),

              confirmedEvidenceIds:
                new Set(),

              rejectedEvidenceIds:
                new Set(),

              eliminatedHypothesisIds:
                new Set(),

              progress: {
                answeredQuestionCount:
                  0,
              },
            },

            contextIssues:
              [],

            graphIssues:
              [],

            graphSnapshot:
              {},
          },
        } as any;


        // ====================================================
        // REAL DIAGNOSTIC RESPONSE BUILDER
        //
        // This executes:
        // PartRecommendation -> SalesEngine
        // -> session.commercialAuthorization
        //
        // IMPORTANT:
        // commercialAuthorization is NEVER manually assigned.
        // ====================================================

        const diagnosticResponse =
          builder.build(
            diagnosticResult,
            "charging",
          );


        expect(
          diagnosticResponse
            .partRecommendation
            ?.verificationRequired,
        ).toBe(
          false,
        );

        expect(
          diagnosticResponse
            .salesRecommendation
            .confidence
            .decision,
        ).toBe(
          "purchase-recommended",
        );

        expect(
          session
            .commercialAuthorization
            ?.decision,
        ).toBe(
          "purchase-recommended",
        );

        expect(
          session
            .commercialAuthorization
            ?.partName,
        ).toBe(
          "Alternateur",
        );


        // ====================================================
        // SERVER SESSION PERSISTENCE
        // ====================================================

        await diagnosticSessionStore.save(
          session,
        );

        const storedSession =
          await diagnosticSessionStore.get(
            session.id,
          );

        expect(
          storedSession
            ?.commercialAuthorization
            ?.decision,
        ).toBe(
          "purchase-recommended",
        );

        expect(
          storedSession
            ?.commercialAuthorization
            ?.partName,
        ).toBe(
          "Alternateur",
        );


        // ====================================================
        // REAL COMMERCIAL API
        // ====================================================

        const response =
          await commercialPOST(
            createCommercialRequest({
              mode:
                "order",

              sessionId:
                session.id,

              vin:
                "VF1RFB00612345678",

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


        // ====================================================
        // COMMERCIAL BRIDGE
        // ====================================================

        expect(
          data.ok,
        ).toBe(
          true,
        );

        expect(
          data.diagnosticSessionId,
        ).toBe(
          session.id,
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


        // ====================================================
        // OFFER
        // ====================================================

        expect(
          data.offer.canOrder,
        ).toBe(
          true,
        );

        expect(
          data.offer.offer.reference,
        ).toBe(
          "ALT-DEMO-001",
        );


        // ====================================================
        // ORDER
        // ====================================================

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