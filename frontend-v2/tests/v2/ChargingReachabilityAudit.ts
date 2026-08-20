import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

type HypothesisStats = {
  topCount: number;
  terminalCount: number;
  maximumProbability: number;
  bestPath: Choice[];
};

const MAX_DEPTH = 12;
const MAX_PATHS = 5000;

const statistics =
  new Map<
    string,
    HypothesisStats
  >();

function updateStats(
  result:
    ReturnType<
      DiagnosticEngineV2["createSession"]
    >,
  path:
    Choice[],
) {
  const primary =
    result.reasoning
      .decision
      .probabilities[0] ??
    null;

  if (!primary) {
    return;
  }

  const id =
    primary.hypothesis.id;

  const probability =
    primary.probability;

  const current =
    statistics.get(id) ?? {
      topCount:
        0,
      terminalCount:
        0,
      maximumProbability:
        0,
      bestPath:
        [],
    };

  current.topCount +=
    1;

  if (
    probability >
    current.maximumProbability
  ) {
    current.maximumProbability =
      probability;

    current.bestPath = [
      ...path,
    ];
  }

  if (
    result.completed
  ) {
    current.terminalCount +=
      1;
  }

  statistics.set(
    id,
    current,
  );
}

function replay(
  path:
    Choice[],
) {
  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `charging-reachability-${Date.now()}-${Math.random()}`,
      "particulier",
      "charging",
      [],
    );

  for (
    const choice
    of path
  ) {
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

function formatPath(
  path:
    Choice[],
): string {
  return path
    .map(
      choice =>
        `${choice.actionId}=${choice.optionId}`,
    )
    .join(
      " -> ",
    );
}

function run() {
  const originalLog =
    console.log;

  console.log = () => {};

  const queue:
    Choice[][] = [
      [],
    ];

  let explored =
    0;

  while (
    queue.length >
      0 &&
    explored <
      MAX_PATHS
  ) {
    const path =
      queue.shift()!;

    explored +=
      1;

    const result =
      replay(
        path,
      );

    updateStats(
      result,
      path,
    );

    if (
      result.completed ||
      !result.action ||
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
    originalLog;

  console.log("");
  console.log(
    "=== CHARGING REAL REACHABILITY AUDIT ===",
  );

  console.log(
    `États explorés : ${explored}`,
  );

  for (
    const [
      id,
      stats,
    ]
    of [
      ...statistics.entries(),
    ].sort(
      (
        first,
        second,
      ) =>
        second[1]
          .maximumProbability -
        first[1]
          .maximumProbability,
    )
  ) {
    console.log("");
    console.log(id);

    console.log(
      `  TOP 1 pendant parcours : ${stats.topCount}`,
    );

    console.log(
      `  conclusions terminales : ${stats.terminalCount}`,
    );

    console.log(
      `  probabilité max réelle : ${(stats.maximumProbability * 100).toFixed(2)} %`,
    );

    console.log(
      `  meilleur parcours      : ${formatPath(stats.bestPath)}`,
    );
  }
}

run();