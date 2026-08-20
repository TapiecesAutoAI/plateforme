import {
  describe,
  expect,
  it,
} from "vitest";

import {
  QuestionRanker,
} from "../engine/confirmation-v2/QuestionRanker";

describe(
  "Confirmation V2 information gain priority",
  () => {
    it(
      "must not rank a much lower information gain question above a much more informative question",
      () => {
        const ranker =
          new QuestionRanker();

        const highGain = {
          question: {
            id: "high-gain",
            domainId: "starting",
            text: "Question très informative",
            type: "single_choice",
            purpose: "confirmation",
            targetHypothesisIds: [],
            targetEvidenceIds: [],
            options: [],
            cost: 1,
          },

          score:
            2,

          informationGain:
            0.8,

          branchCompatible:
            true,
        };

        const lowGain = {
          question: {
            id: "low-gain",
            domainId: "starting",
            text: "Question peu informative",
            type: "single_choice",
            purpose: "confirmation",
            targetHypothesisIds: [],
            targetEvidenceIds: [],
            options: [],
            cost: 1,
          },

          score:
            20,

          informationGain:
            0.05,

          branchCompatible:
            true,
        };

        const ranked =
          ranker.rank([
            lowGain as never,
            highGain as never,
          ]);

        expect(
          ranked[0]
            ?.question.id,
        ).toBe(
          "high-gain",
        );
      },
    );
    it(
      "must use candidate score as tie-breaker when information gain is equal",
      () => {
        const ranker =
          new QuestionRanker();

        const lowerScore = {
          question: {
            id: "equal-gain-low-score",
            domainId: "starting",
            text: "Question A",
            type: "single_choice",
            purpose: "confirmation",
            targetHypothesisIds: [],
            targetEvidenceIds: [],
            options: [],
            cost: 1,
          },

          score:
            5,

          informationGain:
            0.4,

          branchCompatible:
            true,
        };

        const higherScore = {
          question: {
            id: "equal-gain-high-score",
            domainId: "starting",
            text: "Question B",
            type: "single_choice",
            purpose: "confirmation",
            targetHypothesisIds: [],
            targetEvidenceIds: [],
            options: [],
            cost: 1,
          },

          score:
            15,

          informationGain:
            0.4,

          branchCompatible:
            true,
        };

        const ranked =
          ranker.rank([
            lowerScore as never,
            higherScore as never,
          ]);

        expect(
          ranked[0]
            ?.question.id,
        ).toBe(
          "equal-gain-high-score",
        );
      },
    );
  },
);