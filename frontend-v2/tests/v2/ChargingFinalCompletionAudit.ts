import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

let result =
  engine.createSession(
    "charging-final-completion-audit",
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

const realLog =
  console.log;

console.log = () => {};

for (
  const [actionId, optionId]
  of steps
) {

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

console.log =
  realLog;

const top =
  result.reasoning
    .decision
    .probabilities[0];

console.log("");
console.log(
  "=== CHARGING FINAL COMPLETION AUDIT ===",
);

console.log(
  `completed=${result.completed}`,
);

console.log(
  `action=${result.action?.id ?? "NONE"}`,
);

console.log(
  `status=${result.session.status}`,
);

console.log(
  `TOP=${top?.hypothesis.id ?? "NONE"}`,
);

console.log(
  `P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
);

console.log("");
console.log(
  "=== SESSION KEYS ===",
);

console.log(
  Object.keys(
    result.session,
  ).sort(),
);

console.log("");
console.log(
  "=== SESSION FINAL ===",
);

console.dir(
  result.session,
  {
    depth: 4,
  },
);
