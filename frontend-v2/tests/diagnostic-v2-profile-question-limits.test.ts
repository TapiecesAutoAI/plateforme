import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ProfileStrategyEngine,
} from "../engine/reasoning/profile/ProfileStrategyEngine";

describe(
  "Diagnostic V2 profile question limits",
  () => {
    const engine =
      new ProfileStrategyEngine();

    it(
      "particulier -> 5 questions maximum",
      () => {
        expect(
          engine.getStrategy(
            "particulier",
          ).maximumQuestions,
        ).toBe(5);
      },
    );

    it(
      "bricoleur -> 7 questions maximum",
      () => {
        expect(
          engine.getStrategy(
            "bricoleur",
          ).maximumQuestions,
        ).toBe(7);
      },
    );

    it(
      "vendeur pieces auto -> 8 questions maximum",
      () => {
        expect(
          engine.getStrategy(
            "vendeur-pieces-auto",
          ).maximumQuestions,
        ).toBe(8);
      },
    );

    it(
      "mecanicien garage -> 15 questions maximum",
      () => {
        expect(
          engine.getStrategy(
            "mecanicien-garage",
          ).maximumQuestions,
        ).toBe(15);
      },
    );

    it(
      "depanneur -> 6 questions maximum",
      () => {
        expect(
          engine.getStrategy(
            "depanneur",
          ).maximumQuestions,
        ).toBe(6);
      },
    );
  },
);