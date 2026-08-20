import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const TARGETS = [
  "charging-voltage-drop-ground-value",
  "charging-ground-check",
  "charging-voltage-drop-positive-value",
  "charging-positive-cable-check",
  "charging-battery-sensor-check",
];

const MAX_PATHS = 3000;
const MAX_DEPTH = 12;

type TargetStats = {
  contextSeen: number;
  gainSeen: number;
  maxGain: number;
  maxRank: number | null;
  bestPath: string;
};

const stats =
  new Map<string, TargetStats>();

for (const id of TARGETS) {
  stats.set(id, {
    contextSeen: 0,
    gainSeen: 0,
    maxGain: 0,
    maxRank: null,
    bestPath: "",
  });
}

function formatPath(
  path: Choice[],
): string {
  return path
    .map(
      item =>
        `${item.actionId}=${item.optionId}`,
    )
    .join(" -> ");
}

function replay(
  path: Choice[],
) {
  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `charging-target-gain-${Math.random()}`,
      "depanneur",
      "charging",
      [],
    );

  for (const choice of path) {

    if (
      result.completed ||
      !result.action
    ) {
      break;
    }

    if (
      result.action.id !==
      choice.actionId
    ) {
      break;
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

  const result =
    replay(path);

  const contextQuestions =
    [
      ...result.reasoning
        .context
        .questions
        .keys(),
    ];

  const gains =
    result.reasoning
      .decision
      .informationGains;

  for (
    const targetId
    of TARGETS
  ) {
    const stat =
      stats.get(targetId)!;

    if (
      contextQuestions.includes(
        targetId,
      )
    ) {
      stat.contextSeen++;
    }

    const index =
      gains.findIndex(
        item =>
          item.question.id ===
          targetId,
      );

    if (index >= 0) {
      stat.gainSeen++;

      const gain =
        gains[index].gain;

      if (
        stat.maxRank === null ||
        index + 1 <
          stat.maxRank
      ) {
        stat.maxRank =
          index + 1;
      }

      if (
        gain >
        stat.maxGain
      ) {
        stat.maxGain =
          gain;

        stat.bestPath =
          formatPath(path);
      }
    }
  }

  if (
    result.completed ||
    !result.action ||
    result.action.type ===
      "complete-diagnosis" ||
    path.length >=
      MAX_DEPTH
  ) {
    continue;
  }

  for (
    const option
    of result.action.options ??
      []
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
  "=== TARGET QUESTION GAIN AUDIT ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

for (
  const [id, stat]
  of stats
) {
  console.log("");
  console.log(id);

  console.log(
    `  present contexte : ${stat.contextSeen}`,
  );

  console.log(
    `  present IG       : ${stat.gainSeen}`,
  );

  console.log(
    `  meilleur rang    : ${stat.maxRank ?? "JAMAIS"}`,
  );

  console.log(
    `  gain max         : ${stat.maxGain.toFixed(3)}`,
  );

  console.log(
    `  meilleur parcours: ${stat.bestPath || "-"}`,
  );
}
