import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Step = {
  actionId: string;
  optionId: string;
};

const steps: Step[] = [
  {
    actionId:
      "charging-main-symptom",
    optionId:
      "battery-discharges",
  },
  {
    actionId:
      "charging-voltage-known",
    optionId:
      "yes",
  },
  {
    actionId:
      "charging-voltage-value",
    optionId:
      "below-12-5",
  },
  {
    actionId:
      "charging-rpm-test",
    optionId:
      "no-change",
  },
  {
    actionId:
      "charging-field-command-known",
    optionId:
      "no",
  },
  {
    actionId:
      "charging-diagnostic-codes-known",
    optionId:
      "yes",
  },
  {
    actionId:
      "charging-code-family",
    optionId:
      "battery-sensor",
  },
  {
    actionId:
      "charging-battery-sensor-check",
    optionId:
      "bad",
  },
];

const originalLog =
  console.log;

console.log = () => {};

const engine =
  new DiagnosticEngineV2();

let result =
  engine.createSession(
    "forced-battery-sensor",
    "mecanicien-garage",
    "charging",
    [],
  );

const rows: string[] = [];

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

  const top =
    result.reasoning
      .decision
      .probabilities[0];

  rows.push(
    [
      `${index + 1}.`,
      `attendu=${step.actionId}`,
      `obtenu=${actual}`,
      `TOP=${top?.hypothesis.id ?? "NONE"}`,
      `P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
      `completed=${result.completed}`,
      `questions=${result.session.actionResults.length}`,
    ].join(" | "),
  );

  if (
    actual !==
    step.actionId
  ) {
    rows.push(
      ">>> ECART ICI",
    );
    break;
  }

  result =
    engine.answer(
      result.session,
      "charging",
      step.actionId,
      step.optionId,
    );
}

const finalTop =
  result.reasoning
    .decision
    .probabilities[0];

rows.push("");
rows.push(
  `FINAL TOP=${finalTop?.hypothesis.id ?? "NONE"} | P=${((finalTop?.probability ?? 0) * 100).toFixed(2)}% | completed=${result.completed} | next=${result.action?.id ?? "NONE"}`,
);

console.log =
  originalLog;

console.log("");
console.log(
  "=== BATTERY SENSOR FORCED WORKFLOW ===",
);

for (
  const row
  of rows
) {
  console.log(row);
}
