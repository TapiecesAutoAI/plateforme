import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

describe(
  "CHAT14 real single click unsure trace",
  () => {

    it(
      "traces exact particulier flow",
      () => {

        const engine =
          new DiagnosticEngineV2();

        let result =
          engine.createSession(
            "chat14-real-single-click-unsure",
            "particulier",
            "starting",
            [],
          );

        const trace = (
          label: string,
        ) => {

          console.log(
            `\n========== ${label} ==========`,
          );

          console.log(
            JSON.stringify(
              {
                completed:
                  result.completed,

                status:
                  result.session.status,

                currentActionId:
                  result.session.currentActionId,

                completedActionIds:
                  result.session.completedActionIds,

                evidence:
                  result.session.evidence.map(
                    evidence => evidence.id,
                  ),

                action:
                  result.action
                    ? {
                        id:
                          result.action.id,
                        type:
                          result.action.type,
                        text:
                          result.action.text,
                        options:
                          result.action.options?.map(
                            option => option.id,
                          ) ?? [],
                      }
                    : null,

                conclusion:
                  result.session.conclusion,

                reasoning:
                  result.reasoning,

                stopSuggestion:
                  result.stopSuggestion,

                completionAdvice:
                  result.completionAdvice,
              },
              null,
              2,
            ),
          );
        };

        const answer = (
          expectedActionId: string,
          optionId: string,
        ) => {

          expect(
            result.action?.id,
          ).toBe(
            expectedActionId,
          );

          result =
            engine.answer(
              result.session,
              "starting",
              expectedActionId,
              optionId,
            );
        };

        trace(
          "SESSION CREATED",
        );

        /*
         * 1. "Le moteur ne tourne pas"
         */
        answer(
          "starting-main-behaviour",
          "engine-not-turning",
        );

        trace(
          "AFTER ENGINE NOT TURNING",
        );

        /*
         * 2. "Un seul clic"
         *
         * Le test permanent existant confirme
         * starting-no-crank-sound.
         */
        answer(
          "starting-no-crank-sound",
          "single-click",
        );

        trace(
          "AFTER SINGLE CLICK",
        );

        /*
         * On veut maintenant observer exactement
         * quelle action le moteur expose avant
         * la reponse "Je ne sais pas".
         */
        console.log(
          "\nACTION BEFORE UNSURE:",
          result.action?.id ?? null,
        );

        console.log(
          "OPTIONS BEFORE UNSURE:",
          result.action?.options?.map(
            option => option.id,
          ) ?? [],
        );

        /*
         * Le navigateur affiche la question
         * sur les voyants / phares.
         *
         * On n'invente pas son ID :
         * on exige simplement que l'action
         * propose réellement "unsure".
         */
        expect(
          result.action,
        ).not.toBeNull();

        expect(
          result.action?.options?.some(
            option =>
              option.id === "unsure",
          ),
        ).toBe(true);

        const lightsActionId =
          result.action!.id;

        result =
          engine.answer(
            result.session,
            "starting",
            lightsActionId,
            "unsure",
          );

        trace(
          "AFTER LIGHTS UNSURE",
        );

        console.log(
          "\n========== CRITICAL RESULT ==========",
        );

        console.log(
          JSON.stringify(
            {
              completed:
                result.completed,

              status:
                result.session.status,

              currentActionId:
                result.session.currentActionId,

              nextAction:
                result.action?.id ?? null,

              conclusion:
                result.session.conclusion,

              completionAdvice:
                result.completionAdvice,

              stopSuggestion:
                result.stopSuggestion,
            },
            null,
            2,
          ),
        );

        expect(
          result.session,
        ).toBeDefined();
      },
    );

  },
);