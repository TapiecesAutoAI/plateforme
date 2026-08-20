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
  "Starting no-sound branch filtering",
  () => {

    const selector =
      new NextQuestionSelector();

    const isAllowed = (
      question: Question,
    ): boolean =>
      (
        selector as any
      ).isAllowedForBranch(
        question,
        "no-sound",
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

    it(
      "must reject fuel level when there is no starter sound",
      () => {

        expect(
          isAllowed(
            question(
              "starting-fuel-question",
              "Le réservoir contient-il suffisamment de carburant ?",
            ),
          ),
        ).toBe(false);

      },
    );

    it(
      "must reject fuel pump when there is no starter sound",
      () => {

        expect(
          isAllowed(
            question(
              "starting-fuel-pump-sound",
              "Entendez-vous la pompe à carburant s'amorcer ?",
            ),
          ),
        ).toBe(false);

      },
    );

    it(
      "must preserve starter command check when there is no starter sound",
      () => {

        expect(
          isAllowed(
            question(
              "starting-starter-command-check",
              "Le petit fil de commande du démarreur reçoit-il une tension ?",
            ),
          ),
        ).toBe(true);

      },
    );

    it(
      "must preserve immobilizer check when there is no starter sound",
      () => {

        expect(
          isAllowed(
            question(
              "starting-immobilizer-question",
              "Un voyant de clé, cadenas ou antivol reste-t-il allumé ou clignote-t-il ?",
            ),
          ),
        ).toBe(true);

      },
    );

  },
);
