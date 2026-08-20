import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Family = {
  top1: string;
  top2: string;
  count: number;
  examples: string[];
};

const engine = new DiagnosticEngineV2();

const queue: Array<
  Array<{
    actionId: string;
    optionId: string;
  }>
> = [[]];

const MAX_PATHS = 5000;

let explored = 0;

const manualReviews: Array<{
  path: string;
  top1: string;
  top2: string;
  top1Confidence: number;
  top2Confidence: number;
  margin: number;
  recovery: string;
}> = [];

function replay(
  path: Array<{
    actionId: string;
    optionId: string;
  }>,
) {
  let result =
    engine.createSession(
      "braking-non-recoverable-audit",
      "mecanicien-garage" as any,
      "braking" as any,
      [],
    );

  for (const step of path) {
    const action = result.action;

    if (!action || action.id !== step.actionId) {
      return {
        result,
        valid: false,
      };
    }

    const option =
      action.options?.find(
        item =>
          item.id === step.optionId,
      );

    if (!option) {
      return {
        result,
        valid: false,
      };
    }

    result =
      engine.answer(
        result.session,
        "braking" as any,
        action.id,
        option.id,
      );
  }

  return {
    result,
    valid: true,
  };
}

function pathToString(
  path: Array<{
    actionId: string;
    optionId: string;
  }>,
) {
  return path
    .map(
      step =>
        `${step.actionId}=${step.optionId}`,
    )
    .join(" -> ");
}

const originalLog = console.log;
console.log = () => {};

while (
  queue.length > 0 &&
  explored < MAX_PATHS
) {
  const path = queue.shift()!;
  explored++;

  const replayed = replay(path);

  if (!replayed.valid) {
    continue;
  }

  const result = replayed.result;

  if (
    result.session.status ===
    "manual-review-required"
  ) {
    const probabilities =
      result.reasoning
        .decision
        .probabilities ?? [];

    const top1 =
      probabilities[0];

    const top2 =
      probabilities[1];

    const reevaluated =
      engine.evaluateSession(
        result.session,
        "braking" as any,
      );

    manualReviews.push({
      path:
        pathToString(path),

      top1:
        top1?.hypothesis?.id ??
        "NONE",

      top2:
        top2?.hypothesis?.id ??
        "NONE",

      top1Confidence:
        top1?.probability ??
        0,

      top2Confidence:
        top2?.probability ??
        0,

      margin:
        (
          top1?.probability ??
          0
        ) -
        (
          top2?.probability ??
          0
        ),

      recovery:
        reevaluated.action?.id ??
        "NONE",
    });

    continue;
  }

  if (
    result.completed ||
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

console.log = originalLog;

const nonRecoverables =
  manualReviews.filter(
    item =>
      item.recovery === "NONE",
  );

const families =
  new Map<string, Family>();

for (const item of nonRecoverables) {
  const key =
    `${item.top1}|${item.top2}`;

  const existing =
    families.get(key) ?? {
      top1: item.top1,
      top2: item.top2,
      count: 0,
      examples: [],
    };

  existing.count++;

  if (existing.examples.length < 5) {
    existing.examples.push(
      item.path,
    );
  }

  families.set(
    key,
    existing,
  );
}

const sortedFamilies =
  [...families.values()]
    .sort(
      (a, b) =>
        b.count - a.count,
    );

console.log("");
console.log(
  "========================================",
);
console.log(
  " BRAKING NON-RECOVERABLE AUDIT",
);
console.log(
  "========================================",
);

console.log(
  `Parcours explores : ${explored}`,
);

console.log(
  `Manual reviews    : ${manualReviews.length}`,
);

console.log(
  `Non recoverables  : ${nonRecoverables.length}`,
);

console.log("");

console.log(
  "=== TOP FAMILIES ===",
);

for (
  const family
  of sortedFamilies.slice(0, 20)
) {
  console.log("");
  console.log(
    `${family.top1} VS ${family.top2}`,
  );
  console.log(
    `count=${family.count}`,
  );

  for (
    const example
    of family.examples
  ) {
    console.log(
      `  ${example}`,
    );
  }
}

console.log("");

console.log(
  "=== CONFIANCE NON-RECOVERABLES ===",
);

const buckets = {
  gte70: 0,
  gte60: 0,
  gte50: 0,
  gte40: 0,
  lt40: 0,
};

for (const item of nonRecoverables) {
  const p =
    item.top1Confidence;

  if (p >= 0.70) {
    buckets.gte70++;
  }
  else if (p >= 0.60) {
    buckets.gte60++;
  }
  else if (p >= 0.50) {
    buckets.gte50++;
  }
  else if (p >= 0.40) {
    buckets.gte40++;
  }
  else {
    buckets.lt40++;
  }
}

console.log(
  `>=70% : ${buckets.gte70}`,
);
console.log(
  `60-69 : ${buckets.gte60}`,
);
console.log(
  `50-59 : ${buckets.gte50}`,
);
console.log(
  `40-49 : ${buckets.gte40}`,
);
console.log(
  `<40   : ${buckets.lt40}`,
);

console.log("");

console.log(
  "=== MARGE TOP1/TOP2 ===",
);

const marginBuckets = {
  gte30: 0,
  gte20: 0,
  gte10: 0,
  lt10: 0,
};

for (const item of nonRecoverables) {
  const m =
    item.margin;

  if (m >= 0.30) {
    marginBuckets.gte30++;
  }
  else if (m >= 0.20) {
    marginBuckets.gte20++;
  }
  else if (m >= 0.10) {
    marginBuckets.gte10++;
  }
  else {
    marginBuckets.lt10++;
  }
}

console.log(
  `>=30 pts : ${marginBuckets.gte30}`,
);
console.log(
  `20-29    : ${marginBuckets.gte20}`,
);
console.log(
  `10-19    : ${marginBuckets.gte10}`,
);
console.log(
  `<10      : ${marginBuckets.lt10}`,
);

console.log("");
console.log(
  "=== FIN ===",
);
