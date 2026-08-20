import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

type Candidate = {
  rank?: number;
  questionId?: string;
  score?: number;
  informationGain?: number;
  branchCompatible?: boolean;
};

type Observer = {
  shouldConfirm?: boolean;
  confidence?: number;
  selectedQuestionId?: string | null;
  selectedQuestionScore?: number;
  candidates?: Candidate[];
  ranking?: Candidate[];
  reason?: string;
};

type CandidateStats = {
  appearances: number;
  selected: number;
  scoreTotal: number;
  informationGainTotal: number;
  branchCompatibleCount: number;
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

const selectedCounts =
  new Map<string, number>();

const candidateStats =
  new Map<string, CandidateStats>();

const realConsoleLog =
  console.log;

let lastObserver:
  Observer | null =
  null;

console.log = (
  ...args: unknown[]
) => {

  if (
    args[0] ===
      "CONFIRMATION V2 OBSERVER" &&
    args[1] &&
    typeof args[1] ===
      "object"
  ) {

    lastObserver =
      args[1] as Observer;
  }
};

function resetObserver(): void {

  lastObserver =
    null;
}

function addCandidate(
  candidate: Candidate,
  selectedQuestionId:
    string | null,
): void {

  const id =
    candidate.questionId ??
    "UNKNOWN";

  let stats =
    candidateStats.get(id);

  if (!stats) {

    stats = {
      appearances: 0,
      selected: 0,
      scoreTotal: 0,
      informationGainTotal: 0,
      branchCompatibleCount: 0,
    };

    candidateStats.set(
      id,
      stats,
    );
  }

  stats.appearances++;

  stats.scoreTotal +=
    candidate.score ?? 0;

  stats.informationGainTotal +=
    candidate.informationGain ?? 0;

  if (
    candidate.branchCompatible
  ) {

    stats.branchCompatibleCount++;
  }

  if (
    id ===
    selectedQuestionId
  ) {

    stats.selected++;
  }
}

while (
  queue.length > 0 &&
  explored < MAX_PATHS
) {

  const path =
    queue.shift()!;

  explored++;

  const engine =
    new DiagnosticEngineV2();

  resetObserver();

  let result =
    engine.createSession(
      `braking-score-${explored}`,
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

    resetObserver();

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

    resetObserver();

    const recovered =
      engine.evaluateSession(
        result.session,
        "braking",
      );

    const observer =
      lastObserver;

    if (
      recovered.session.status ===
        "waiting-for-user" &&
      recovered.action
    ) {

      recoverable++;

      const selectedId =
        recovered.action.id;

      selectedCounts.set(
        selectedId,
        (
          selectedCounts.get(
            selectedId,
          ) ?? 0
        ) + 1,
      );

      const ranking =
        observer?.ranking ??
        observer?.candidates ??
        [];

      for (
        const candidate
        of ranking
      ) {

        addCandidate(
          candidate,
          selectedId,
        );
      }

    } else {

      nonRecoverable++;
    }

    continue;
  }

  if (
    result.action?.type ===
      "complete-diagnosis"
  ) {

    resetObserver();

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

      resetObserver();

      const recovered =
        engine.evaluateSession(
          evaluated.session,
          "braking",
        );

      const observer =
        lastObserver;

      if (
        recovered.session.status ===
          "waiting-for-user" &&
        recovered.action
      ) {

        recoverable++;

        const selectedId =
          recovered.action.id;

        selectedCounts.set(
          selectedId,
          (
            selectedCounts.get(
              selectedId,
            ) ?? 0
          ) + 1,
        );

        const ranking =
          observer?.ranking ??
          observer?.candidates ??
          [];

        for (
          const candidate
          of ranking
        ) {

          addCandidate(
            candidate,
            selectedId,
          );
        }

      } else {

        nonRecoverable++;
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
  realConsoleLog;

console.log("");
console.log(
  "=== BRAKING CONFIRMATION SCORE AUDIT ===",
);

console.log(
  `Parcours explores : ${explored}`,
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

console.log("");
console.log(
  "=== QUESTIONS SELECTIONNEES ===",
);

for (
  const [
    id,
    count,
  ]
  of [
    ...selectedCounts.entries(),
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
  "=== SCORES MOYENS DES CANDIDATS ===",
);

const rows =
  [
    ...candidateStats.entries(),
  ]
    .map(
      ([id, stats]) => ({
        id,

        appearances:
          stats.appearances,

        selected:
          stats.selected,

        avgScore:
          stats.appearances > 0
            ? stats.scoreTotal /
              stats.appearances
            : 0,

        avgInformationGain:
          stats.appearances > 0
            ? stats.informationGainTotal /
              stats.appearances
            : 0,

        branchCompatibleRate:
          stats.appearances > 0
            ? stats.branchCompatibleCount /
              stats.appearances
            : 0,
      }),
    )
    .sort(
      (a, b) =>
        b.selected -
          a.selected ||
        b.avgScore -
          a.avgScore,
    );

for (
  const row
  of rows
) {

  console.log("");

  console.log(
    row.id,
  );

  console.log(
    `  appearances=${row.appearances}`,
  );

  console.log(
    `  selected=${row.selected}`,
  );

  console.log(
    `  avgScore=${row.avgScore.toFixed(4)}`,
  );

  console.log(
    `  avgInformationGain=${row.avgInformationGain.toFixed(6)}`,
  );

  console.log(
    `  branchCompatible=${(row.branchCompatibleRate * 100).toFixed(1)}%`,
  );
}

console.log("");
console.log(
  "=== FOCUS WARNING TYPE ===",
);

const warning =
  rows.find(
    row =>
      row.id ===
      "braking-warning-type",
  );

if (warning) {

  console.log(
    `selected=${warning.selected}`,
  );

  console.log(
    `appearances=${warning.appearances}`,
  );

  console.log(
    `avgScore=${warning.avgScore.toFixed(4)}`,
  );

  console.log(
    `avgInformationGain=${warning.avgInformationGain.toFixed(6)}`,
  );

  console.log(
    `branchCompatible=${(warning.branchCompatibleRate * 100).toFixed(1)}%`,
  );
}
else {

  console.log(
    "braking-warning-type absent",
  );
}

console.log("");
console.log(
  "=== FIN AUDIT ===",
);
