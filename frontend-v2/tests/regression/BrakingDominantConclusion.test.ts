import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

describe(
  "BRAKING - dominant evidence backed conclusion",
  () => {

    it(
      "conclut problem-brake-hose sous 72% lorsqu'une preuve directe domine sans contradiction",
      () => {

        const engine: any =
          new DiagnosticEngineV2();

        let result: any =
          engine.createSession(
            "braking-dominant-conclusion-test",
            "mecanicien-garage",
            "braking",
            [],
          );

        const path = [
          {
            actionId:
              "braking-main-symptom",
            optionId:
              "weak-braking",
          },
          {
            actionId:
              "braking-pedal-feel",
            optionId:
              "normal",
          },
          {
            actionId:
              "braking-pad-thickness",
            optionId:
              "worn",
          },
          {
            actionId:
              "braking-disc-condition",
            optionId:
              "overheated",
          },
          {
            actionId:
              "braking-caliper-hose-check",
            optionId:
              "hose",
          },
        ];

        for (
          const step
          of path
        ) {

          expect(
            result.action?.id,
          ).toBe(
            step.actionId,
          );

          const option =
            result.action
              ?.options
              ?.find(
                (candidate: any) =>
                  candidate.id ===
                  step.optionId,
              );

          expect(
            option,
          ).toBeDefined();

          result =
            engine.answer(
              result.session,
              "braking",
              result.action.id,
              option.id,
            );
        }

        const decision =
          result.reasoning
            ?.decision;

        expect(
          result.session.status,
        ).toBe(
          "completed",
        );

        expect(
          result.action,
        ).toBeNull();

        expect(
          decision?.type,
        ).toBe(
          "conclude",
        );

        expect(
          decision
            ?.diagnostic
            ?.hypothesis
            ?.id ??
          decision
            ?.probabilities
            ?.[0]
            ?.hypothesis
            ?.id,
        ).toBe(
          "problem-brake-hose",
        );

        expect(
          decision
            ?.metrics
            ?.topProbability,
        ).toBeGreaterThanOrEqual(
          0.65,
        );

        expect(
          decision
            ?.metrics
            ?.topProbability,
        ).toBeLessThan(
          0.72,
        );

        expect(
          decision
            ?.metrics
            ?.lead,
        ).toBeGreaterThanOrEqual(
          0.30,
        );

        expect(
          decision
            ?.metrics
            ?.evidenceCoverage,
        ).toBe(
          1,
        );

        expect(
          decision
            ?.metrics
            ?.contradictionSeverity,
        ).toBe(
          0,
        );

        expect(
          result.reasoning
            ?.context
            ?.confirmedEvidenceIds
            ?.has(
              "observation-brake-hose-bad",
            ),
        ).toBe(
          true,
        );

        expect(
          result.reasoning
            ?.context
            ?.rejectedEvidenceIds
            ?.has(
              "observation-brake-hose-bad",
            ),
        ).toBe(
          false,
        );
      },
    );
  },
);
