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
  "Starting click branch filtering",
  () => {

    const selector =
      new NextQuestionSelector();

    const isAllowed = (
      branch: string,
      question: Question,
    ): boolean =>
      (
        selector as any
      ).isAllowedForBranch(
        question,
        branch,
      );

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

    for (
      const branch
      of [
        "single-click",
        "rapid-clicks",
      ]
    ) {

      it(
        `must preserve battery voltage for ${branch}`,
        () => {

          expect(
            isAllowed(
              branch,
              question(
                "starting-battery-voltage-known",
                "Avez-vous mesuré la tension de la batterie moteur arrêté ?",
              ),
            ),
          ).toBe(true);

        },
      );

      it(
        `must preserve battery terminals for ${branch}`,
        () => {

          expect(
            isAllowed(
              branch,
              question(
                "starting-check-battery-terminals",
                "Les bornes de la batterie sont-elles propres et serrées ?",
              ),
            ),
          ).toBe(true);

        },
      );

      it(
        `must preserve starter command for ${branch}`,
        () => {

          expect(
            isAllowed(
              branch,
              question(
                "starting-starter-command-check",
                "Le petit fil de commande du démarreur reçoit-il une tension ?",
              ),
            ),
          ).toBe(true);

        },
      );

      it(
        `must reject fuel level for ${branch}`,
        () => {

          expect(
            isAllowed(
              branch,
              question(
                "starting-fuel-question",
                "Le réservoir contient-il suffisamment de carburant ?",
              ),
            ),
          ).toBe(false);

        },
      );

      it(
        `must reject fuel pump for ${branch}`,
        () => {

          expect(
            isAllowed(
              branch,
              question(
                "starting-fuel-pump-sound",
                "Entendez-vous la pompe à carburant s'amorcer ?",
              ),
            ),
          ).toBe(false);

        },
      );

    }

  },
);
