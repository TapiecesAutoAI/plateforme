import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DuplicateQuestionEngine,
} from "../engine/reasoning/duplicate/DuplicateQuestionEngine";

import {
  QuestionFamilyEngine,
} from "../engine/reasoning/family/QuestionFamilyEngine";

type TestAction = {
  id: string;
  type: "ask-question";
  text: string;
  options: [];
};

const makeAction = (
  id: string,
  text: string,
): TestAction => ({
  id,
  type: "ask-question",
  text,
  options: [],
});

describe(
  "DuplicateQuestionEngine family consistency",
  () => {
    const duplicateEngine =
      new DuplicateQuestionEngine();

    const familyEngine =
      new QuestionFamilyEngine();

    const cases = [
      makeAction(
        "starting-immobilizer-question",
        "Un voyant de clé, cadenas ou antivol reste-t-il allumé ou clignote-t-il ?",
      ),
      makeAction(
        "engine-immobilizer",
        "Un voyant de clé ou d'antidémarrage reste-t-il actif ?",
      ),
      makeAction(
        "starting-fuel-question",
        "Le réservoir contient-il suffisamment de carburant ?",
      ),
      makeAction(
        "engine-fuel-level",
        "Le réservoir contient-il suffisamment de carburant ?",
      ),
      makeAction(
        "starting-fuel-pump-sound",
        "Entendez-vous la pompe à carburant s'amorcer ?",
      ),
      makeAction(
        "engine-fuel-pump",
        "Entendez-vous la pompe à carburant s'amorcer ?",
      ),
      makeAction(
        "starting-spare-key-test",
        "Le véhicule démarre-t-il avec la seconde clé ?",
      ),
    ];

    it.each(
      cases,
    )(
      "must use the same semantic family for $id",
      action => {
        expect(
          duplicateEngine.resolveFamily(
            action as any,
          ),
        ).toBe(
          familyEngine.resolve(
            action as any,
          ),
        );
      },
    );
  },
);
