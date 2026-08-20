import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const MAX_PATHS = 4000;

const queue: Choice[][] = [
  [],
];

let explored = 0;

const rows: string[] = [];

const realLog =
  console.log;

console.log = () => {};

while (
  queue.length > 0 &&
  explored < MAX_PATHS
) {

  const path =
    queue.shift()!;

  explored++;

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `battery-outcome-${explored}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  let valid =
    true;

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

  if (result.completed) {

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    const hasPostChargeLow =
      result.session.evidence.some(
        e =>
          e.id ===
          "measurement-post-charge-below-12-2",
      );

    const hasChargingLow =
      result.session.evidence.some(
        e =>
          e.id ===
          "measurement-charging-voltage-below-12-8",
      );

    if (
      hasPostChargeLow ||
      hasChargingLow
    ) {
      rows.push(
        [
          hasPostChargeLow
            ? "POSTCHARGE-LOW"
            : "CHARGING-LOW",
          `TOP=${top?.hypothesis.id ?? "NONE"}`,
          `P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
          `CONCLUSION=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
        ].join(" | "),
      );
    }

    continue;
  }

  if (!result.action) {
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

console.log =
  realLog;

console.log("");
console.log(
  "=== BATTERY TARGET OUTCOMES ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

for (
  const row
  of rows.slice(0, 100)
) {
  console.log(row);
}

console.log("");
console.log(
  `Occurrences cibles : ${rows.length}`,
);
