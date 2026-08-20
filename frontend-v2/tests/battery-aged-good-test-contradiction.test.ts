import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DiagnosticEngineV2,
} from "../engine/core/DiagnosticEngineV2";

type Step = {
  actionId: string;
  optionId: string;
};

function runPath(
  id: string,
  path: Step[],
) {
  const engine: any =
    new DiagnosticEngineV2();

  let result: any =
    engine.createSession(
      id,
      "mecanicien-garage",
      "battery",
      [],
    );

  for (const step of path) {
    if (
      result.completed ||
      !result.action
    ) {
      break;
    }

    expect(
      result.action.id,
    ).toBe(
      step.actionId,
    );

    const option =
      result.action.options?.find(
        (candidate: any) =>
          candidate.id ===
          step.optionId,
      );

    expect(option).toBeDefined();

    result =
      engine.answer(
        result.session,
        "battery",
        result.action.id,
        option.id,
      );
  }

  return result;
}

function probabilityOf(
  result: any,
  hypothesisId: string,
): number {
  return (
    result.reasoning
      ?.decision
      ?.probabilities
      ?.find(
        (entry: any) =>
          entry.hypothesis.id ===
          hypothesisId,
      )
      ?.probability ??
    0
  );
}

describe(
  "Battery aged - good battery test contradiction",
  () => {

    it(
      "must not conclude aged battery when the battery tester says good",
      () => {

        const result =
          runPath(
            "aged-good-regression",
            [
              {
                actionId:
                  "battery-main-symptom",
                optionId:
                  "flat",
              },
              {
                actionId:
                  "battery-age",
                optionId:
                  "over-four",
              },
              {
                actionId:
                  "battery-case-check",
                optionId:
                  "swollen",
              },
              {
                actionId:
                  "battery-test-known",
                optionId:
                  "yes",
              },
              {
                actionId:
                  "battery-test-result",
                optionId:
                  "good",
              },
              {
                actionId:
                  "battery-charging-voltage-known",
                optionId:
                  "yes",
              },
              {
                actionId:
                  "battery-charging-voltage-value",
                optionId:
                  "12-8-to-13-5",
              },
              {
                actionId:
                  "battery-charging-load-known",
                optionId:
                  "no",
              },
            ],
          );

        expect(
          probabilityOf(
            result,
            "problem-aged-battery",
          ),
        ).toBeLessThan(
          0.65,
        );

        expect(
          result.session
            .conclusion
            ?.diagnosisId,
        ).not.toBe(
          "problem-aged-battery",
        );
      },
    );

    it(
      "must preserve aged battery with post-charge voltage below 12.2V",
      () => {

        const result =
          runPath(
            "aged-postcharge-positive",
            [
              {
                actionId:
                  "battery-main-symptom",
                optionId:
                  "flat",
              },
              {
                actionId:
                  "battery-age",
                optionId:
                  "over-four",
              },
              {
                actionId:
                  "battery-case-check",
                optionId:
                  "normal",
              },
              {
                actionId:
                  "battery-rest-voltage-known",
                optionId:
                  "no",
              },
              {
                actionId:
                  "battery-terminals-check",
                optionId:
                  "good",
              },
              {
                actionId:
                  "battery-ground-check",
                optionId:
                  "good",
              },
              {
                actionId:
                  "battery-jump-start-test",
                optionId:
                  "success",
              },
              {
                actionId:
                  "battery-restart-after-jump",
                optionId:
                  "fails",
              },
              {
                actionId:
                  "battery-post-charge-voltage-known",
                optionId:
                  "yes",
              },
              {
                actionId:
                  "battery-post-charge-voltage-value",
                optionId:
                  "below-12-2",
              },
            ],
          );

        expect(
          probabilityOf(
            result,
            "problem-aged-battery",
          ),
        ).toBeGreaterThan(
          0.95,
        );
      },
    );

    it(
      "must preserve aged battery with cranking voltage below 8V",
      () => {

        const result =
          runPath(
            "aged-cranking-positive",
            [
              {
                actionId:
                  "battery-main-symptom",
                optionId:
                  "flat",
              },
              {
                actionId:
                  "battery-age",
                optionId:
                  "over-four",
              },
              {
                actionId:
                  "battery-case-check",
                optionId:
                  "normal",
              },
              {
                actionId:
                  "battery-rest-voltage-known",
                optionId:
                  "no",
              },
              {
                actionId:
                  "battery-terminals-check",
                optionId:
                  "good",
              },
              {
                actionId:
                  "battery-ground-check",
                optionId:
                  "good",
              },
              {
                actionId:
                  "battery-jump-start-test",
                optionId:
                  "fails",
              },
              {
                actionId:
                  "battery-cranking-voltage-known",
                optionId:
                  "yes",
              },
              {
                actionId:
                  "battery-cranking-voltage-value",
                optionId:
                  "below-8",
              },
            ],
          );

        expect(
          probabilityOf(
            result,
            "problem-aged-battery",
          ),
        ).toBeGreaterThan(
          0.95,
        );
      },
    );
  },
);
