import {
  describe,
  expect,
  it,
} from "vitest";

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
  "Cross-pack question family deduplication",
  () => {
    const engine =
      new QuestionFamilyEngine();

    it(
      "must classify starting and engine fuel-level questions in the same family",
      () => {
        const starting =
          makeAction(
            "starting-fuel-question",
            "Le réservoir contient-il suffisamment de carburant ?",
          );

        const engineAction =
          makeAction(
            "engine-fuel-level",
            "Le réservoir contient-il suffisamment de carburant ?",
          );

        expect(
          engine.resolve(starting as any),
        ).toBe("fuel-level");

        expect(
          engine.resolve(engineAction as any),
        ).toBe("fuel-level");

        expect(
          engine.resolve(starting as any),
        ).toBe(
          engine.resolve(
            engineAction as any,
          ),
        );
      },
    );

    it(
      "must classify starting and engine immobilizer questions in the same family",
      () => {
        const starting =
          makeAction(
            "starting-immobilizer-question",
            "Un voyant de clé, cadenas ou antivol reste-t-il allumé ou clignote-t-il ?",
          );

        const engineAction =
          makeAction(
            "engine-immobilizer",
            "Un voyant de clé ou d'antidémarrage reste-t-il actif ?",
          );

        expect(
          engine.resolve(starting as any),
        ).toBe("immobilizer");

        expect(
          engine.resolve(engineAction as any),
        ).toBe("immobilizer");
      },
    );

    it(
      "must classify starting and engine spare-key questions in the same family",
      () => {
        const starting =
          makeAction(
            "starting-spare-key-test",
            "Le véhicule démarre-t-il avec la seconde clé ?",
          );

        const engineAction =
          makeAction(
            "engine-spare-key",
            "Le moteur démarre-t-il avec la seconde clé ?",
          );

        expect(
          engine.resolve(starting as any),
        ).toBe("immobilizer");

        expect(
          engine.resolve(engineAction as any),
        ).toBe("immobilizer");
      },
    );

    it(
      "must distinguish fuel level from fuel pump",
      () => {
        const fuelLevel =
          makeAction(
            "starting-fuel-question",
            "Le réservoir contient-il suffisamment de carburant ?",
          );

        const fuelPump =
          makeAction(
            "engine-fuel-pump",
            "Entendez-vous la pompe à carburant s'amorcer ?",
          );

        expect(
          engine.resolve(fuelLevel as any),
        ).toBe("fuel-level");

        expect(
          engine.resolve(fuelPump as any),
        ).not.toBe("fuel-level");
      },
    );
  },
);
