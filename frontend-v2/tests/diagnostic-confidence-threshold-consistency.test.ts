import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ConfidenceCalculator,
} from "../engine/reasoning/ConfidenceCalculator";

describe(
  "Diagnostic confidence threshold consistency",
  () => {

    const calculator =
      new ConfidenceCalculator();

    function evaluate(
      primaryProbability: number,
      secondaryProbability: number,
    ) {
      return calculator.calculate(
        [
          {
            hypothesis: {
              id: "primary",
              name: "Primary",
            },
            probability:
              primaryProbability,
          },
          {
            hypothesis: {
              id: "secondary",
              name: "Secondary",
            },
            probability:
              secondaryProbability,
          },
        ] as any,
        {
          completedActionCount: 3,
          minimumQuestions: 2,
          conclusionThreshold: 0.82,
          confirmationThreshold: 0.65,
          minimumLead: 0.20,
        },
      );
    }

    it(
      "must not conclude below 0.82",
      () => {

        const result =
          evaluate(
            0.81,
            0.19,
          );

        expect(
          result.decision,
        ).not.toBe(
          "conclude",
        );
      },
    );

    it(
      "must conclude at 0.82 when lead is sufficient",
      () => {

        const result =
          evaluate(
            0.82,
            0.18,
          );

        expect(
          result.decision,
        ).toBe(
          "conclude",
        );
      },
    );

    it(
      "must conclude above 0.92 when lead is sufficient",
      () => {

        const result =
          evaluate(
            0.92,
            0.08,
          );

        expect(
          result.decision,
        ).toBe(
          "conclude",
        );
      },
    );

    it(
      "must conclude at 0.95 when lead is sufficient",
      () => {

        const result =
          evaluate(
            0.95,
            0.05,
          );

        expect(
          result.decision,
        ).toBe(
          "conclude",
        );
      },
    );
  },
);
