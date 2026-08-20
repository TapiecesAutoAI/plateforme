import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

let result =
  engine.createSession(
    "battery-aged-ranking-audit",
    "mecanicien-garage",
    "battery",
    [],
  );

const steps = [
  ["battery-main-symptom", "flat"],
  ["battery-age", "over-four"],
  ["battery-case-check", "normal"],
  ["battery-rest-voltage-known", "yes"],
  ["battery-rest-voltage-value", "below-11-8"],
  ["battery-terminals-check", "good"],
  ["battery-ground-check", "good"],
  ["battery-jump-start-test", "success"],
  ["battery-restart-after-jump", "fails"],
  ["battery-post-charge-voltage-known", "yes"],
  ["battery-post-charge-voltage-value", "below-12-2"],
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
      "battery",
      actionId,
      optionId,
    );
}

console.log =
  realLog;

console.log("");
console.log(
  "=== AGED BATTERY PROBABILITY RANKING ===",
);

for (
  const p
  of result.reasoning
    .decision
    .probabilities
) {
  console.log(
    [
      p.hypothesis.id,
      `P=${(p.probability * 100).toFixed(2)}%`,
      `score=${p.score}`,
      `support=${p.support}`,
      `contradiction=${p.contradiction}`,
    ].join(" | "),
  );
}

console.log("");
console.log(
  `NEXT=${result.action?.id ?? "NONE"}`,
);
