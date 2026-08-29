import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ProfileStrategyEngine,
} from "../engine/reasoning/profile/ProfileStrategyEngine";

import {
  DecisionEngineV3,
} from "../engine/reasoning/DecisionEngineV3";

describe(
  "V2/V3 profile question limit consistency",
  () => {
    const strategy =
      new ProfileStrategyEngine();

    const decision =
      new DecisionEngineV3();

    const cases = [
      ["particulier", 5],
      ["bricoleur", 7],
      ["vendeur-pieces-auto", 8],
      ["mecanicien-garage", 15],
      ["depanneur", 6],
    ] as const;

    for (
      const [
        profile,
        expectedMaximum,
      ]
      of cases
    ) {
      it(
        `${profile} -> ${expectedMaximum}`,
        () => {
          expect(
            strategy.getStrategy(
              profile,
            ).maximumQuestions,
          ).toBe(
            expectedMaximum,
          );

          const result =
            decision.evaluate({
              questionId:
                "test-question",

              informationGain:
                1,

              questionCost:
                1,

              confidence:
                0,

              fatigue:
                expectedMaximum,

              similarCases:
                0,

              validatedRepairs:
                0,

              contradictionCount:
                0,

              profileId:
                profile,

              supportingEvidenceCount:
                0,

              alternativeProbability:
                1,
            });

          expect(
            result.maximumQuestionCount,
          ).toBe(
            expectedMaximum,
          );

          expect(
            result.reachedQuestionLimit,
          ).toBe(true);
        },
      );
    }
  },
);
