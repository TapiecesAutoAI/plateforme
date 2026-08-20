import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

type DomainConfig = {
  domain: string;
  profile: string;
  maxPaths: number;
  maxDepth: number;
};

type RecoveryFamily = {
  count: number;
  top1: string;
  top2: string;
  recovery: string;
  examples: string[];
};

const configs: Record<
  string,
  DomainConfig
> = {
  braking: {
    domain: "braking",
    profile: "mecanicien-garage",
    maxPaths: 3000,
    maxDepth: 25,
  },

  battery: {
    domain: "battery",
    profile: "mecanicien-garage",
    maxPaths: 3000,
    maxDepth: 30,
  },

  charging: {
    domain: "charging",
    profile: "depanneur",
    maxPaths: 2000,
    maxDepth: 30,
  },

  starting: {
    domain: "starting",
    profile: "mecanicien-garage",
    maxPaths: 2000,
    maxDepth: 30,
  },
};

const requestedDomain =
  (
    process.argv[2] ??
    "braking"
  ).toLowerCase();

const config =
  configs[requestedDomain];

if (!config) {
  console.error(
    `Domaine inconnu: ${requestedDomain}`,
  );

  process.exit(1);
}

const queue: Choice[][] = [
  [],
];

const families =
  new Map<string, RecoveryFamily>();

const recoveryCounts =
  new Map<string, number>();

const top1Counts =
  new Map<string, number>();

let explored = 0;
let terminals = 0;
let manualReviews = 0;
let recoverable = 0;
let nonRecoverable = 0;
let anomalies = 0;

function pathText(
  path: Choice[],
): string {
  return path
    .map(
      item =>
        `${item.actionId}=${item.optionId}`,
    )
    .join(" -> ");
}

function registerRecovery(
  path: Choice[],
  result: any,
  recoveryAction: string,
): void {

  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ??
    [];

  const top1 =
    probabilities[0]
      ?.hypothesis
      ?.id ??
    "NONE";

  const top2 =
    probabilities[1]
      ?.hypothesis
      ?.id ??
    "NONE";

  top1Counts.set(
    top1,
    (
      top1Counts.get(top1) ??
      0
    ) + 1,
  );

  recoveryCounts.set(
    recoveryAction,
    (
      recoveryCounts.get(
        recoveryAction,
      ) ??
      0
    ) + 1,
  );

  const key =
    [
      top1,
      top2,
      recoveryAction,
    ].join("|");

  let family =
    families.get(key);

  if (!family) {

    family = {
      count: 0,
      top1,
      top2,
      recovery:
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
    2
  ) {

    family.examples.push(
      pathText(path),
    );
  }
}

const realLog =
  console.log;

console.log = () => {};

while (
  queue.length > 0 &&
  explored <
    config.maxPaths
) {

  const path =
    queue.shift()!;

  explored++;

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `${config.domain}-relevance-${explored}`,
      config.profile as any,
      config.domain,
      [],
    );

  let valid = true;

  const seen =
    new Set<string>();

  for (
    const choice
    of path
  ) {

    if (
      result.completed ||
      !result.action
    ) {

      valid = false;
      break;
    }

    if (
      seen.has(
        result.action.id,
      )
    ) {

      valid = false;
      break;
    }

    seen.add(
      result.action.id,
    );

    if (
      result.action.id !==
      choice.actionId
    ) {

      valid = false;
      break;
    }

    const option =
      result.action
        .options
        ?.find(
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
        config.domain,
        result.action.id,
        option.id,
      );
  }

  if (!valid) {

    anomalies++;
    continue;
  }

  if (result.completed) {

    terminals++;
    continue;
  }

  if (
    !result.action
  ) {

    if (
      result.session.status ===
        "manual-review-required"
    ) {

      manualReviews++;

      const recovery =
        engine.evaluateSession(
          result.session,
          config.domain,
        );

      const recoveryAction =
        recovery.action?.id ??
        "NONE";

      if (
        recoveryAction ===
        "NONE"
      ) {

        nonRecoverable++;

      } else {

        recoverable++;
      }

      registerRecovery(
        path,
        result,
        recoveryAction,
      );

      continue;
    }

    anomalies++;
    continue;
  }

  if (
    result.action.type ===
      "complete-diagnosis"
  ) {

    const evaluated =
      engine.evaluateSession(
        result.session,
        config.domain,
      );

    if (
      evaluated.completed
    ) {

      terminals++;
      continue;
    }

    if (
      evaluated.session.status ===
        "manual-review-required"
    ) {

      manualReviews++;

      const recovery =
        engine.evaluateSession(
          evaluated.session,
          config.domain,
        );

      const recoveryAction =
        recovery.action?.id ??
        "NONE";

      if (
        recoveryAction ===
        "NONE"
      ) {

        nonRecoverable++;

      } else {

        recoverable++;
      }

      registerRecovery(
        path,
        evaluated,
        recoveryAction,
      );

      continue;
    }
  }

  if (
    path.length >=
      config.maxDepth
  ) {

    anomalies++;
    continue;
  }

  const options =
    result.action.options ??
    [];

  if (
    options.length === 0
  ) {

    anomalies++;
    continue;
  }

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
  "========================================",
);

console.log(
  " DIAGNOSTIC RECOVERY RELEVANCE AUDIT",
);

console.log(
  "========================================",
);

console.log(
  `Domain            : ${config.domain}`,
);

console.log(
  `Profile           : ${config.profile}`,
);

console.log(
  `Parcours explores : ${explored}`,
);

console.log(
  `Terminaux         : ${terminals}`,
);

console.log(
  `Manual reviews    : ${manualReviews}`,
);

console.log(
  `Recoverables      : ${recoverable}`,
);

console.log(
  `Non recoverables  : ${nonRecoverable}`,
);

console.log(
  `Anomalies         : ${anomalies}`,
);

console.log("");
console.log(
  "=== RECOVERY ACTIONS ===",
);

for (
  const [
    id,
    count,
  ]
  of [
    ...recoveryCounts.entries(),
  ].sort(
    (a, b) =>
      b[1] - a[1],
  )
) {

  const pct =
    manualReviews > 0
      ? (
          count /
          manualReviews *
          100
        ).toFixed(1)
      : "0.0";

  console.log(
    `${id}: ${count} (${pct}%)`,
  );
}

console.log("");
console.log(
  "=== TOP1 DES MANUAL REVIEWS ===",
);

for (
  const [
    id,
    count,
  ]
  of [
    ...top1Counts.entries(),
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
  "=== RECOVERY / TOP1 FAMILIES ===",
);

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
    .slice(0, 20)
) {

  index++;

  console.log("");
  console.log(
    `#${index}`,
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
    `RECOVERY=${family.recovery}`,
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
  "=== DOMINANCE ===",
);

const firstRecovery =
  [
    ...recoveryCounts.entries(),
  ].sort(
    (a, b) =>
      b[1] - a[1],
  )[0];

if (firstRecovery) {

  const dominance =
    manualReviews > 0
      ? (
          firstRecovery[1] /
          manualReviews *
          100
        )
      : 0;

  console.log(
    `Recovery dominante : ${firstRecovery[0]}`,
  );

  console.log(
    `Occurrences         : ${firstRecovery[1]}`,
  );

  console.log(
    `Dominance           : ${dominance.toFixed(1)}%`,
  );

  if (
    dominance >= 60
  ) {

    console.log(
      "ALERTE : une seule recovery domine fortement les manual reviews.",
    );
  }
}

console.log("");
console.log(
  "=== FIN ===",
);
