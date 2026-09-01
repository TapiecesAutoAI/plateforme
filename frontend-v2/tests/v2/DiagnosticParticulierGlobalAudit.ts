import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Stats = {
  domain: string;
  visited: number;
  actions: number;
  completedWithConclusion: number;
  completedWithoutConclusion: number;
  manualReviews: number;
  abnormalStops: number;
  depthStops: number;
  errors: number;
  conclusions: Map<string, number>;
  manualSamples: string[];
  abnormalSamples: string[];
};

const domains = [
  "battery",
  "braking",
  "charging",
  "cooling",
  "engine",
  "starting",
  "steering",
  "suspension",
  "transmission",
];

const MAX_DEPTH = 16;
const MAX_NODES = 10000;

function createStats(
  domain: string,
): Stats {
  return {
    domain,
    visited: 0,
    actions: 0,
    completedWithConclusion: 0,
    completedWithoutConclusion: 0,
    manualReviews: 0,
    abnormalStops: 0,
    depthStops: 0,
    errors: 0,
    conclusions: new Map<string, number>(),
    manualSamples: [],
    abnormalSamples: [],
  };
}

function historyText(
  history: string[],
): string {
  return history.length > 0
    ? history.join(" -> ")
    : "(initial)";
}

function auditDomain(
  domain: string,
): Stats {

  const stats =
    createStats(domain);

  const engine =
    new DiagnosticEngineV2();

  const initial =
    engine.createSession(
      `global-particulier-${domain}`,
      "particulier",
      domain,
      [],
    );

  type Item = {
    result: any;
    depth: number;
    history: string[];
  };

  const queue: Item[] = [
    {
      result: initial,
      depth: 0,
      history: [],
    },
  ];

  while (
    queue.length > 0 &&
    stats.visited < MAX_NODES
  ) {

    const item =
      queue.shift();

    if (!item) {
      break;
    }

    stats.visited++;

    const result =
      item.result;

    const conclusionId =
      result.session
        .conclusion
        ?.diagnosisId;

    /*
     * CAS 1
     * Diagnostic terminé.
     *
     * L'absence d'action suivante est NORMALE.
     */
    if (
      result.completed ||
      result.session.status === "completed"
    ) {

      if (conclusionId) {

        stats.completedWithConclusion++;

        stats.conclusions.set(
          conclusionId,
          (
            stats.conclusions.get(
              conclusionId,
            ) ?? 0
          ) + 1,
        );
      }
      else {

        stats.completedWithoutConclusion++;

        if (
          stats.abnormalSamples.length < 20
        ) {
          stats.abnormalSamples.push(
            [
              "COMPLETED SANS CONCLUSION",
              `depth=${item.depth}`,
              historyText(item.history),
            ].join(" | "),
          );
        }
      }

      continue;
    }

    /*
     * CAS 2
     * Manual review explicite.
     *
     * Ce n'est pas une erreur technique,
     * mais c'est un parcours particulier
     * qui n'arrive pas à conclure seul.
     */
    if (
      result.session.status ===
      "manual-review-required"
    ) {

      stats.manualReviews++;

      if (
        stats.manualSamples.length < 30
      ) {

        const probabilities =
          result.reasoning
            ?.decision
            ?.probabilities ??
          [];

        const top1 =
          probabilities[0];

        const top2 =
          probabilities[1];

        stats.manualSamples.push(
          [
            `depth=${item.depth}`,
            historyText(item.history),
            `TOP1=${top1?.hypothesis?.id ?? "NONE"}:${((top1?.probability ?? 0) * 100).toFixed(1)}%`,
            `TOP2=${top2?.hypothesis?.id ?? "NONE"}:${((top2?.probability ?? 0) * 100).toFixed(1)}%`,
          ].join(" | "),
        );
      }

      continue;
    }

    /*
     * CAS 3
     * Pas terminé, pas manual review,
     * mais aucune action disponible.
     *
     * Là, c'est une vraie anomalie.
     */
    if (!result.action) {

      stats.abnormalStops++;

      if (
        stats.abnormalSamples.length < 20
      ) {

        stats.abnormalSamples.push(
          [
            "ARRET REEL SANS ACTION",
            `status=${result.session.status}`,
            `depth=${item.depth}`,
            historyText(item.history),
          ].join(" | "),
        );
      }

      continue;
    }

    stats.actions++;

    if (
      item.depth >= MAX_DEPTH
    ) {

      stats.depthStops++;

      if (
        stats.abnormalSamples.length < 20
      ) {
        stats.abnormalSamples.push(
          [
            "PROFONDEUR MAX",
            `action=${result.action.id}`,
            historyText(item.history),
          ].join(" | "),
        );
      }

      continue;
    }

    /*
     * Une action complete-diagnosis est un terminal
     * valide du workflow.
     *
     * Elle n'a normalement aucune option et ne doit
     * donc pas être classée comme arrêt anormal.
     */
    if (
      result.action.type ===
      "complete-diagnosis"
    ) {
      continue;
    }

    const options =
      result.action.options ?? [];

    if (
      !Array.isArray(options) ||
      options.length === 0
    ) {

      stats.abnormalStops++;

      if (
        stats.abnormalSamples.length < 20
      ) {
        stats.abnormalSamples.push(
          [
            "ACTION SANS OPTION",
            `action=${result.action.id}`,
            historyText(item.history),
          ].join(" | "),
        );
      }

      continue;
    }

    for (
      const option
      of options
    ) {

      try {

        const next =
          engine.answer(
            result.session,
            domain,
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

        stats.errors++;

        if (
          stats.abnormalSamples.length < 20
        ) {
          stats.abnormalSamples.push(
            [
              "ERREUR ANSWER",
              `action=${result.action.id}`,
              `option=${option.id}`,
              error instanceof Error
                ? error.message
                : String(error),
            ].join(" | "),
          );
        }
      }
    }
  }

  return stats;
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " DIAGNOSTIC V2 - AUDIT PARTICULIER CORRIGE",
);
console.log(
  "============================================================",
);

const results: Stats[] = [];

for (
  const domain
  of domains
) {

  console.log("");
  console.log(
    `AUDIT ${domain.toUpperCase()}...`,
  );

  try {

    results.push(
      auditDomain(domain),
    );
  }
  catch (error) {

    console.error(
      `ERREUR ${domain}:`,
      error,
    );
  }
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " TABLEAU GLOBAL",
);
console.log(
  "============================================================",
);

console.log(
  [
    "DOMAIN".padEnd(14),
    "VISITED".padStart(8),
    "OK".padStart(8),
    "NO-CONCL".padStart(10),
    "MANUAL".padStart(8),
    "STOP".padStart(8),
    "DEPTH".padStart(8),
    "ERROR".padStart(8),
  ].join(" "),
);

for (
  const row
  of results
) {

  console.log(
    [
      row.domain
        .toUpperCase()
        .padEnd(14),

      String(row.visited)
        .padStart(8),

      String(
        row.completedWithConclusion,
      ).padStart(8),

      String(
        row.completedWithoutConclusion,
      ).padStart(10),

      String(
        row.manualReviews,
      ).padStart(8),

      String(
        row.abnormalStops,
      ).padStart(8),

      String(
        row.depthStops,
      ).padStart(8),

      String(
        row.errors,
      ).padStart(8),
    ].join(" "),
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " CONCLUSIONS ATTEINTES",
);
console.log(
  "============================================================",
);

for (
  const row
  of results
) {

  console.log("");
  console.log(
    `--- ${row.domain.toUpperCase()} ---`,
  );

  const conclusions =
    [...row.conclusions.entries()]
      .sort(
        (a, b) =>
          b[1] - a[1],
      );

  if (
    conclusions.length === 0
  ) {

    console.log(
      "AUCUNE CONCLUSION",
    );
  }
  else {

    for (
      const [
        id,
        count,
      ]
      of conclusions
    ) {

      console.log(
        `${id}: ${count}`,
      );
    }
  }
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " MANUAL REVIEWS - ECHANTILLONS",
);
console.log(
  "============================================================",
);

for (
  const row
  of results
) {

  if (
    row.manualReviews === 0
  ) {
    continue;
  }

  console.log("");
  console.log(
    `--- ${row.domain.toUpperCase()} : ${row.manualReviews} ---`,
  );

  for (
    const sample
    of row.manualSamples
  ) {

    console.log(
      sample,
    );
  }
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " VRAIES ANOMALIES",
);
console.log(
  "============================================================",
);

for (
  const row
  of results
) {

  const total =
    row.completedWithoutConclusion +
    row.abnormalStops +
    row.depthStops +
    row.errors;

  if (total === 0) {
    continue;
  }

  console.log("");
  console.log(
    `--- ${row.domain.toUpperCase()} : ${total} ---`,
  );

  for (
    const sample
    of row.abnormalSamples
  ) {

    console.log(
      sample,
    );
  }
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " PRIORITES",
);
console.log(
  "============================================================",
);

const priority =
  [...results]
    .sort(
      (a, b) => {

        const scoreA =
          a.completedWithoutConclusion * 1000 +
          a.abnormalStops * 1000 +
          a.errors * 1000 +
          a.depthStops * 100 +
          a.manualReviews;

        const scoreB =
          b.completedWithoutConclusion * 1000 +
          b.abnormalStops * 1000 +
          b.errors * 1000 +
          b.depthStops * 100 +
          b.manualReviews;

        return scoreB - scoreA;
      },
    );

for (
  const row
  of priority
) {

  console.log(
    [
      row.domain.toUpperCase(),
      `manual=${row.manualReviews}`,
      `stop=${row.abnormalStops}`,
      `noConclusion=${row.completedWithoutConclusion}`,
      `depth=${row.depthStops}`,
      `errors=${row.errors}`,
      `completed=${row.completedWithConclusion}`,
    ].join(" | "),
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " FIN AUDIT CORRIGE",
);
console.log(
  "============================================================",
);