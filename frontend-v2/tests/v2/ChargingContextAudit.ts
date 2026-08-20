import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

const result =
  engine.createSession(
    "charging-context-audit",
    "mecanicien-garage",
    "charging",
    [],
  );

const context =
  result.reasoning.context;

console.log("");
console.log(
  "=== CHARGING CONTEXT AUDIT ===",
);

console.log("");
console.log(
  "ACTIVE HYPOTHESES:",
);

for (
  const id
  of context.activeHypothesisIds
) {
  console.log(
    `- ${id}`,
  );
}

console.log("");
console.log(
  "ELIMINATED HYPOTHESES:",
);

for (
  const id
  of context.eliminatedHypothesisIds
) {
  console.log(
    `- ${id}`,
  );
}

const wantedQuestions =
  new Set([
    "charging-main-symptom",
    "charging-voltage-value",
    "charging-belt-check",
    "charging-field-command-result",
    "charging-voltage-drop-positive-value",
    "charging-voltage-drop-ground-value",
    "charging-battery-sensor-check",
    "charging-freewheel-pulley-check",
  ]);

console.log("");
console.log(
  "=== QUESTION TARGETS ===",
);

for (
  const question
  of context.questions.values()
) {
  if (
    !wantedQuestions.has(
      question.id,
    )
  ) {
    continue;
  }

  console.log("");
  console.log(
    `QUESTION: ${question.id}`,
  );

  console.log(
    "targetEvidenceIds:",
    question.targetEvidenceIds,
  );

  console.log(
    "targetHypothesisIds:",
    question.targetHypothesisIds,
  );
}

console.log("");
console.log(
  "=== INFORMATION GAINS ===",
);

for (
  const gain
  of result.reasoning
    .decision
    .informationGains
    .slice(0, 15)
) {
  console.log(
    `${gain.question.id} | gain=${gain.gain.toFixed(3)} | reduction=${gain.expectedReduction.toFixed(3)}`,
  );
}
