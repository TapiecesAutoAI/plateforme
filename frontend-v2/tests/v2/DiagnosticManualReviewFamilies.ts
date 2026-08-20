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

type DomainConfig = {
  domain: string;
  profile: string;
  maxPaths: number;
  maxDepth: number;
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
    maxPaths: 5000,
    maxDepth: 30,
  },

  charging: {
    domain: "charging",
    profile: "depanneur",
    maxPaths: 5000,
    maxDepth: 30,
  },

  starting: {
    domain: "starting",
    profile: "mecanicien-garage",
    maxPaths: 5000,
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

  console.error(
    `Disponibles: ${
      Object.keys(configs)
        .join(", ")
    }`,
  );

  process.exit(1);
}

const queue: Choice[][] = [
  [],
];

const families =
  new Map<string, Family>();

let explored = 0;
let manualReviews = 0;
let terminals = 0;
let anomalies = 0;

function pathText(
  path: Choice[],
): string {
  if (path.length === 0) {
    return "(root)";
  }

  return path
    .map(
      item =>
        `${item.actionId}=${item.optionId}`,
    )
    .join(" -> ");
}

function registerManualReview(
  path: Choice[],
  result: any,
  recoveryAction: string,
): void {

  manualReviews++;

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

  const lastAction =
    path.length > 0
      ? path[
          path.length - 1
        ].actionId
      : "NONE";

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
      `${config.domain}-family-${explored}`,
      config.profile as any,
      config.domain,
      [],
    );

  let valid = true;

  const seenActions =
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
      seenActions.has(
        result.action.id,
      )
    ) {

      valid = false;
      break;
    }

    seenActions.add(
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

      const recovery =
        engine.evaluateSession(
          result.session,
          config.domain,
        );

      registerManualReview(
        path,
        result,
        recovery.action?.id ??
          "NONE",
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

      const recovery =
        engine.evaluateSession(
          evaluated.session,
          config.domain,
        );

      registerManualReview(
        path,
        evaluated,
        recovery.action?.id ??
          "NONE",
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
  " DIAGNOSTIC MANUAL REVIEW FAMILIES",
);

console.log(
  "========================================",
);

console.log(
  `Domain          : ${config.domain}`,
);

console.log(
  `Profile         : ${config.profile}`,
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
  `Anomalies         : ${anomalies}`,
);

console.log(
  `Familles          : ${families.size}`,
);

if (
  explored >=
  config.maxPaths
) {

  console.log(
    `ATTENTION : limite ${config.maxPaths} atteinte.`,
  );
}

console.log("");

const sortedFamilies =
  [
    ...families.values(),
  ].sort(
    (a, b) =>
      b.count - a.count,
  );

let familyNumber = 0;

for (
  const family
  of sortedFamilies
) {

  familyNumber++;

  console.log(
    `=== FAMILLE ${familyNumber} ===`,
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
  "=== TOP 10 FAMILLES ===",
);

for (
  const [
    index,
    family,
  ]
  of sortedFamilies
    .slice(0, 10)
    .entries()
) {

  console.log(
    `${index + 1}. ${family.count} | ${family.top1} / ${family.top2} | LAST=${family.lastAction} | RECOVERY=${family.recoveryAction}`,
  );
}

console.log("");

console.log(
  "=== FIN ===",
);
