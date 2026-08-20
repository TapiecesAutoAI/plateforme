import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type QueueItem = {
  result: any;
  depth: number;
  history: string[];
};

type ManualCase = {
  depth: number;
  family: string;
  actionId: string;
  lastAction: string;
  lastAnswer: string;
  top1Id: string;
  top1Probability: number;
  top2Id: string;
  top2Probability: number;
  delta: number;
  nextBest: string;
  evidence: string[];
  path: string[];
};

type ManualGroup = {
  key: string;
  count: number;
  family: string;
  lastAction: string;
  lastAnswer: string;
  top1Id: string;
  top2Id: string;
  nextBest: string;
  minDelta: number;
  maxDelta: number;
  avgDelta: number;
  examplePath: string;
};

const engine =
  new DiagnosticEngineV2();

const initial =
  engine.createSession(
    "transmission-particulier-manual-review-audit",
    "particulier",
    "transmission",
    [],
  );

const initialSnapshot = {
  actionId:
    initial.action?.id ??
    "NONE",

  status:
    initial.session.status,

  top1Id:
    initial.reasoning
      ?.decision
      ?.probabilities?.[0]
      ?.hypothesis
      ?.id ??
    "NONE",
};

const queue: QueueItem[] = [
  {
    result: initial,
    depth: 0,
    history: [],
  },
];

const manualCases: ManualCase[] = [];
const terminalRows: string[] = [];
const abnormalRows: string[] = [];

let explored = 0;

function evidenceIds(
  session: any,
): string[] {

  const raw =
    session?.evidence;

  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw
      .map((entry: any) => {
        if (
          typeof entry === "string"
        ) {
          return entry;
        }

        return (
          entry?.id ??
          entry?.evidenceId ??
          entry?.key ??
          JSON.stringify(entry)
        );
      })
      .filter(Boolean);
  }

  if (
    raw instanceof Set
  ) {
    return Array
      .from(raw)
      .map(String);
  }

  if (
    typeof raw === "object"
  ) {
    return Object
      .entries(raw)
      .filter(
        ([, value]) =>
          Boolean(value),
      )
      .map(
        ([key]) => key,
      );
  }

  return [
    String(raw),
  ];
}

function transmissionFamily(
  evidence: string[],
): string {

  const joined =
    evidence
      .join("|")
      .toLowerCase();

  if (
    joined.includes("dct") ||
    joined.includes("dual-clutch") ||
    joined.includes("dual_clutch") ||
    joined.includes("double-clutch") ||
    joined.includes("double_clutch")
  ) {
    return "DCT";
  }

  if (
    joined.includes("cvt")
  ) {
    return "CVT";
  }

  if (
    joined.includes("manual") ||
    joined.includes("manuel") ||
    joined.includes("clutch")
  ) {
    return "MANUAL";
  }

  if (
    joined.includes("automatic") ||
    joined.includes("automatique") ||
    joined.includes("torque-converter") ||
    joined.includes("torque_converter")
  ) {
    return "AUTOMATIC";
  }

  return "UNKNOWN";
}

function parseLastStep(
  history: string[],
): {
  action: string;
  answer: string;
} {

  const last =
    history[
      history.length - 1
    ];

  if (!last) {
    return {
      action: "NONE",
      answer: "NONE",
    };
  }

  const separator =
    last.indexOf("=");

  if (
    separator < 0
  ) {
    return {
      action: last,
      answer: "NONE",
    };
  }

  return {
    action:
      last.slice(
        0,
        separator,
      ),

    answer:
      last.slice(
        separator + 1,
      ),
  };
}

while (
  queue.length > 0 &&
  explored < 10000
) {

  const item =
    queue.shift();

  if (!item) {
    break;
  }

  explored++;

  const result =
    item.result;

  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ??
    [];

  const top1 =
    probabilities[0];

  const top2 =
    probabilities[1];

  if (
    result.completed
  ) {

    terminalRows.push(
      [
        `DEPTH=${item.depth}`,
        `CONCLUSION=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
        `TOP1=${top1?.hypothesis?.id ?? "NONE"}:${((top1?.probability ?? 0) * 100).toFixed(2)}%`,
        `TOP2=${top2?.hypothesis?.id ?? "NONE"}:${((top2?.probability ?? 0) * 100).toFixed(2)}%`,
        `PATH=${item.history.join(" -> ")}`,
      ].join(" | "),
    );

    continue;
  }

  if (
    result.session.status ===
      "manual-review-required"
  ) {

    const evidence =
      evidenceIds(
        result.session,
      );

    const last =
      parseLastStep(
        item.history,
      );

    const p1 =
      top1?.probability ?? 0;

    const p2 =
      top2?.probability ?? 0;

    manualCases.push({
      depth:
        item.depth,

      family:
        transmissionFamily(
          evidence,
        ),

      actionId:
        result.action?.id ??
        "NONE",

      lastAction:
        last.action,

      lastAnswer:
        last.answer,

      top1Id:
        top1?.hypothesis?.id ??
        "NONE",

      top1Probability:
        p1,

      top2Id:
        top2?.hypothesis?.id ??
        "NONE",

      top2Probability:
        p2,

      delta:
        p1 - p2,

      nextBest:
        result.completionAdvice
          ?.nextBestQuestionId ??
        "NONE",

      evidence,

      path:
        item.history,
    });

    continue;
  }

  if (
    !result.action
  ) {

    abnormalRows.push(
      [
        `DEPTH=${item.depth}`,
        `STATUS=${result.session.status}`,
        `TOP1=${top1?.hypothesis?.id ?? "NONE"}`,
        `PATH=${item.history.join(" -> ")}`,
      ].join(" | "),
    );

    continue;
  }

  const options =
    result.action.options ?? [];

  if (
    !Array.isArray(options) ||
    options.length === 0
  ) {

    abnormalRows.push(
      [
        "ACTION SANS OPTIONS",
        `ACTION=${result.action.id}`,
        `PATH=${item.history.join(" -> ")}`,
      ].join(" | "),
    );

    continue;
  }

  for (
    const option
    of options
  ) {

    try {

      const isolatedSession =
        structuredClone(
          result.session,
        );

      const next =
        engine.answer(
          isolatedSession,
          "transmission",
          result.action.id,
          option.id,
        );

      queue.push({
        result: next,

        depth:
          item.depth + 1,

        history: [
          ...item.history,
          `${result.action.id}=${option.id}`,
        ],
      });
    }
    catch (error) {

      abnormalRows.push(
        [
          "ERREUR ANSWER",
          `ACTION=${result.action.id}`,
          `OPTION=${option.id}`,
          error instanceof Error
            ? error.message
            : String(error),
        ].join(" | "),
      );
    }
  }
}

const groupMap =
  new Map<
    string,
    ManualCase[]
  >();

for (
  const manualCase
  of manualCases
) {

  const key =
    [
      manualCase.family,
      manualCase.lastAction,
      manualCase.lastAnswer,
      manualCase.top1Id,
      manualCase.top2Id,
      manualCase.nextBest,
    ].join(" | ");

  const existing =
    groupMap.get(key) ??
    [];

  existing.push(
    manualCase,
  );

  groupMap.set(
    key,
    existing,
  );
}

const groups: ManualGroup[] =
  Array.from(
    groupMap.entries(),
  )
    .map(
      ([key, cases]) => {

        const deltas =
          cases.map(
            (entry) =>
              entry.delta,
          );

        const sum =
          deltas.reduce(
            (
              total,
              value,
            ) =>
              total + value,
            0,
          );

        return {
          key,

          count:
            cases.length,

          family:
            cases[0].family,

          lastAction:
            cases[0].lastAction,

          lastAnswer:
            cases[0].lastAnswer,

          top1Id:
            cases[0].top1Id,

          top2Id:
            cases[0].top2Id,

          nextBest:
            cases[0].nextBest,

          minDelta:
            Math.min(
              ...deltas,
            ),

          maxDelta:
            Math.max(
              ...deltas,
            ),

          avgDelta:
            sum /
            cases.length,

          examplePath:
            cases[0]
              .path
              .join(" -> "),
        };
      },
    )
    .sort(
      (a, b) =>
        b.count -
        a.count,
    );

const familyCounts =
  new Map<
    string,
    number
  >();

const topPairCounts =
  new Map<
    string,
    number
  >();

const lastActionCounts =
  new Map<
    string,
    number
  >();

const nextBestCounts =
  new Map<
    string,
    number
  >();

for (
  const manualCase
  of manualCases
) {

  familyCounts.set(
    manualCase.family,
    (
      familyCounts.get(
        manualCase.family,
      ) ?? 0
    ) + 1,
  );

  const pair =
    `${manualCase.top1Id} <> ${manualCase.top2Id}`;

  topPairCounts.set(
    pair,
    (
      topPairCounts.get(
        pair,
      ) ?? 0
    ) + 1,
  );

  lastActionCounts.set(
    manualCase.lastAction,
    (
      lastActionCounts.get(
        manualCase.lastAction,
      ) ?? 0
    ) + 1,
  );

  nextBestCounts.set(
    manualCase.nextBest,
    (
      nextBestCounts.get(
        manualCase.nextBest,
      ) ?? 0
    ) + 1,
  );
}

function printCounter(
  title: string,
  counter: Map<
    string,
    number
  >,
) {

  console.log("");
  console.log(
    "============================================================",
  );
  console.log(
    ` ${title}`,
  );
  console.log(
    "============================================================",
  );

  const rows =
    Array.from(
      counter.entries(),
    )
      .sort(
        (a, b) =>
          b[1] - a[1],
      );

  for (
    const [
      key,
      count,
    ]
    of rows
  ) {
    console.log(
      `${count.toString().padStart(4)} | ${key}`,
    );
  }
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " CHAT10 - TRANSMISSION MANUAL REVIEW CLASSIFIER",
);
console.log(
  "============================================================",
);

console.log(
  `EXPLORES=${explored}`,
);

console.log(
  `MANUAL_REVIEWS=${manualCases.length}`,
);

console.log(
  `TERMINAUX=${terminalRows.length}`,
);

console.log(
  `ANOMALIES=${abnormalRows.length}`,
);

console.log(
  `GROUPES_MANUAL=${groups.length}`,
);

console.log(
  `INITIAL_ACTION=${initialSnapshot.actionId}`,
);

console.log(
  `INITIAL_STATUS=${initialSnapshot.status}`,
);

console.log(
  `INITIAL_TOP1=${initialSnapshot.top1Id}`,
);

printCounter(
  "MANUAL REVIEWS PAR FAMILLE",
  familyCounts,
);

printCounter(
  "MANUAL REVIEWS PAR DERNIERE ACTION",
  lastActionCounts,
);

printCounter(
  "MANUAL REVIEWS PAR COUPLE TOP1 / TOP2",
  topPairCounts,
);

printCounter(
  "MANUAL REVIEWS PAR NEXTBEST",
  nextBestCounts,
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " GROUPES DE MANUAL REVIEW",
);
console.log(
  "============================================================",
);

groups.forEach(
  (
    group,
    index,
  ) => {

    console.log("");
    console.log(
      `GROUP=${index + 1}`,
    );

    console.log(
      `COUNT=${group.count}`,
    );

    console.log(
      `FAMILY=${group.family}`,
    );

    console.log(
      `LAST_ACTION=${group.lastAction}`,
    );

    console.log(
      `LAST_ANSWER=${group.lastAnswer}`,
    );

    console.log(
      `TOP1=${group.top1Id}`,
    );

    console.log(
      `TOP2=${group.top2Id}`,
    );

    console.log(
      `NEXTBEST=${group.nextBest}`,
    );

    console.log(
      `DELTA_MIN=${(group.minDelta * 100).toFixed(2)}%`,
    );

    console.log(
      `DELTA_AVG=${(group.avgDelta * 100).toFixed(2)}%`,
    );

    console.log(
      `DELTA_MAX=${(group.maxDelta * 100).toFixed(2)}%`,
    );

    console.log(
      `EXAMPLE=${group.examplePath}`,
    );
  },
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " 20 MANUAL REVIEWS LES PLUS AMBIGUS",
);
console.log(
  "============================================================",
);

manualCases
  .slice()
  .sort(
    (a, b) =>
      a.delta -
      b.delta,
  )
  .slice(
    0,
    20,
  )
  .forEach(
    (
      manualCase,
      index,
    ) => {

      console.log(
        [
          `#${index + 1}`,
          `FAMILY=${manualCase.family}`,
          `DEPTH=${manualCase.depth}`,
          `LAST=${manualCase.lastAction}=${manualCase.lastAnswer}`,
          `TOP1=${manualCase.top1Id}:${(manualCase.top1Probability * 100).toFixed(2)}%`,
          `TOP2=${manualCase.top2Id}:${(manualCase.top2Probability * 100).toFixed(2)}%`,
          `DELTA=${(manualCase.delta * 100).toFixed(2)}%`,
          `NEXTBEST=${manualCase.nextBest}`,
          `EVIDENCE=${manualCase.evidence.join(",")}`,
          `PATH=${manualCase.path.join(" -> ")}`,
        ].join(" | "),
      );
    },
  );

console.log("");
console.log(
  "============================================================",
);
console.log(
  " ANOMALIES",
);
console.log(
  "============================================================",
);

if (
  abnormalRows.length === 0
) {
  console.log(
    "AUCUNE",
  );
}
else {
  abnormalRows.forEach(
    (row) =>
      console.log(row),
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " FIN CHAT10 CLASSIFIER",
);
console.log(
  "============================================================",
);
