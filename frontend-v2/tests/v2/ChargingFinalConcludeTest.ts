import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

let result =
  engine.createSession(
    "charging-final-conclude-test",
    "mecanicien-garage",
    "charging",
    [],
  );

const steps = [
  ["charging-main-symptom", "battery-discharges"],
  ["charging-voltage-known", "yes"],
  ["charging-voltage-value", "below-12-5"],
  ["charging-rpm-test", "no-change"],
  ["charging-field-command-known", "no"],
  ["charging-diagnostic-codes-known", "yes"],
  ["charging-code-family", "battery-sensor"],
  ["charging-battery-sensor-check", "bad"],
] as const;

for (const [actionId, optionId] of steps) {

  if (
    !result.action ||
    result.action.id !== actionId
  ) {
    throw new Error(
      `Attendu ${actionId}, obtenu ${result.action?.id ?? "NONE"}`,
    );
  }

  result =
    engine.answer(
      result.session,
      "charging",
      actionId,
      optionId,
    );
}

console.log("");
console.log("=== BEFORE CONCLUDE ===");
console.log(
  `action=${result.action?.id ?? "NONE"}`,
);
console.log(
  `type=${result.action?.type ?? "NONE"}`,
);
console.log(
  `completed=${result.completed}`,
);

const beforeTop =
  result.reasoning.decision.probabilities[0];

console.log(
  `TOP=${beforeTop?.hypothesis.id ?? "NONE"} | P=${((beforeTop?.probability ?? 0) * 100).toFixed(2)}%`,
);

if (
  result.action?.id !==
  "charging-conclude"
) {
  throw new Error(
    "charging-conclude non sélectionné.",
  );
}

result =
  engine.evaluateSession(
    result.session,
    "charging",
  );

console.log("");
console.log("=== AFTER CONCLUDE ===");
console.log(
  `completed=${result.completed}`,
);
console.log(
  `action=${result.action?.id ?? "NONE"}`,
);
console.log(
  `diagnosisId=${result.diagnosisId ?? "NONE"}`,
);

const afterTop =
  result.reasoning.decision.probabilities[0];

console.log(
  `TOP=${afterTop?.hypothesis.id ?? "NONE"} | P=${((afterTop?.probability ?? 0) * 100).toFixed(2)}%`,
);
