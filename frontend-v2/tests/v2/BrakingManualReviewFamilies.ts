import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

type Family = {
  count: number;
  top1: string;
  top2: string;
  lastAction: string;
  recoveryAction: string;
  examples: string[];
};

const MAX_PATHS = 3000;
const MAX_DEPTH = 25;

const queue: Choice[][] = [
  [],
];

const families =
  new Map<string, Family>();

let explored = 0;
let manualReviews = 0;

function pathText(
  path: Choice[],
): string {

  return path
    .map(
      x =>
        `${x.actionId}=${x.optionId}`,
    )
    .join(" -> ");
}

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
      `braking-family-${explored}`,
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
        o =>
          o.id ===
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

  if (
    result.completed
  ) {
    continue;
  }

  if (
    !result.action &&
    result.session.status ===
      "manual-review-required"
  ) {

    manualReviews++;

    const probs =
      result.reasoning
        .decision
        .probabilities;

    const top1 =
      probs[0]?.hypothesis.id ??
      "NONE";

    const top2 =
      probs[1]?.hypothesis.id ??
      "NONE";

    const lastAction =
      path.length > 0
        ? path[
            path.length - 1
          ].actionId
        : "NONE";

    const recovery =
      engine.evaluateSession(
        result.session,
        "braking",
      );

    const recoveryAction =
      recovery.action?.id ??
      "NONE";

    const key =
      [
        top1,
        top2,
        lastAction,
        recoveryAction,
      ].join("|");

    let family =
      families.get(key);

    if (!family) {

      family = {
        count: 0,
        top1,
        top2,
        lastAction,
        recoveryAction,
        examples: [],
      };

      families.set(
        key,
        family,
      );
    }

    family.count++;

    if (
      family.examples.length <
      3
    ) {

      family.examples.push(
        pathText(path),
      );
    }

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

      const probs =
        evaluated.reasoning
          .decision
          .probabilities;

      const top1 =
        probs[0]?.hypothesis.id ??
        "NONE";

      const top2 =
        probs[1]?.hypothesis.id ??
        "NONE";

      const lastAction =
        path.length > 0
          ? path[
              path.length - 1
            ].actionId
          : "NONE";

      const recovery =
        engine.evaluateSession(
          evaluated.session,
          "braking",
        );

      const recoveryAction =
        recovery.action?.id ??
        "NONE";

      const key =
        [
          top1,
          top2,
          lastAction,
          recoveryAction,
        ].join("|");

      let family =
        families.get(key);

      if (!family) {

        family = {
          count: 0,
          top1,
          top2,
          lastAction,
          recoveryAction,
          examples: [],
        };

        families.set(
          key,
          family,
        );
      }

      family.count++;

      if (
        family.examples.length <
        3
      ) {

        family.examples.push(
          pathText(path),
        );
      }

      continue;
    }
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
  "=== BRAKING MANUAL REVIEW FAMILIES ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

console.log(
  `Manual reviews : ${manualReviews}`,
);

console.log(
  `Familles : ${families.size}`,
);

console.log("");

const sorted =
  [
    ...families.values(),
  ].sort(
    (a, b) =>
      b.count - a.count,
  );

let index = 0;

for (
  const family
  of sorted
) {

  index++;

  console.log(
    `=== FAMILLE ${index} ===`,
  );

  console.log(
    `count=${family.count}`,
  );

  console.log(
    `TOP1=${family.top1}`,
  );

  console.log(
    `TOP2=${family.top2}`,
  );

  console.log(
    `LAST=${family.lastAction}`,
  );

  console.log(
    `RECOVERY=${family.recoveryAction}`,
  );

  console.log(
    "EXAMPLES:",
  );

  for (
    const example
    of family.examples
  ) {

    console.log(
      `  ${example}`,
    );
  }

  console.log("");
}

console.log(
  "=== FIN ===",
);
