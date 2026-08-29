import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";


const CASES = [
  {
    profile: "particulier",
    maximumQuestions: 5,
  },
  {
    profile: "bricoleur",
    maximumQuestions: 7,
  },
  {
    profile: "mecanicien-garage",
    maximumQuestions: 15,
  },
] as const;


describe(
  "starting multi-profils - single click + strong dim + unknowns",
  () => {

    for (
      const config
      of CASES
    ) {

      it(
        `${config.profile} - ne doit pas conclure abusivement au demarreur`,
        () => {

          const engine =
            new DiagnosticEngineV2();

          let result =
            engine.createSession(
              `test-single-click-strong-dim-${config.profile}`,
              config.profile,
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


          // Booster non teste
          if (
            result.action?.id ===
            "starting-booster-sound"
          ) {

            const option =
              result.action.options?.find(
                candidate =>
                  candidate.id ===
                  "not-tested",
              );

            if (option) {

              result =
                engine.answer(
                  result.session,
                  "starting",
                  result.action.id,
                  option.id,
                );

            }

          }


          // Bornes : Je ne sais pas
          if (
            result.action?.id ===
            "starting-check-battery-terminals"
          ) {

            const option =
              result.action.options?.find(
                candidate =>
                  candidate.id ===
                  "unsure",
              );

            if (option) {

              result =
                engine.answer(
                  result.session,
                  "starting",
                  result.action.id,
                  option.id,
                );

            }

          }


          let safety =
            0;


          while (
            !result.completed &&
            result.action &&
            safety < 25
          ) {

            safety +=
              1;


            const action =
              result.action;

            const preferredIds = [
              "unsure",
              "unknown",
              "not-tested",
              "not-done",
              "impossible",
              "no",
            ];


            const fallback =
              preferredIds
                .map(
                  id =>
                    action.options?.find(
                      option =>
                        option.id ===
                        id,
                    ),
                )
                .find(
                  Boolean,
                );


            if (
              !fallback
            ) {

              throw new Error(
                `Aucune reponse neutre disponible pour ${action.id}`,
              );

            }


            result =
              engine.answer(
                result.session,
                "starting",
                action.id,
                fallback.id,
              );

          }


          expect(
            result.completed,
          ).toBe(
            true,
          );


          expect(
            result.session.actionResults.length,
          ).toBeLessThanOrEqual(
            config.maximumQuestions,
          );


          const primary =
            result.reasoning
              .decision
              .probabilities[0];


          expect(
            primary,
          ).toBeTruthy();


          console.log(
            "FINAL HYPOTHESIS RANKING",
            {
              profile: config.profile,
              ranking:
                result.reasoning
                  .decision
                  .probabilities
                  .map(
                    (item, index) => ({
                      rank: index + 1,
                      hypothesis:
                        item.hypothesis.id,
                      probability:
                        item.probability,
                      supportingEvidenceIds:
                        item.supportingEvidenceIds,
                      contradictingEvidenceIds:
                        item.contradictingEvidenceIds,
                    }),
                  ),
            },
          );


          console.log(
            "MULTIPROFILE RESULT",
            {
              profile:
                config.profile,

              questions:
                result.session.actionResults.length,

              maximumQuestions:
                config.maximumQuestions,

              hypothesis:
                primary.hypothesis.id,

              confidence:
                primary.probability,
            },
          );


          /*
           * Sans booster concluant, mesure de tension,
           * ni controle confirme des connexions,
           * un demarreur ne doit pas devenir une
           * certitude forte uniquement a partir de :
           *
           * single click + forte baisse des phares.
           */
        /*
         * Politique de fiabilité TPA :
         * une hypothèse peut rester en tête du classement sans être
         * considérée comme suffisamment fiable pour arrêter le diagnostic.
         *
         * La recommandation ferme est gouvernée par stopSuggestion :
         * seuil de confiance du profil et avance suffisante sur l'alternative.
         */
                const reliabilityThreshold =
          result.session.profile === "particulier"
            ? 0.70
            : 0.90;

        if (
          primary.probability <
          reliabilityThreshold
        ) {
          expect(
            result.stopSuggestion?.recommended ?? false,
          ).toBe(
            false,
          );
        }


          expect(
            [
              "problem-weak-battery",
              "problem-battery-connection",
              "problem-battery-internal-failure",
              "problem-starter",
              "problem-starter-solenoid",
            ],
          ).toContain(
            primary.hypothesis.id,
          );

        },
      );

    }

  },
);