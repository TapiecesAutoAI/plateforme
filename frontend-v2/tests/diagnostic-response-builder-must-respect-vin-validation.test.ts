import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticResponseBuilder,
} from "../engine/response/DiagnosticResponseBuilder";

import {
  createDiagnosticSession,
} from "../engine/core/sessionTypes";

describe(
  "DiagnosticResponseBuilder VIN validation consistency",
  () => {

    it(
      "must not expose purchase-ready recommendation when VIN compatibility is not validated",
      () => {

        const builder =
          new DiagnosticResponseBuilder();

        const session =
          createDiagnosticSession(
            "response-vin-test",
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
            false,
        };

        session.conclusion = {
          diagnosisId:
            "alternator-failure",

          title:
            "Alternateur défectueux",

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

        const result = {
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
                      "alternator-failure",

                    name:
                      "Alternateur défectueux",

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
                    "alternator-failure",

                  name:
                    "Alternateur défectueux",

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

        const response =
          builder.build(
            result,
            "charging",
          );

        expect(
          response.partRecommendation
            ?.verificationRequired,
        ).toBe(true);

        expect(
          response.salesRecommendation
            .confidence
            .decision,
        ).not.toBe(
          "purchase-recommended",
        );
      },
    );
  },
);
