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
  maxSamples: number;
};

type ObserverCandidate = {
  rank?: number;
  questionId?: string;
  score?: number;
  informationGain?: number;
  branchCompatible?: boolean;
};

type ObserverData = {
  shouldConfirm?: boolean;
  confidence?: number;
  selectedQuestionId?: string | null;
  selectedQuestionScore?: number;
  ranking?: ObserverCandidate[];
};

const configs: Record<string, DomainConfig> = {
  braking: {
    domain: "braking",
    profile: "mecanicien-garage",
    maxPaths: 3000,
    maxDepth: 25,
    maxSamples: 12,
  },

  battery: {
    domain: "battery",
    profile: "mecanicien-garage",
    maxPaths: 3000,
    maxDepth: 30,
    maxSamples: 12,
  },

  charging: {
    domain: "charging",
    profile: "depanneur",
    maxPaths: 2000,
    maxDepth: 30,
    maxSamples: 12,
  },

  starting: {
    domain: "starting",
    profile: "mecanicien-garage",
    maxPaths: 2000,
    maxDepth: 30,
    maxSamples: 12,
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

let explored = 0;
let manualReviews = 0;
let samples = 0;

let observer:
  ObserverData | null =
  null;

const realLog =
  console.log;

function silentLog(
  ...args: unknown[]
): void {

  if (
    args[0] ===
      "CONFIRMATION V2 OBSERVER" &&
    args[1] &&
    typeof args[1] ===
      "object"
  ) {

    observer =
      args[1] as ObserverData;
  }
}

console.log =
  silentLog;

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

function probabilityText(
  result: any,
): string {

  const probs =
    result.reasoning
      ?.decision
      ?.probabilities ??
    [];

  return probs
    .slice(0, 5)
    .map(
      (item: any) =>
        `${
          item.hypothesis?.id ??
          "NONE"
        }=${(
          (
            item.probability ??
            0
          ) * 100
        ).toFixed(2)}%`,
    )
    .join(" | ");
}

function printSample(
  path: Choice[],
  original: any,
  recovery: any,
  capturedObserver:
    ObserverData | null,
): void {

  samples++;

  const probs =
    original.reasoning
      ?.decision
      ?.probabilities ??
    [];

  const top1 =
    probs[0]?.hypothesis?.id ??
    "NONE";

  const top2 =
    probs[1]?.hypothesis?.id ??
    "NONE";

  realLog("");
  realLog(
    "============================================================",
  );

  realLog(
    `SAMPLE ${samples}`,
  );

  realLog(
    "============================================================",
  );

  realLog(
    `PATH=${pathText(path)}`,
  );

  realLog(
    `TOP1=${top1}`,
  );

  realLog(
    `TOP2=${top2}`,
  );

  realLog(
    `RANKING=${probabilityText(original)}`,
  );

  realLog(
    `RECOVERY ACTION=${recovery.action?.id ?? "NONE"}`,
  );

  realLog(
    `RECOVERY STATUS=${recovery.session.status}`,
  );

  realLog("");

  realLog(
    "--- CONFIRMATION V2 ---",
  );

  realLog(
    `shouldConfirm=${capturedObserver?.shouldConfirm ?? false}`,
  );

  realLog(
    `confidence=${capturedObserver?.confidence ?? 0}`,
  );

  realLog(
    `selectedQuestion=${capturedObserver?.selectedQuestionId ?? "NONE"}`,
  );

  realLog(
    `selectedScore=${capturedObserver?.selectedQuestionScore ?? 0}`,
  );

  realLog("");

  realLog(
    "--- CANDIDATS ---",
  );

  const ranking =
    capturedObserver?.ranking ??
    [];

  if (
    ranking.length === 0
  ) {

    realLog(
      "(aucun candidat Confirmation V2)",
    );

    realLog(
      "ATTENTION: la recovery provient probablement du DecisionEngine / QuestionSelector normal.",
    );

    return;
  }

  for (
    const candidate
    of ranking.slice(0, 10)
  ) {

    realLog(
      [
        `#${candidate.rank ?? "?"}`,
        candidate.questionId ?? "UNKNOWN",
        `score=${candidate.score ?? 0}`,
        `IG=${candidate.informationGain ?? 0}`,
        `branch=${candidate.branchCompatible ?? false}`,
      ].join(" | "),
    );
  }
}

while (
  queue.length > 0 &&
  explored <
    config.maxPaths &&
  samples <
    config.maxSamples
) {

  const path =
    queue.shift()!;

  explored++;

  const engine =
    new DiagnosticEngineV2();

  observer =
    null;

  let result =
    engine.createSession(
      `${config.domain}-score-${explored}`,
      config.profile as any,
      config.domain,
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

    observer =
      null;

    result =
      engine.answer(
        result.session,
        config.domain,
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

    observer =
      null;

    const recovery =
      engine.evaluateSession(
        result.session,
        config.domain,
      );

    const captured =
      observer;

    printSample(
      path,
      result,
      recovery,
      captured,
    );

    continue;
  }

  if (
    result.action?.type ===
      "complete-diagnosis"
  ) {

    observer =
      null;

    const evaluated =
      engine.evaluateSession(
        result.session,
        config.domain,
      );

    if (
      !evaluated.completed &&
      evaluated.session.status ===
        "manual-review-required"
    ) {

      manualReviews++;

      observer =
        null;

      const recovery =
        engine.evaluateSession(
          evaluated.session,
          config.domain,
        );

      const captured =
        observer;

      printSample(
        path,
        evaluated,
        recovery,
        captured,
      );

      continue;
    }
  }

  if (
    !result.action ||
    path.length >=
      config.maxDepth
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
  "============================================================",
);

console.log(
  " DIAGNOSTIC RECOVERY SCORE AUDIT",
);

console.log(
  "============================================================",
);

console.log(
  `Domain         : ${config.domain}`,
);

console.log(
  `Explored       : ${explored}`,
);

console.log(
  `Manual reviews : ${manualReviews}`,
);

console.log(
  `Samples        : ${samples}`,
);

console.log(
  "============================================================",
);
