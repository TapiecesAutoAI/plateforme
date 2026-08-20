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
  "Starting engine-cranks branch filtering",
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
        "engine-cranks",
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
      "must preserve fuel level",
      () => {

        expect(
          isAllowed(
            question(
              "starting-fuel-question",
              "Le réservoir contient-il suffisamment de carburant ?",
            ),
          ),
        ).toBe(true);

      },
    );

    it(
      "must preserve fuel pump",
      () => {

        expect(
          isAllowed(
            question(
              "starting-fuel-pump-sound",
              "Entendez-vous la pompe à carburant s'amorcer ?",
            ),
          ),
        ).toBe(true);

      },
    );

    it(
      "must preserve immobilizer",
      () => {

        expect(
          isAllowed(
            question(
              "starting-immobilizer-question",
              "Un voyant de clé, cadenas ou antivol reste-t-il actif ?",
            ),
          ),
        ).toBe(true);

      },
    );

    it(
      "must preserve engine start intent",
      () => {

        expect(
          isAllowed(
            question(
              "starting-engine-attempt",
              "Le moteur donne-t-il des signes qu'il veut démarrer ?",
            ),
          ),
        ).toBe(true);

      },
    );

    it(
      "must reject booster",
      () => {

        expect(
          isAllowed(
            question(
              "starting-booster-test",
              "Le véhicule démarre-t-il avec le booster ?",
            ),
          ),
        ).toBe(false);

      },
    );

    it(
      "must reject battery terminals",
      () => {

        expect(
          isAllowed(
            question(
              "starting-check-battery-terminals",
              "Les bornes de batterie sont-elles propres et serrées ?",
            ),
          ),
        ).toBe(false);

      },
    );

    it(
      "must reject battery voltage",
      () => {

        expect(
          isAllowed(
            question(
              "starting-battery-voltage-known",
              "Avez-vous mesuré la tension de la batterie ?",
            ),
          ),
        ).toBe(false);

      },
    );

    it(
      "must reject starter rotation",
      () => {

        expect(
          isAllowed(
            question(
              "starting-confirm-starter-drive",
              "Le démarreur tourne-t-il dans le vide ?",
            ),
          ),
        ).toBe(false);

      },
    );

  },
);
