import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

import {
  buildDiagnosticAmbiguity,
} from "../../engine/reasoning/DiagnosticAmbiguity";

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

const realLog =
  console.log;

console.log =
  () => {};

const rows:
  string[] = [];

for (
  let s = 0;
  s < scenarios.length;
  s++
) {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `battery-manual-review-ambiguity-${s}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  let valid =
    true;

  for (
    const [actionId, optionId]
    of scenarios[s]
  ) {

    if (
      !result.action ||
      result.action.id !==
        actionId
    ) {

      rows.push("");
      rows.push(
        `=== CASE ${s + 1} ===`,
      );

      rows.push(
        `ECART attendu=${actionId} obtenu=${result.action?.id ?? "NONE"}`,
      );

      valid =
        false;

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

  if (
    !valid
  ) {
    continue;
  }

  const probabilities =
    result.reasoning
      .decision
      .probabilities;

  const top1 =
    probabilities[0] ??
    null;

  const top2 =
    probabilities[1] ??
    null;

  const lead =
    top1 &&
    top2
      ? top1.probability -
        top2.probability
      : 0;

  const ambiguity =
    buildDiagnosticAmbiguity(
      result.session.status,
      probabilities,
      result.completionAdvice ??
        null,
    );

  rows.push("");
  rows.push(
    `=== CASE ${s + 1} ===`,
  );

  rows.push(
    `completed=${result.completed}`,
  );

  rows.push(
    `status=${result.session.status}`,
  );

  rows.push(
    `action=${result.action?.id ?? "NONE"}`,
  );

  rows.push(
    `conclusion=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
  );

  rows.push("");

  rows.push(
    `TOP1=${top1?.hypothesis.id ?? "NONE"} | P=${((top1?.probability ?? 0) * 100).toFixed(2)}%`,
  );

  rows.push(
    `TOP2=${top2?.hypothesis.id ?? "NONE"} | P=${((top2?.probability ?? 0) * 100).toFixed(2)}%`,
  );

  rows.push(
    `LEAD=${(
      lead *
      100
    ).toFixed(2)}%`,
  );

  rows.push("");

  rows.push(
    `NEXT_BEST_ID=${result.completionAdvice?.nextBestQuestionId ?? "NONE"}`,
  );

  rows.push(
    `NEXT_BEST_TEXT=${result.completionAdvice?.nextBestQuestionText ?? "NONE"}`,
  );

  rows.push("");

  rows.push(
    `AMBIGUITY=${ambiguity ? "YES" : "NO"}`,
  );

  if (
    ambiguity
  ) {

    rows.push(
      `CANDIDATE_1=${ambiguity.candidates[0]?.hypothesisId ?? "NONE"} | ${ambiguity.candidates[0]?.confidencePercentage ?? 0}%`,
    );

    rows.push(
      `CANDIDATE_2=${ambiguity.candidates[1]?.hypothesisId ?? "NONE"} | ${ambiguity.candidates[1]?.confidencePercentage ?? 0}%`,
    );

    rows.push(
      `FINAL_CHECK_ID=${ambiguity.finalCheck.questionId ?? "NONE"}`,
    );

    rows.push(
      `FINAL_CHECK_TEXT=${ambiguity.finalCheck.text ?? "NONE"}`,
    );

    rows.push(
      `MESSAGE=${ambiguity.message}`,
    );
  }
}

console.log =
  realLog;

console.log("");
console.log(
  "============================================================",
);

console.log(
  " BATTERY MANUAL REVIEW AMBIGUITY AUDIT",
);

console.log(
  "============================================================",
);

for (
  const row
  of rows
) {
  console.log(
    row,
  );
}