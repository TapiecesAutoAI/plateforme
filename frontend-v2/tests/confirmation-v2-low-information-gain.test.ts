import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DecisionPipeline,
} from "../engine/confirmation-v2/DecisionPipeline";

describe(
  "Confirmation V2 minimum information gain",
  () => {
    it(
      "must reject a best candidate below the 0.01 information gain threshold",
      () => {
        const question = {
          id: "question-low-gain",
          domainId: "starting",
          text: "Question faible gain",
          type: "single_choice",
          purpose: "test",
          targetHypothesisIds: [],
          targetEvidenceIds: [],
          options: [],
          cost: 1,
        };

        const lowGainCandidate = {
          question,
          score: 50,
          informationGain: 0.005,
          branchCompatible: true,
        };

        const pipeline =
          new DecisionPipeline();

        const internal =
          pipeline as unknown as {
            planner: {
              plan: () => Array<
                typeof lowGainCandidate
              >;
            };
          };

        internal.planner = {
          plan: () => [
            lowGainCandidate,
          ],
        };

        const result =
          pipeline.execute(
            [],
            [],
            [],
          );

        expect(
          result.rankedQuestions.length,
        ).toBe(1);

        expect(
          result.rankedQuestions[0]
            .informationGain,
        ).toBe(0.005);

        expect(
          result.bestQuestion,
        ).toBeNull();
      },
    );
  },
);