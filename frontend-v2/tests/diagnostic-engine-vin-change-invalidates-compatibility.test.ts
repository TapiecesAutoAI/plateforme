import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "DiagnosticEngineV2 VIN change invalidates compatibility",
  () => {

    it(
      "must reset VIN validation when a different VIN is entered",
      () => {

        const loader = {
          loadDomain: () => ({
            domain:
              "starting",

            actions: [
              {
                id:
                  "vehicle-vin",

                workflowId:
                  "starting",

                type:
                  "request-vin",

                text:
                  "Quel est le VIN du véhicule ?",

                audiences: [
                  "particulier",
                ],

                complexity:
                  "simple",

                priority:
                  1,
              },
            ],

            evidences:
              [],

            hypotheses:
              [],

            rules:
              [],

            workflow: {
              id:
                "starting",

              title:
                "Starting",

              entryActionId:
                "vehicle-vin",

              locked:
                false,
            },
          }),
        };

        const reasoningEngine = {
          reasonFromSource: () => ({
            context: {
              evidences:
                new Map(),

              hypotheses:
                new Map(),

              questions:
                new Map(),

              actions:
                new Map(),

              activeHypothesisIds:
                new Set(),

              eliminatedHypothesisIds:
                new Set(),

              confirmedEvidenceIds:
                new Set(),

              rejectedEvidenceIds:
                new Set(),

              completedQuestionIds:
                new Set(),

              progress: {
                answeredQuestionCount:
                  0,
              },
            },

            decision: {
              type:
                "insufficient_information",

              diagnostic: {
                hypothesis:
                  null,

                confidence:
                  0,
              },

              probabilities:
                [],

              selectedQuestion:
                null,

              informationGains:
                [],

              contradictions:
                [],

              explanation: {
                summary:
                  "VIN requis.",
              },
            },

            graph:
              {},

            graphSnapshot:
              {},

            contextIssues:
              [],

            graphIssues:
              [],
          }),
        };

        const engine =
          new DiagnosticEngineV2(
            loader as any,
            reasoningEngine as any,
          );

        const initial =
          engine.createSession(
            "vin-change",
            "particulier",
            "starting",
          );

        engine.answerValue(
          initial.session,
          "starting",
          "vehicle-vin",
          "VF1RFB00612345678",
        );

        engine.confirmVinCompatibility(
          initial.session,
          true,
        );

        expect(
          initial.session.vehicle
            .vinValidated,
        ).toBe(true);

        engine.answerValue(
          initial.session,
          "starting",
          "vehicle-vin",
          "WVWZZZ1JZXW000001",
        );

        expect(
          initial.session.vehicle.vin,
        ).toBe(
          "WVWZZZ1JZXW000001",
        );

        expect(
          initial.session.vehicle
            .vinValidated,
        ).toBe(false);
      },
    );
  },
);

