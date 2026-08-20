import { describe, expect, it } from "vitest";

import { DecisionEngine } from "../engine/reasoning/DecisionEngine";
import type { ReasoningContext } from "../engine/model/reasoningContext";

describe("DecisionEngine - no selectable question fallback", () => {
  it("does not conclude only because a useful question becomes unselectable", () => {
    const hypothesis = {
      id: "problem-test",
      name: "Test hypothesis",
      baseScore: 0.5,
      confidence: 0.5,
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      requiredEvidenceIds: [],
    };

    const question = {
      id: "question-test",
      text: "Question test ?",
      cost: 1,
    };

    const probabilityEngine = {
      compute: () => [
        {
          hypothesis,
          score: 0.6,
          probability: 0.6,
        },
      ],
    };

    const informationGainEngine = {
      evaluate: () => [
        {
          question,
          gain: 0.1,
        },
      ],
    };

    const contradictionEngine = {
      evaluate: () => [],
    };

    const context = {
      hypotheses: new Map([
        [hypothesis.id, hypothesis],
      ]),
      evidences: new Map(),
      questions: new Map([
        [question.id, question],
      ]),
      actions: new Map(),

      activeHypothesisIds: new Set([
        hypothesis.id,
      ]),
      eliminatedHypothesisIds: new Set(),

      confirmedEvidenceIds: new Set(),
      rejectedEvidenceIds: new Set(),

      completedQuestionIds: new Set([
        question.id,
      ]),

      metadata: {},
      progress: {},
    } as unknown as ReasoningContext;

    const engine = new DecisionEngine(
      probabilityEngine as never,
      informationGainEngine as never,
      contradictionEngine as never,
    );

    const result = engine.decide(context);

    expect(result.selectedQuestion).toBeNull();
    expect(result.type).not.toBe("conclude");
  });
});