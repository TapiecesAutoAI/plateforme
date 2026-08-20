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
let found = 0;

const realLog =
  console.log;

console.log = () => {};

const rows: string[] = [];

while (
  queue.length > 0 &&
  explored < MAX_PATHS &&
  found < 10
) {

  const path =
    queue.shift()!;

  explored++;

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `battery-terminal-none-${explored}`,
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

  if (result.completed) {

    const hasChargingLow =
      result.session.evidence.some(
        e =>
          e.id ===
          "measurement-charging-voltage-below-12-8",
      );

    if (
      hasChargingLow &&
      !result.session.conclusion
    ) {

      found++;

      const top =
        result.reasoning
          .decision
          .probabilities[0];

      rows.push("");
      rows.push(
        `=== CASE ${found} ===`,
      );

      rows.push(
        path
          .map(
            x =>
              `${x.actionId}=${x.optionId}`,
          )
          .join(" -> "),
      );

      rows.push(
        `completed=${result.completed}`,
      );

      rows.push(
        `status=${result.session.status}`,
      );

      rows.push(
        `TOP=${top?.hypothesis.id ?? "NONE"} | P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
      );

      rows.push(
        `conclusion=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
      );

      rows.push(
        `currentAction=${result.session.currentActionId ?? "NONE"}`,
      );

      rows.push(
        `action=${result.action?.id ?? "NONE"}`,
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
  "=== BATTERY COMPLETED WITHOUT CONCLUSION ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

console.log(
  `Cas trouves : ${found}`,
);

for (const row of rows) {
  console.log(row);
}
