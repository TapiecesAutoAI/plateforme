import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Step = {
  expectedAction: string;
  optionId: string;
};

const scenarios: Record<string, Step[]> = {

  "POSITIVE-CABLE": [
    {
      expectedAction:
        "charging-main-symptom",
      optionId:
        "battery-discharges",
    },
    {
      expectedAction:
        "charging-voltage-known",
      optionId:
        "yes",
    },
    {
      expectedAction:
        "charging-voltage-value",
      optionId:
        "13-2-to-13-8",
    },
    {
      expectedAction:
        "charging-load-test",
      optionId:
        "below-12-5",
    },
    {
      expectedAction:
        "charging-ripple-known",
      optionId:
        "no",
    },
    {
      expectedAction:
        "charging-current-output-known",
      optionId:
        "no",
    },
    {
      expectedAction:
        "charging-voltage-drop-positive-known",
      optionId:
        "yes",
    },
    {
      expectedAction:
        "charging-voltage-drop-positive-value",
      optionId:
        "above-0-2",
    },
    {
      expectedAction:
        "charging-positive-cable-check",
      optionId:
        "bad",
    },
  ],

  "GROUND": [
    {
      expectedAction:
        "charging-main-symptom",
      optionId:
        "battery-discharges",
    },
    {
      expectedAction:
        "charging-voltage-known",
      optionId:
        "yes",
    },
    {
      expectedAction:
        "charging-voltage-value",
      optionId:
        "13-2-to-13-8",
    },
    {
      expectedAction:
        "charging-load-test",
      optionId:
        "below-12-5",
    },
    {
      expectedAction:
        "charging-ripple-known",
      optionId:
        "no",
    },
    {
      expectedAction:
        "charging-current-output-known",
      optionId:
        "no",
    },
    {
      expectedAction:
        "charging-voltage-drop-positive-known",
      optionId:
        "no",
    },
    {
      expectedAction:
        "charging-voltage-drop-ground-known",
      optionId:
        "yes",
    },
    {
      expectedAction:
        "charging-voltage-drop-ground-value",
      optionId:
        "above-0-2",
    },
    {
      expectedAction:
        "charging-ground-check",
      optionId:
        "bad",
    },
  ],

  "BATTERY-SENSOR": [
    {
      expectedAction:
        "charging-main-symptom",
      optionId:
        "battery-light",
    },
    {
      expectedAction:
        "charging-engine-state",
      optionId:
        "engine-running",
    },
    {
      expectedAction:
        "charging-belt-check",
      optionId:
        "normal",
    },
  ],
};

const originalLog =
  console.log;

console.log = () => {};

const output: string[] =
  [];

for (
  const [name, steps]
  of Object.entries(
    scenarios,
  )
) {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `forced-${name}`,
      "depanneur",
      "charging",
      [],
    );

  output.push("");
  output.push(
    `=== ${name} ===`,
  );

  for (
    let index = 0;
    index < steps.length;
    index++
  ) {

    const step =
      steps[index];

    const actual =
      result.action?.id ??
      "NONE";

    output.push(
      `${index + 1}. attendu=${step.expectedAction} | obtenu=${actual} | completed=${result.completed}`,
    );

    if (
      actual !==
      step.expectedAction
    ) {
      const top =
        result.reasoning
          .decision
          .probabilities[0];

      output.push(
        `   ECART ICI | TOP=${top?.hypothesis.id ?? "NONE"} | P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
      );

      break;
    }

    result =
      engine.answer(
        result.session,
        "charging",
        step.expectedAction,
        step.optionId,
      );

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    output.push(
      `   reponse=${step.optionId} | TOP=${top?.hypothesis.id ?? "NONE"} | P=${((top?.probability ?? 0) * 100).toFixed(2)}% | NEXT=${result.action?.id ?? "NONE"} | completed=${result.completed}`,
    );
  }
}

console.log =
  originalLog;

console.log(
  "\n=== CHARGING FORCED WORKFLOW AUDIT ===",
);

for (
  const line
  of output
) {
  console.log(line);
}
