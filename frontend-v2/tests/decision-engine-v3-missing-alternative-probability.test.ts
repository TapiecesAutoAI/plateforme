import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DecisionEngineV3,
} from "../engine/reasoning/DecisionEngineV3";

describe(
  "DecisionEngineV3 missing alternative probability",
  () => {

    it(
      "must not sell a part when alternative probability is unknown",
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

            // intentionally omitted:
            // alternativeProbability
          });

        expect(
          result.type,
        ).not.toBe(
          "sell-part",
        );

        expect(
          result.shouldSell,
        ).toBe(false);
      },
    );
  },
);
