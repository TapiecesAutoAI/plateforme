import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const scenarios = [
  [
    ["battery-main-symptom", "warning-light"],
    ["battery-light-behaviour", "engine-running"],
    ["battery-charging-voltage-known", "yes"],
    ["battery-charging-voltage-value", "below-12-8"],
    ["battery-belt-check", "missing"],
  ],
  [
    ["battery-main-symptom", "warning-light"],
    ["battery-light-behaviour", "engine-running"],
    ["battery-charging-voltage-known", "yes"],
    ["battery-charging-voltage-value", "below-12-8"],
    ["battery-belt-check", "loose"],
  ],
  [
    ["battery-main-symptom", "warning-light"],
    ["battery-light-behaviour", "engine-running"],
    ["battery-charging-voltage-known", "yes"],
    ["battery-charging-voltage-value", "13-5-to-14-8"],
    ["battery-charging-load-known", "no"],
  ],
] as const;

const realLog = console.log;
console.log = () => {};

const rows: string[] = [];

for (
  let s = 0;
  s < scenarios.length;
  s++
) {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `battery-manual-review-${s}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  let valid = true;

  for (
    const [actionId, optionId]
    of scenarios[s]
  ) {

    if (
      !result.action ||
      result.action.id !== actionId
    ) {
      rows.push(
        `CASE ${s + 1} ECART attendu=${actionId} obtenu=${result.action?.id ?? "NONE"}`,
      );

      valid = false;
      break;
    }

    result =
      engine.answer(
        result.session,
        "battery",
        actionId,
        optionId,
      );
  }

  if (!valid) {
    continue;
  }

  const top =
    result.reasoning
      .decision
      .probabilities[0];

  rows.push("");
  rows.push(`=== CASE ${s + 1} ===`);
  rows.push(`completed=${result.completed}`);
  rows.push(`status=${result.session.status}`);
  rows.push(`action=${result.action?.id ?? "NONE"}`);
  rows.push(`conclusion=${result.session.conclusion?.diagnosisId ?? "NONE"}`);
  rows.push(
    `TOP=${top?.hypothesis.id ?? "NONE"} | P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
  );
}

console.log = realLog;

console.log("");
console.log(
  "=== BATTERY MANUAL REVIEW AUDIT ===",
);

for (const row of rows) {
  console.log(row);
}
