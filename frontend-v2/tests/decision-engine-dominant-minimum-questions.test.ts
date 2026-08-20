import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DecisionEngine,
} from "../engine/reasoning/DecisionEngine";

import type {
  ReasoningContext,
} from "../engine/model/reasoningContext";

describe(
  "DecisionEngine - dominant conclusion minimum questions",
  () => {

    function createEngine() {

      const primary = {
        id: "problem-primary",
        name: "Primary",
        baseScore: 0.5,
        confidence: 0.5,

        supportingEvidenceIds: [
          "evidence-primary",
        ],

        contradictingEvidenceIds: [],

        requiredEvidenceIds: [
          "evidence-primary",
        ],
      };

      const secondary = {
        id: "problem-secondary",
        name: "Secondary",
        baseScore: 0.5,
        confidence: 0.5,

        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        requiredEvidenceIds: [],
      };

      const evidence = {
        id: "evidence-primary",
        label: "Direct primary evidence",
      };

      const probabilityEngine = {
        compute: () => [
          {
            hypothesis: primary,
            score: 0.68,
            probability: 0.68,
          },
          {
            hypothesis: secondary,
            score: 0.20,
            probability: 0.20,
          },
        ],
      };

      const informationGainEngine = {
        evaluate: () => [],
      };

      const contradictionEngine = {
        evaluate: () => [],
      };

      const engine =
        new DecisionEngine(
          probabilityEngine as never,
          informationGainEngine as never,
          contradictionEngine as never,
        );

      return {
        engine,
        primary,
        secondary,
        evidence,
      };
    }

    function createContext(
      completedQuestionCount: number,
    ): ReasoningContext {

      const {
        primary,
        secondary,
        evidence,
      } = createEngine();

      const completedQuestionIds =
        new Set<string>();

      for (
        let index = 1;
        index <= completedQuestionCount;
        index += 1
      ) {
        completedQuestionIds.add(
          `question-${index}`,
        );
      }

      return {
        hypotheses: new Map([
          [primary.id, primary],
          [secondary.id, secondary],
        ]),

        evidences: new Map([
          [evidence.id, evidence],
        ]),

        questions: new Map(),
        actions: new Map(),

        activeHypothesisIds: new Set([
          primary.id,
          secondary.id,
        ]),

        eliminatedHypothesisIds:
          new Set(),

        confirmedEvidenceIds:
          new Set([
            evidence.id,
          ]),

        rejectedEvidenceIds:
          new Set(),

        completedQuestionIds,

        metadata: {},
        progress: {},
      } as unknown as ReasoningContext;
    }

    it(
      "must not use dominant conclusion after only 2 completed questions",
      () => {

        const {
          engine,
        } = createEngine();

        const result =
          engine.decide(
            createContext(2),
          );

        expect(
          result.metrics.topProbability,
        ).toBeGreaterThanOrEqual(
          0.65,
        );

        expect(
          result.metrics.topProbability,
        ).toBeLessThan(
          0.72,
        );

        expect(
          result.metrics.lead,
        ).toBeGreaterThanOrEqual(
          0.30,
        );

        expect(
          result.metrics.evidenceCoverage,
        ).toBe(1);

        expect(
          result.metrics.contradictionSeverity,
        ).toBe(0);

        expect(
          result.type,
        ).not.toBe(
          "conclude",
        );
      },
    );

    it(
      "may use dominant conclusion from 3 completed questions",
      () => {

        const {
          engine,
        } = createEngine();

        const result =
          engine.decide(
            createContext(3),
          );

        expect(
          result.metrics.topProbability,
        ).toBeGreaterThanOrEqual(
          0.65,
        );

        expect(
          result.metrics.topProbability,
        ).toBeLessThan(
          0.72,
        );

        expect(
          result.metrics.lead,
        ).toBeGreaterThanOrEqual(
          0.30,
        );

        expect(
          result.metrics.evidenceCoverage,
        ).toBe(1);

        expect(
          result.metrics.contradictionSeverity,
        ).toBe(0);

        expect(
          result.type,
        ).toBe(
          "conclude",
        );
      },
    );
  },
);
