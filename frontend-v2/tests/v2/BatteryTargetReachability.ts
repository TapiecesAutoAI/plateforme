import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const targets = [
  "battery-post-charge-voltage-value",
  "battery-charging-voltage-value",
  "battery-belt-check",
  "battery-alternator-connection-check",
];

const counts =
  new Map<string, number>();

for (const target of targets) {
  counts.set(target, 0);
}

const MAX_PATHS = 3000;

type Choice = {
  actionId: string;
  optionId: string;
};

const queue: Choice[][] = [
  [],
];

let explored = 0;

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
      `battery-reach-${explored}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  let valid =
    true;

  for (
    const step
    of path
  ) {

    if (
      !result.action ||
      result.completed ||
      result.action.id !==
        step.actionId
    ) {
      valid =
        false;

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

  const actionId =
    result.action?.id;

  if (
    actionId &&
    counts.has(actionId)
  ) {
    counts.set(
      actionId,
      (
        counts.get(actionId) ??
        0
      ) + 1,
    );
  }

  if (
    result.completed ||
    !result.action
  ) {
    continue;
  }

  const options =
    result.action.options ??
    [];

  for (
    const option
    of options
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
  "=== BATTERY TARGET REACHABILITY ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

for (
  const target
  of targets
) {
  console.log(
    `${target}: ${counts.get(target) ?? 0}`,
  );
}
