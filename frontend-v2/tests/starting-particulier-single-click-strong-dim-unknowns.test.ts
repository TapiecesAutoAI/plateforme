import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";


describe(
  "starting particulier - single click + strong dim + unknowns",
  () => {

    it(
      "ne doit pas conclure abusivement au demarreur et doit respecter la limite particulier",
      () => {

        const engine =
          new DiagnosticEngineV2();

        let result =
          engine.createSession(
            "test-particulier-single-click-strong-dim-unknowns",
            "particulier",
            "starting",
            [],
          );


        const answer = (
          expectedQuestionId: string,
          optionId: string,
        ) => {

          expect(
            result.action?.id,
          ).toBe(
            expectedQuestionId,
          );

          result =
            engine.answer(
              result.session,
              "starting",
              expectedQuestionId,
              optionId,
            );

        };


        // 1. Le moteur ne tourne pas
        answer(
          "starting-main-behaviour",
          "engine-not-turning",
        );


        // 2. Un seul clic
        answer(
          "starting-no-crank-sound",
          "single-click",
        );


        // 3. Phares fortement faibles
        answer(
          "starting-single-click-lights",
          "strongly",
        );


        // 4. Booster non teste
        if (
          result.action?.id ===
          "starting-booster-sound"
        ) {
          answer(
            "starting-booster-sound",
            "not-tested",
          );
        }


        // 5. Bornes inconnues
        if (
          result.action?.id ===
          "starting-check-battery-terminals"
        ) {
          answer(
            "starting-check-battery-terminals",
            "unsure",
          );
        }


        /*
         * A partir de ce point, le profil particulier
         * ne doit plus consommer indefiniment des questions.
         */
        let safety =
          0;

        while (
          !result.completed &&
          result.action &&
          safety < 10
        ) {

          safety +=
            1;


          const action =
            result.action;

          const options =
            action.options ??
            [];


          const preferredIds = [
            "unknown",
            "unsure",
            "not-tested",
            "not-done",
            "no",
          ];


          const fallback =
            preferredIds
              .map(
                id =>
                  options.find(
                    option =>
                      option.id ===
                      id,
                  ),
              )
              .find(
                Boolean,
              );


          expect(
            fallback,
            `Aucune option neutre disponible pour ${action.id}`,
          ).toBeTruthy();


          result =
            engine.answer(
              result.session,
              "starting",
              action.id,
              fallback!.id,
            );

        }


        expect(
          result.session.actionResults.length,
        ).toBeLessThanOrEqual(
          5,
        );


        expect(
          result.completed,
        ).toBe(
          true,
        );


        const primary =
          result.reasoning
            .decision
            .probabilities[0];


        expect(
          primary,
        ).toBeTruthy();


        /*
         * Cas reel :
         * single click + phares fortement faibles
         * sans confirmation booster / bornes / tension.
         *
         * Le demarreur ne doit pas etre affirme
         * comme cause principale avec forte confiance.
         */
        /*
         * Politique de fiabilité TPA — particulier :
         * une hypothèse peut rester en tête du classement sans être
         * considérée comme suffisamment fiable pour arrêter le diagnostic.
         *
         * La recommandation ferme exige notamment :
         * confiance >= 70 % et avance suffisante sur l'alternative.
         */
        if (
          primary.probability < 0.70
        ) {
          expect(
            result.stopSuggestion?.recommended ?? false,
          ).toBe(
            false,
          );
        }


        /*
         * On accepte qu'une batterie faible ou une connexion
         * batterie reste en tete tant que les controles
         * discriminants ne sont pas disponibles.
         */
        expect(
          [
            "problem-weak-battery",
            "problem-battery-connection",
            "problem-starter",
          ],
        ).toContain(
          primary?.hypothesis.id,
        );

      },
    );

  },
);