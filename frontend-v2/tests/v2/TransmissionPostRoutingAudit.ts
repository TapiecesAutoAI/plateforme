import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type QueueItem = {
  result: any;
  depth: number;
  history: string[];
};

const engine =
  new DiagnosticEngineV2();

const initial =
  engine.createSession(
    "transmission-post-routing-audit",
    "particulier",
    "transmission",
    [],
  );

const queue: QueueItem[] = [
  {
    result: initial,
    depth: 0,
    history: [],
  },
];

let explored = 0;
let terminals = 0;
let manualReviews = 0;
let anomalies = 0;

let manual = 0;
let automatic = 0;
let dct = 0;
let cvt = 0;
let unknown = 0;

let nextBestNone = 0;
let zeroDelta = 0;

const crossFamilyRows: string[] = [];
const inputBearingRows: string[] = [];
const manualReviewRows: string[] = [];

function transmissionType(
  result: any,
):
  | "manual"
  | "automatic"
  | "dct"
  | "cvt"
  | "unknown" {

  const ids =
    new Set(
      (result.session.evidence ?? [])
        .map(
          (e: any) => e.id,
        ),
    );

  if (
    ids.has(
      "observation-transmission-manual",
    )
  ) {
    return "manual";
  }

  if (
    ids.has(
      "observation-transmission-automatic",
    )
  ) {
    return "automatic";
  }

  if (
    ids.has(
      "observation-transmission-dct",
    )
  ) {
    return "dct";
  }

  if (
    ids.has(
      "observation-transmission-cvt",
    )
  ) {
    return "cvt";
  }

  return "unknown";
}

function actionFamily(
  id: string,
):
  | "manual"
  | "automatic"
  | "dct"
  | "cvt"
  | null {

  const value =
    id.toLowerCase();

  if (
    value.startsWith(
      "transmission-manual-",
    ) ||
    value.startsWith(
      "transmission-clutch-",
    ) ||
    value.startsWith(
      "transmission-particulier-clutch-",
    ) ||
    value ===
      "transmission-particulier-shift-linkage" ||
    value ===
      "transmission-particulier-differential" ||
    value ===
      "transmission-input-bearing-check"
  ) {
    return "manual";
  }

  if (
    value.startsWith(
      "transmission-automatic-",
    ) ||
    value ===
      "transmission-particulier-automatic"
  ) {
    return "automatic";
  }

  if (
    value.startsWith(
      "transmission-dct-",
    ) ||
    value ===
      "transmission-particulier-dct"
  ) {
    return "dct";
  }

  if (
    value.startsWith(
      "transmission-cvt-",
    ) ||
    value ===
      "transmission-particulier-cvt"
  ) {
    return "cvt";
  }

  return null;
}

while (
  queue.length > 0 &&
  explored < 20000
) {

  const item =
    queue.shift();

  if (!item) {
    break;
  }

  explored++;

  const result =
    item.result;

  const type =
    transmissionType(
      result,
    );

  switch (type) {

    case "manual":
      manual++;
      break;

    case "automatic":
      automatic++;
      break;

    case "dct":
      dct++;
      break;

    case "cvt":
      cvt++;
      break;

    default:
      unknown++;
  }

  const actionId =
    result.action?.id ??
    "NONE";

  const family =
    actionFamily(
      actionId,
    );

  if (
    type !== "unknown" &&
    family &&
    family !== type
  ) {

    crossFamilyRows.push(
      [
        `TYPE=${type}`,
        `ACTION=${actionId}`,
        `FAMILY=${family}`,
        `PATH=${item.history.join(" -> ")}`,
      ].join(" | "),
    );
  }

  if (
    type !== "manual" &&
    (
      actionId ===
        "transmission-input-bearing-check" ||
      item.history.some(
        row =>
          row.startsWith(
            "transmission-input-bearing-check=",
          ),
      )
    )
  ) {

    inputBearingRows.push(
      [
        `TYPE=${type}`,
        `ACTION=${actionId}`,
        `PATH=${item.history.join(" -> ")}`,
      ].join(" | "),
    );
  }

  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ?? [];

  const p1 =
    probabilities[0]
      ?.probability ?? 0;

  const p2 =
    probabilities[1]
      ?.probability ?? 0;

  if (
    result.completed
  ) {

    terminals++;
    continue;
  }

  if (
    result.session.status ===
      "manual-review-required"
  ) {

    manualReviews++;

    const nextBest =
      result.completionAdvice
        ?.nextBestQuestionId ??
      "NONE";

    if (
      nextBest === "NONE"
    ) {
      nextBestNone++;
    }

    if (
      Math.abs(
        p1 - p2,
      ) < 0.000001
    ) {
      zeroDelta++;
    }

    if (
      manualReviewRows.length < 30
    ) {

      manualReviewRows.push(
        [
          `TYPE=${type}`,
          `TOP1=${probabilities[0]?.hypothesis?.id ?? "NONE"}:${(p1 * 100).toFixed(2)}%`,
          `TOP2=${probabilities[1]?.hypothesis?.id ?? "NONE"}:${(p2 * 100).toFixed(2)}%`,
          `NEXTBEST=${nextBest}`,
          `PATH=${item.history.join(" -> ")}`,
        ].join(" | "),
      );
    }

    continue;
  }

  if (
    !result.action
  ) {

    anomalies++;
    continue;
  }

  const options =
    result.action.options ?? [];

  if (
    !Array.isArray(options) ||
    options.length === 0
  ) {

    anomalies++;
    continue;
  }

  for (
    const option
    of options
  ) {

    try {

      const next =
        engine.answer(
          structuredClone(
            result.session,
          ),
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

    } catch {

      anomalies++;
    }
  }
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " CHAT10 - RESULTAT POST ROUTING",
);
console.log(
  "============================================================",
);

console.log(`EXPLORED=${explored}`);
console.log(`TERMINALS=${terminals}`);
console.log(`MANUAL_REVIEWS=${manualReviews}`);
console.log(`ANOMALIES=${anomalies}`);

console.log("");
console.log(`TYPE_MANUAL=${manual}`);
console.log(`TYPE_AUTOMATIC=${automatic}`);
console.log(`TYPE_DCT=${dct}`);
console.log(`TYPE_CVT=${cvt}`);
console.log(`TYPE_UNKNOWN=${unknown}`);

console.log("");
console.log(`NEXTBEST_NONE=${nextBestNone}`);
console.log(`ZERO_DELTA=${zeroDelta}`);

console.log("");
console.log(
  `CROSS_FAMILY=${crossFamilyRows.length}`,
);

console.log(
  `NON_MANUAL_INPUT_BEARING=${inputBearingRows.length}`,
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " CROSS FAMILY"
);
console.log(
  "============================================================",
);

if (
  crossFamilyRows.length === 0
) {
  console.log("AUCUN");
} else {
  crossFamilyRows
    .slice(0, 30)
    .forEach(
      row =>
        console.log(row),
    );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " INPUT BEARING HORS MANUAL"
);
console.log(
  "============================================================",
);

if (
  inputBearingRows.length === 0
) {
  console.log("AUCUN");
} else {
  inputBearingRows
    .slice(0, 30)
    .forEach(
      row =>
        console.log(row),
    );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " ECHANTILLON MANUAL REVIEWS"
);
console.log(
  "============================================================",
);

manualReviewRows.forEach(
  row =>
    console.log(row),
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " FIN CHAT10 POST ROUTING"
);
console.log(
  "============================================================",
);
