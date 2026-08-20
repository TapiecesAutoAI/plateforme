import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const TARGETS = new Set([
  "charging-voltage-drop-ground-value",
  "charging-ground-check",
  "charging-voltage-drop-positive-value",
  "charging-positive-cable-check",
  "charging-battery-sensor-check",
]);

const MAX_PATHS = 5000;
const MAX_DEPTH = 12;

const counts =
  new Map<string, number>();

for (const id of TARGETS) {
  counts.set(id, 0);
}

function replay(
  path: Choice[],
) {
  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `charging-target-reach-${Math.random()}`,
      "mecanicien-garage",
      "charging",
      [],
    );

  for (const choice of path) {

    if (
      result.completed ||
      !result.action
    ) {
      return result;
    }

    if (
      result.action.id !==
      choice.actionId
    ) {
      return result;
    }

    result =
      engine.answer(
        result.session,
        "charging",
        choice.actionId,
        choice.optionId,
      );
  }

  return result;
}

const queue: Choice[][] = [
  [],
];

let explored = 0;

while (
  queue.length > 0 &&
  explored < MAX_PATHS
) {
  const path =
    queue.shift()!;

  explored++;

  const result =
    replay(path);

  const action =
    result.action;

  if (!action) {
    continue;
  }

  if (
    TARGETS.has(
      action.id,
    )
  ) {
    counts.set(
      action.id,
      (
        counts.get(
          action.id,
        ) ?? 0
      ) + 1,
    );
  }

  if (
    result.completed ||
    action.type ===
      "complete-diagnosis" ||
    path.length >=
      MAX_DEPTH
  ) {
    continue;
  }

  for (
    const option
    of action.options ?? []
  ) {
    queue.push([
      ...path,
      {
        actionId:
          action.id,

        optionId:
          option.id,
      },
    ]);
  }
}

console.log("");
console.log(
  "=== TARGET ACTION REACHABILITY ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

for (
  const [id, count]
  of counts
) {
  console.log(
    `${id}: ${count}`,
  );
}
