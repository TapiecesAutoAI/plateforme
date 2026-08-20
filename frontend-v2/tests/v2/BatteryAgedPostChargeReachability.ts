import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const MAX_PATHS = 5000;
const MAX_HITS = 20;

const queue: Choice[][] = [[]];

let explored = 0;
let hits = 0;

const rows: string[] = [];

const realLog = console.log;
console.log = () => {};

while (
  queue.length > 0 &&
  explored < MAX_PATHS &&
  hits < MAX_HITS
) {

  const path = queue.shift()!;
  explored++;

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `battery-aged-evidence-${explored}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  let valid = true;

  for (const step of path) {

    if (
      !result.action ||
      result.completed ||
      result.action.id !== step.actionId
    ) {
      valid = false;
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

  if (!valid) {
    continue;
  }

  const hasPostChargeLow =
    result.session.evidence.some(
      e =>
        e.id ===
        "measurement-post-charge-below-12-2",
    );

  if (hasPostChargeLow) {

    hits++;

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    rows.push("");
    rows.push(`=== HIT ${hits} ===`);

    rows.push(
      path
        .map(
          x =>
            `${x.actionId}=${x.optionId}`,
        )
        .join(" -> "),
    );

    rows.push(
      `TOP=${top?.hypothesis.id ?? "NONE"} | P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
    );

    rows.push(
      `status=${result.session.status}`,
    );

    rows.push(
      `completed=${result.completed}`,
    );

    rows.push(
      `next=${result.action?.id ?? "NONE"}`,
    );

    rows.push(
      `conclusion=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
    );

    continue;
  }

  if (
    result.completed ||
    result.session.status ===
      "manual-review-required" ||
    !result.action
  ) {
    continue;
  }

  for (
    const option
    of result.action.options ?? []
  ) {
    queue.push([
      ...path,
      {
        actionId:
          result.action.id,
        optionId:
          option.id,
      },
    ]);
  }
}

console.log = realLog;

console.log("");
console.log(
  "=== AGED BATTERY POST-CHARGE LOW REACHABILITY ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

console.log(
  `Hits : ${hits}`,
);

for (const row of rows) {
  console.log(row);
}
