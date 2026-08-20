import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

type RecoveryStats = {
  count: number;
  optionCount: number;
  hypotheses: Map<string, number>;
};

const MAX_PATHS = 3000;
const MAX_DEPTH = 25;

const queue: Choice[][] = [
  [],
];

let explored = 0;
let manualReviews = 0;
let recoverable = 0;
let nonRecoverable = 0;

const byQuestion =
  new Map<string, RecoveryStats>();

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
      `braking-expansion-${explored}`,
      "mecanicien-garage",
      "braking",
      [],
    );

  let valid = true;

  for (
    const choice
    of path
  ) {

    if (
      result.completed ||
      !result.action ||
      result.action.id !==
        choice.actionId
    ) {

      valid = false;
      break;
    }

    const option =
      result.action.options?.find(
        item =>
          item.id ===
          choice.optionId,
      );

    if (!option) {

      valid = false;
      break;
    }

    result =
      engine.answer(
        result.session,
        "braking",
        result.action.id,
        option.id,
      );
  }

  if (!valid) {
    continue;
  }

  if (result.completed) {
    continue;
  }

  let manualResult =
    result;

  if (
    result.action?.type ===
      "complete-diagnosis"
  ) {

    manualResult =
      engine.evaluateSession(
        result.session,
        "braking",
      );
  }

  if (
    !manualResult.completed &&
    manualResult.session.status ===
      "manual-review-required"
  ) {

    manualReviews++;

    const top =
      manualResult.reasoning
        .decision
        .probabilities[0];

    const topId =
      top?.hypothesis.id ??
      "NONE";

    const recovery =
      engine.evaluateSession(
        manualResult.session,
        "braking",
      );

    if (
      recovery.session.status ===
        "waiting-for-user" &&
      recovery.action
    ) {

      recoverable++;

      const questionId =
        recovery.action.id;

      const optionCount =
        recovery.action.options
          ?.length ?? 0;

      let stats =
        byQuestion.get(
          questionId,
        );

      if (!stats) {

        stats = {
          count: 0,
          optionCount,
          hypotheses:
            new Map<string, number>(),
        };

        byQuestion.set(
          questionId,
          stats,
        );
      }

      stats.count++;

      stats.optionCount =
        Math.max(
          stats.optionCount,
          optionCount,
        );

      stats.hypotheses.set(
        topId,
        (
          stats.hypotheses.get(
            topId,
          ) ?? 0
        ) + 1,
      );

    } else {

      nonRecoverable++;
    }

    continue;
  }

  if (
    !result.action ||
    path.length >=
      MAX_DEPTH
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

console.log =
  realLog;

console.log("");
console.log(
  "=== BRAKING CONFIRMATION EXPANSION AUDIT ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

console.log(
  `Manual reviews baseline : ${manualReviews}`,
);

console.log(
  `Recoverables : ${recoverable}`,
);

console.log(
  `Non recoverables : ${nonRecoverable}`,
);

console.log("");
console.log(
  "=== QUESTIONS DE RECUPERATION ===",
);

for (
  const [
    questionId,
    stats,
  ]
  of [
    ...byQuestion.entries(),
  ].sort(
    (a, b) =>
      b[1].count -
      a[1].count,
  )
) {

  console.log("");

  console.log(
    questionId,
  );

  console.log(
    `  occurrences=${stats.count}`,
  );

  console.log(
    `  options=${stats.optionCount}`,
  );

  console.log(
    "  hypotheses:",
  );

  for (
    const [
      hypothesisId,
      count,
    ]
    of [
      ...stats
        .hypotheses
        .entries(),
    ].sort(
      (a, b) =>
        b[1] - a[1],
    )
  ) {

    console.log(
      `    ${hypothesisId}: ${count}`,
    );
  }
}

let immediateChildren =
  0;

for (
  const stats
  of byQuestion.values()
) {

  immediateChildren +=
    stats.count *
    stats.optionCount;
}

console.log("");
console.log(
  "=== FACTEUR DE BRANCHEMENT THEORIQUE ===",
);

console.log(
  `Manual reviews recuperables : ${recoverable}`,
);

console.log(
  `Enfants immediats potentiels : ${immediateChildren}`,
);

console.log(
  `Facteur moyen : ${
    recoverable > 0
      ? (
          immediateChildren /
          recoverable
        ).toFixed(2)
      : "0"
  }`,
);

console.log("");
console.log(
  "=== FIN AUDIT ===",
);
