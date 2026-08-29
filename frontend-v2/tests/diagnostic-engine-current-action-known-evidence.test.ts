import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";


describe(
  "DiagnosticEngineV2 - direct next-action known evidence guard",
  () => {

    it(
      "autorise la branche si inconnue et la bloque si son evidence est deja connue",
      () => {

        const engine =
          new DiagnosticEngineV2();


        /*
         * --------------------------------------------------
         * TEMOIN
         * --------------------------------------------------
         *
         * Sans evidence connue sur les phares,
         * currentActionId doit pouvoir imposer
         * starting-single-click-lights.
         */
        const control =
          engine.createSession(
            "current-action-control",
            "bricoleur",
            "starting",
            [],
          );

        control.session.currentActionId =
          "starting-single-click-lights";

        const controlResult =
          engine.evaluateSession(
            control.session,
            "starting",
          );

        expect(
          controlResult.action?.id,
        ).toBe(
          "starting-single-click-lights",
        );


        /*
         * --------------------------------------------------
         * GARDE V5
         * --------------------------------------------------
         *
         * On cree une nouvelle session puis on place
         * directement dans la memoire l'information
         * deja connue :
         *
         * "les phares faiblissent fortement".
         */
        const guarded =
          engine.createSession(
            "current-action-guarded",
            "bricoleur",
            "starting",
            [],
          );

        guarded.session.evidence.push({
          id:
            "observation-lights-dim-strongly",

          label:
            "Les voyants ou les phares faiblissent fortement",

          source:
            "user-text",

          confidence:
            0.88,

          createdAt:
            new Date().toISOString(),
        });

        guarded.session.currentActionId =
          "starting-single-click-lights";


        /*
         * evaluateSession() recharge lui-meme
         * le KnowledgePackage reel puis appelle
         * evaluate().
         */
        const guardedResult =
          engine.evaluateSession(
            guarded.session,
            "starting",
          );


        /*
         * L'action forcee cible une evidence
         * deja confirmee.
         *
         * V5 doit donc l'ignorer.
         */
        expect(
          guardedResult.action?.id,
        ).not.toBe(
          "starting-single-click-lights",
        );


        /*
         * Et l'evidence initiale doit rester
         * presente dans la session.
         */
        expect(
          guardedResult.session.evidence.some(
            evidence =>
              evidence.id ===
              "observation-lights-dim-strongly",
          ),
        ).toBe(
          true,
        );

      },
    );

  },
);