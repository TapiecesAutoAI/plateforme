import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "DiagnosticEngineV2 answerValue action restriction",
  () => {

    it(
      "must reject free values for non VIN actions",
      () => {

        const loader = {
          loadDomain: () => ({
            domain:
              "starting",

            actions: [
              {
                id:
                  "normal-question",

                workflowId:
                  "starting",

                type:
                  "ask-question",

                text:
                  "Question normale",

                audiences: [
                  "particulier",
                ],

                complexity:
                  "simple",

                priority:
                  1,

                options: [
                  {
                    id:
                      "yes",

                    label:
                      "Oui",

                    value:
                      "yes",
                  },
                ],
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
                "normal-question",

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
                  "Question requise.",
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
            "answer-value-non-vin",
            "particulier",
            "starting",
          );

        expect(
          () =>
            engine.answerValue(
              initial.session,
              "starting",
              "normal-question",
              "texte libre",
            ),
        ).toThrow(
          `L'action "normal-question" n'accepte pas de valeur libre.`,
        );

        expect(
          initial.session.actionResults,
        ).toHaveLength(0);

        expect(
          initial.session.vehicle.vin,
        ).toBeNull();
      },
    );
  },
);

