import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

const result =
  engine.createSession(
    "charging-option-discrimination",
    "mecanicien-garage",
    "charging",
    [],
  );

const context =
  result.reasoning.context;

const wanted = new Set([
  "charging-voltage-value",
  "charging-load-test",
  "charging-belt-check",
  "charging-field-command-result",
  "charging-voltage-drop-positive-value",
  "charging-voltage-drop-ground-value",
  "charging-battery-sensor-check",
  "charging-freewheel-pulley-check",
]);

console.log(
  "\n=== CHARGING OPTION DISCRIMINATION AUDIT ===",
);

for (
  const question
  of context.questions.values()
) {
  if (!wanted.has(question.id)) {
    continue;
  }

  console.log("");
  console.log(
    `QUESTION: ${question.id}`,
  );

  console.log(
    `targets global: [${question.targetHypothesisIds.join(",")}]`,
  );

  for (
    const option
    of question.options
  ) {
    console.log(
      [
        `  option=${option.id}`,
        `evidence=${option.evidenceId ?? "-"}`,
        `value=${option.value ?? "-"}`,
      ].join(" | "),
    );
  }
}
