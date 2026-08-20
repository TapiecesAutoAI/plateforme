import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const queue: Choice[][] = [[]];

const MAX_PATHS = 3000;
const MAX_DEPTH = 25;

let explored = 0;
let manualReviews = 0;

let recoveredToQuestion = 0;
let recoveredToCompleted = 0;
let stillManualReview = 0;
let other = 0;

const recoveredQuestions =
  new Map<string, number>();

const topHypotheses =
  new Map<string, number>();

const realLog = console.log;

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
      `braking-recovery-${explored}`,
      "mecanicien-garage",
      "braking",
      [],
    );

  let valid = true;

  for (const choice of path) {

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
          item.id === choice.optionId,
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

  if (
    !result.action &&
    result.session.status ===
      "manual-review-required"
  ) {

    manualReviews++;

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    const topId =
      top?.hypothesis.id ??
      "NONE";

    topHypotheses.set(
      topId,
      (topHypotheses.get(topId) ?? 0) + 1,
    );

    const evaluated =
      engine.evaluateSession(
        result.session,
        "braking",
      );

    if (evaluated.completed) {

      recoveredToCompleted++;

      continue;
    }

    if (
      evaluated.session.status ===
        "waiting-for-user" &&
      evaluated.action
    ) {

      recoveredToQuestion++;

      recoveredQuestions.set(
        evaluated.action.id,
        (
          recoveredQuestions.get(
            evaluated.action.id,
          ) ??
          0
        ) + 1,
      );

      continue;
    }

    if (
      evaluated.session.status ===
        "manual-review-required"
    ) {

      stillManualReview++;

      continue;
    }

    other++;

    continue;
  }

  if (
    result.action?.type ===
      "complete-diagnosis"
  ) {

    const evaluated =
      engine.evaluateSession(
        result.session,
        "braking",
      );

    if (
      !evaluated.completed &&
      evaluated.session.status ===
        "manual-review-required"
    ) {

      manualReviews++;

      const secondEvaluation =
        engine.evaluateSession(
          evaluated.session,
          "braking",
        );

      if (
        secondEvaluation.completed
      ) {

        recoveredToCompleted++;

      } else if (
        secondEvaluation
          .session.status ===
          "waiting-for-user" &&
        secondEvaluation.action
      ) {

        recoveredToQuestion++;

        recoveredQuestions.set(
          secondEvaluation.action.id,
          (
            recoveredQuestions.get(
              secondEvaluation.action.id,
            ) ??
            0
          ) + 1,
        );

      } else if (
        secondEvaluation
          .session.status ===
          "manual-review-required"
      ) {

        stillManualReview++;

      } else {

        other++;
      }

      continue;
    }
  }

  if (
    !result.action ||
    path.length >= MAX_DEPTH
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
  "=== BRAKING MANUAL REVIEW RECOVERY AUDIT ===",
);

console.log(
  `Parcours explores       : ${explored}`,
);

console.log(
  `Manual reviews          : ${manualReviews}`,
);

console.log(
  `Recuperes -> question   : ${recoveredToQuestion}`,
);

console.log(
  `Recuperes -> completed  : ${recoveredToCompleted}`,
);

console.log(
  `Toujours manual review  : ${stillManualReview}`,
);

console.log(
  `Autres                  : ${other}`,
);

console.log("");
console.log(
  "=== QUESTIONS DE RECUPERATION ===",
);

for (
  const [id, count]
  of [
    ...recoveredQuestions.entries(),
  ].sort(
    (a, b) =>
      b[1] - a[1],
  )
) {

  console.log(
    `${id}: ${count}`,
  );
}

console.log("");
console.log(
  "=== TOP HYPOTHESES DES MANUAL REVIEWS ===",
);

for (
  const [id, count]
  of [
    ...topHypotheses.entries(),
  ].sort(
    (a, b) =>
      b[1] - a[1],
  )
) {

  console.log(
    `${id}: ${count}`,
  );
}

console.log("");
console.log(
  "=== CONTROLE TOTAL ===",
);

console.log(
  `Somme categories = ${
    recoveredToQuestion +
    recoveredToCompleted +
    stillManualReview +
    other
  }`,
);

console.log(
  `Manual reviews    = ${manualReviews}`,
);

console.log(
  "=== FIN ===",
);
