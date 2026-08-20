import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Step = {
  actionId: string;
  optionId: string;
};

const scenarios: Record<string, Step[]> = {

  "AGED-BATTERY": [
    {
      actionId: "battery-main-symptom",
      optionId: "weak",
    },
    {
      actionId: "battery-dashboard-behaviour",
      optionId: "dim",
    },
    {
      actionId: "battery-age",
      optionId: "over-four",
    },
    {
      actionId: "battery-case-check",
      optionId: "normal",
    },
    {
      actionId: "battery-rest-voltage-known",
      optionId: "yes",
    },
    {
      actionId: "battery-rest-voltage-value",
      optionId: "11-8-to-12-2",
    },
    {
      actionId: "battery-terminals-check",
      optionId: "good",
    },
    {
      actionId: "battery-ground-check",
      optionId: "good",
    },
    {
      actionId: "battery-jump-start-test",
      optionId: "success",
    },
    {
      actionId: "battery-restart-after-jump",
      optionId: "fails",
    },
    {
      actionId: "battery-post-charge-voltage-known",
      optionId: "yes",
    },
    {
      actionId: "battery-post-charge-voltage-value",
      optionId: "below-12-2",
    },
  ],

  "ALTERNATOR": [
    {
      actionId: "battery-main-symptom",
      optionId: "warning-light",
    },
    {
      actionId: "battery-light-behaviour",
      optionId: "engine-running",
    },
    {
      actionId: "battery-charging-voltage-known",
      optionId: "yes",
    },
    {
      actionId: "battery-charging-voltage-value",
      optionId: "below-12-8",
    },
    {
      actionId: "battery-belt-check",
      optionId: "normal",
    },
    {
      actionId: "battery-alternator-connection-check",
      optionId: "good",
    },
  ],

  "INTERNAL-BATTERY": [
    {
      actionId: "battery-main-symptom",
      optionId: "flat",
    },
    {
      actionId: "battery-age",
      optionId: "two-to-four",
    },
    {
      actionId: "battery-case-check",
      optionId: "normal",
    },
    {
      actionId: "battery-rest-voltage-known",
      optionId: "yes",
    },
    {
      actionId: "battery-rest-voltage-value",
      optionId: "12-2-to-12-5",
    },
    {
      actionId: "battery-terminals-check",
      optionId: "good",
    },
    {
      actionId: "battery-ground-check",
      optionId: "good",
    },
    {
      actionId: "battery-jump-start-test",
      optionId: "fails",
    },
    {
      actionId: "battery-cranking-voltage-known",
      optionId: "yes",
    },
    {
      actionId: "battery-cranking-voltage-value",
      optionId: "8-to-9-6",
    },
    {
      actionId: "battery-test-known",
      optionId: "yes",
    },
    {
      actionId: "battery-test-result",
      optionId: "bad-cell",
    },
  ],
};

const realLog = console.log;
console.log = () => {};

const rows: string[] = [];

for (
  const [name, steps]
  of Object.entries(scenarios)
) {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `battery-forced-${name}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  rows.push("");
  rows.push(`=== ${name} ===`);

  for (
    let i = 0;
    i < steps.length;
    i++
  ) {

    const step =
      steps[i];

    const actual =
      result.action?.id ??
      "NONE";

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    rows.push(
      [
        `${i + 1}.`,
        `attendu=${step.actionId}`,
        `obtenu=${actual}`,
        `TOP=${top?.hypothesis.id ?? "NONE"}`,
        `P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
        `completed=${result.completed}`,
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
        "battery",
        step.actionId,
        step.optionId,
      );
  }

  const finalTop =
    result.reasoning
      .decision
      .probabilities[0];

  rows.push(
    `FINAL TOP=${finalTop?.hypothesis.id ?? "NONE"} | P=${((finalTop?.probability ?? 0) * 100).toFixed(2)}% | completed=${result.completed} | next=${result.action?.id ?? "NONE"}`,
  );
}

console.log = realLog;

console.log("");
console.log(
  "=== BATTERY FORCED HYPOTHESES AUDIT ===",
);

for (const row of rows) {
  console.log(row);
}
