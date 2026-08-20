import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

type Review = {
  path: Choice[];
  topId: string;
  topProbability: number;
  secondId: string;
  secondProbability: number;
  margin: number;
};

const MAX_PATHS = 3000;
const MAX_DEPTH = 25;

const queue: Choice[][] = [
  [],
];

const reviews: Review[] = [];

let explored = 0;

const realLog = console.log;
console.log = () => {};

function recordReview(
  path: Choice[],
  result: ReturnType<
    DiagnosticEngineV2["createSession"]
  >,
): void {

  const probabilities =
    result.reasoning
      .decision
      .probabilities;

  const top =
    probabilities[0];

  const second =
    probabilities[1];

  reviews.push({
    path,
    topId:
      top?.hypothesis.id ??
      "NONE",

    topProbability:
      top?.probability ??
      0,

    secondId:
      second?.hypothesis.id ??
      "NONE",

    secondProbability:
      second?.probability ??
      0,

    margin:
      (top?.probability ?? 0) -
      (second?.probability ?? 0),
  });
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

  let result =
    engine.createSession(
      `braking-review-summary-${explored}`,
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

  if (!result.action) {

    if (
      result.session.status ===
      "manual-review-required"
    ) {
      recordReview(
        path,
        result,
      );
    }

    continue;
  }

  if (
    result.action.type ===
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

      recordReview(
        path,
        evaluated,
      );
    }

    continue;
  }

  if (
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
  "=== BRAKING MANUAL REVIEW SUMMARY ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

console.log(
  `Manual reviews : ${reviews.length}`,
);

const bands = [
  {
    label: ">= 80%",
    min: 0.80,
    max: Infinity,
  },
  {
    label: "70-79.99%",
    min: 0.70,
    max: 0.80,
  },
  {
    label: "60-69.99%",
    min: 0.60,
    max: 0.70,
  },
  {
    label: "50-59.99%",
    min: 0.50,
    max: 0.60,
  },
  {
    label: "40-49.99%",
    min: 0.40,
    max: 0.50,
  },
  {
    label: "< 40%",
    min: 0,
    max: 0.40,
  },
];

console.log("");
console.log(
  "=== REPARTITION CONFIANCE TOP1 ===",
);

for (
  const band
  of bands
) {

  const count =
    reviews.filter(
      review =>
        review.topProbability >=
          band.min &&
        review.topProbability <
          band.max,
    ).length;

  console.log(
    `${band.label}: ${count}`,
  );
}

console.log("");
console.log(
  "=== TOP1 DES MANUAL REVIEWS ===",
);

const byHypothesis =
  new Map<string, number>();

for (
  const review
  of reviews
) {

  byHypothesis.set(
    review.topId,
    (
      byHypothesis.get(
        review.topId,
      ) ??
      0
    ) + 1,
  );
}

for (
  const [id, count]
  of [
    ...byHypothesis.entries(),
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
  "=== MARGES TOP1 - TOP2 ===",
);

const marginBands = [
  {
    label: ">= 50 points",
    min: 0.50,
    max: Infinity,
  },
  {
    label: "30-49.99 points",
    min: 0.30,
    max: 0.50,
  },
  {
    label: "20-29.99 points",
    min: 0.20,
    max: 0.30,
  },
  {
    label: "10-19.99 points",
    min: 0.10,
    max: 0.20,
  },
  {
    label: "< 10 points",
    min: -Infinity,
    max: 0.10,
  },
];

for (
  const band
  of marginBands
) {

  const count =
    reviews.filter(
      review =>
        review.margin >=
          band.min &&
        review.margin <
          band.max,
    ).length;

  console.log(
    `${band.label}: ${count}`,
  );
}

console.log("");
console.log(
  "=== CAS TOP1 >= 70% ===",
);

const strongReviews =
  reviews
    .filter(
      review =>
        review.topProbability >=
        0.70,
    )
    .sort(
      (a, b) =>
        b.topProbability -
        a.topProbability,
    );

for (
  const review
  of strongReviews
) {

  console.log("");

  console.log(
    review.path
      .map(
        item =>
          `${item.actionId}=${item.optionId}`,
      )
      .join(" -> "),
  );

  console.log(
    `TOP1=${review.topId} ${(review.topProbability * 100).toFixed(2)}%`,
  );

  console.log(
    `TOP2=${review.secondId} ${(review.secondProbability * 100).toFixed(2)}%`,
  );

  console.log(
    `MARGE=${(review.margin * 100).toFixed(2)} points`,
  );
}

console.log("");
console.log(
  "=== FIN SUMMARY ===",
);
