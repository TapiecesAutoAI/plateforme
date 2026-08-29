import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";


describe(
  "DiagnosticEngineV2 - initial evidence must not prematurely complete",
  () => {

    it(
      "keeps the diagnostic open when initial no-start and strong light drop still leave a useful action",
      () => {

        const engine =
          new DiagnosticEngineV2();

        const created =
          engine.createSession(
            "initial-evidence-no-premature-conclusion",
            "bricoleur",
            "starting",
            [],
          );

        const now =
          new Date().toISOString();

        created.session.evidence.push(
          {
            id:
              "symptom-no-start",

            label:
              "Le vehicule ne demarre pas",

            source:
              "user-text",

            confidence:
              0.88,

            createdAt:
              now,
          },
          {
            id:
              "observation-lights-dim-strongly",

            label:
              "Les phares faiblissent fortement",

            source:
              "user-text",

            confidence:
              0.88,

            createdAt:
              now,
          },
        );

        expect(
          created.session.actionResults.length,
        ).toBe(
          0,
        );

        const result =
          engine.evaluateSession(
            created.session,
            "starting",
          );

        /*
         * Les informations libres du client doivent bien
         * influencer le raisonnement.
         */
        expect(
          result.session.evidence.some(
            evidence =>
              evidence.id ===
              "symptom-no-start",
          ),
        ).toBe(
          true,
        );

        expect(
          result.session.evidence.some(
            evidence =>
              evidence.id ===
              "observation-lights-dim-strongly",
          ),
        ).toBe(
          true,
        );

        /*
         * Mais aucune question n'a encore ete repondue :
         * si une action discriminante reste disponible,
         * le diagnostic ne doit pas etre termine uniquement
         * a cause d'une forte probabilite initiale.
         */
        expect(
          result.action,
        ).not.toBeNull();

        expect(
          result.completed,
        ).toBe(
          false,
        );

        expect(
          result.session.status,
        ).not.toBe(
          "completed",
        );

        /*
         * La question deja couverte par l'information
         * "phares faiblissent fortement" ne doit pas
         * etre reposee.
         */
        expect(
          result.action?.id,
        ).not.toBe(
          "starting-single-click-lights",
        );

        expect(
          result.action?.id,
        ).not.toBe(
          "starting-lights",
        );

      },
    );

  },
);