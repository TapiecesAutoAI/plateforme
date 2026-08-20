import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Step = {
  actionId: string;
  optionId: string;
};

const scenarios: Record<string, Step[]> = {

  "POSITIVE-CABLE": [
    { actionId: "charging-main-symptom", optionId: "battery-discharges" },
    { actionId: "charging-voltage-known", optionId: "yes" },
    { actionId: "charging-voltage-value", optionId: "13-2-to-13-8" },
    { actionId: "charging-load-test", optionId: "below-12-5" },
    { actionId: "charging-ripple-known", optionId: "no" },
    { actionId: "charging-current-output-known", optionId: "no" },
    { actionId: "charging-voltage-drop-positive-known", optionId: "yes" },
    { actionId: "charging-voltage-drop-positive-value", optionId: "above-0-2" },
    { actionId: "charging-positive-cable-check", optionId: "bad" },
  ],

  "GROUND": [
    { actionId: "charging-main-symptom", optionId: "battery-discharges" },
    { actionId: "charging-voltage-known", optionId: "yes" },
    { actionId: "charging-voltage-value", optionId: "13-2-to-13-8" },
    { actionId: "charging-load-test", optionId: "below-12-5" },
    { actionId: "charging-ripple-known", optionId: "no" },
    { actionId: "charging-current-output-known", optionId: "no" },
    { actionId: "charging-voltage-drop-positive-known", optionId: "no" },
    { actionId: "charging-voltage-drop-ground-known", optionId: "yes" },
    { actionId: "charging-voltage-drop-ground-value", optionId: "above-0-2" },
    { actionId: "charging-ground-check", optionId: "bad" },
  ],
};

const originalLog = console.log;
console.log = () => {};

const rows: string[] = [];

for (const [name, steps] of Object.entries(scenarios)) {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `forced-mechanic-${name}`,
      "mecanicien-garage",
      "charging",
      [],
    );

  rows.push("");
  rows.push(`=== ${name} ===`);

  for (let i = 0; i < steps.length; i++) {

    const expected =
      steps[i];

    const actual =
      result.action?.id ?? "NONE";

    const top =
      result.reasoning.decision.probabilities[0];

    rows.push(
      [
        `${i + 1}.`,
        `attendu=${expected.actionId}`,
        `obtenu=${actual}`,
        `TOP=${top?.hypothesis.id ?? "NONE"}`,
        `P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
        `completed=${result.completed}`,
        `questions=${result.session.actionResults.length}`,
      ].join(" | "),
    );

    if (actual !== expected.actionId) {
      rows.push("   >>> ECART ICI");
      break;
    }

    result =
      engine.answer(
        result.session,
        "charging",
        expected.actionId,
        expected.optionId,
      );
  }
}

console.log = originalLog;

console.log("");
console.log(
  "=== MECANICIEN FORCED DEEP WORKFLOW ===",
);

for (const row of rows) {
  console.log(row);
}
