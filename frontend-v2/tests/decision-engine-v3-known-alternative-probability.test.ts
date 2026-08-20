import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DecisionEngineV3,
} from "../engine/reasoning/DecisionEngineV3";

describe(
  "DecisionEngineV3 known alternative probability",
  () => {

    it(
      "must allow sell-part when alternative probability is known and sufficiently low",
      () => {

        const engine =
          new DecisionEngineV3();

        const result =
          engine.evaluate({
            questionId:
              "test-question",

            informationGain:
              0.1,

            questionCost:
              1,

            confidence:
              95,

            fatigue:
              3,

            similarCases:
              0,

            validatedRepairs:
              0,

            contradictionCount:
              0,

            profileId:
              "particulier",

            answeredQuestionCount:
              3,

            maximumQuestionCount:
              5,

            supportingEvidenceCount:
              3,

            alternativeProbability:
              10,
          });

        expect(
          result.type,
        ).toBe(
          "sell-part",
        );

        expect(
          result.shouldSell,
        ).toBe(true);

        expect(
          result.shouldAsk,
        ).toBe(false);
      },
    );
  },
);
