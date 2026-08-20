import {
  describe,
  expect,
  it,
} from "vitest";

import {
  NextQuestionSelector,
} from "../engine/reasoning/selection/NextQuestionSelector";

import type {
  Question,
} from "../engine/model";

describe(
  "Starting branch useful question preservation",
  () => {

    const selector =
      new NextQuestionSelector();

    const isAllowed = (
      branch: string,
      question: Question,
    ): boolean => {

      return (
        selector as any
      ).isAllowedForBranch(
        question,
        branch,
      );

    };

    const question = (
      id: string,
      text: string,
    ): Question =>
      ({
        id,
        text,
        targetEvidenceIds: [
          "useful-evidence",
        ],
        targetHypothesisIds: [
          "useful-hypothesis",
        ],
      } as Question);

    it(
      "must preserve starter command check after single click",
      () => {

        const candidate =
          question(
            "starting-starter-command-check",
            "Le petit fil de commande du démarreur reçoit-il une tension ?",
          );

        expect(
          isAllowed(
            "single-click",
            candidate,
          ),
        ).toBe(true);

      },
    );

    it(
      "must preserve battery voltage check after rapid clicking",
      () => {

        const candidate =
          question(
            "starting-battery-voltage-known",
            "Avez-vous mesuré la tension de la batterie moteur arrêté ?",
          );

        expect(
          isAllowed(
            "rapid-clicks",
            candidate,
          ),
        ).toBe(true);

      },
    );

    it(
      "must preserve immobilizer check when engine cranks",
      () => {

        const candidate =
          question(
            "starting-immobilizer-question",
            "Un voyant de clé, cadenas ou antivol reste-t-il allumé ou clignote-t-il ?",
          );

        expect(
          isAllowed(
            "engine-cranks",
            candidate,
          ),
        ).toBe(true);

      },
    );

    it(
      "must preserve fuel level check when engine cranks",
      () => {

        const candidate =
          question(
            "starting-fuel-question",
            "Le réservoir contient-il suffisamment de carburant ?",
          );

        expect(
          isAllowed(
            "engine-cranks",
            candidate,
          ),
        ).toBe(true);

      },
    );

    it(
      "must reject fuel pump check when starter spins free",
      () => {

        const candidate =
          question(
            "starting-fuel-pump-sound",
            "Entendez-vous la pompe à carburant ?",
          );

        expect(
          isAllowed(
            "starter-spins",
            candidate,
          ),
        ).toBe(false);

      },
    );

  },
);
