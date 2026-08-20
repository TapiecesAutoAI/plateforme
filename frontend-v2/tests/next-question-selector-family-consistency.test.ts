import {
  describe,
  expect,
  it,
} from "vitest";

import {
  NextQuestionSelector,
} from "../engine/reasoning/selection/NextQuestionSelector";

import {
  QuestionFamilyEngine,
} from "../engine/reasoning/family/QuestionFamilyEngine";

const makeQuestion = (
  id: string,
  text: string,
) => ({
  id,
  text,
  type: "single-choice",
  targetEvidenceIds: [],
  targetHypothesisIds: [],
  options: [],
  cost: 1,
});

describe(
  "NextQuestionSelector family consistency",
  () => {
    const selector =
      new NextQuestionSelector();

    const familyEngine =
      new QuestionFamilyEngine();

    const cases = [
      makeQuestion(
        "starting-immobilizer-question",
        "Un voyant de clé, cadenas ou antivol reste-t-il allumé ou clignote-t-il ?",
      ),

      makeQuestion(
        "starting-fuel-question",
        "Le réservoir contient-il suffisamment de carburant ?",
      ),

      makeQuestion(
        "engine-fuel-level",
        "Le réservoir contient-il suffisamment de carburant ?",
      ),

      makeQuestion(
        "starting-fuel-pump-sound",
        "Entendez-vous un léger bourdonnement à la mise du contact ?",
      ),

      makeQuestion(
        "engine-fuel-pump",
        "Entendez-vous la pompe à carburant s'amorcer ?",
      ),

      makeQuestion(
        "starting-spare-key-test",
        "Le véhicule démarre-t-il avec la seconde clé ?",
      ),

      makeQuestion(
        "starting-confirm-starter-drive",
        "Le démarreur tourne-t-il rapidement sans entraîner le moteur ?",
      ),

      makeQuestion(
        "starting-battery-voltage-known",
        "Avez-vous mesuré la tension de la batterie moteur arrêté ?",
      ),
    ];

    it.each(
      cases,
    )(
      "must use the central semantic family for $id",
      question => {
        const selectorFamily =
          (
            selector as any
          ).resolveFamily(
            question,
          );

        const centralFamily =
          familyEngine.resolve(
            question as any,
          );

        expect(
          selectorFamily,
        ).toBe(
          centralFamily,
        );
      },
    );
  },
);
