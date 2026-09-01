import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Profile =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

type Choice = {
  actionId: string;
  optionId: string;
};

const profiles: Profile[] = [
  "mecanicien-garage",
];

const MAX_PATHS_PER_PROFILE =
  5000;

const MAX_DEPTH =
  25;

const expectedHypotheses = [
  "problem-brake-fluid-leak",
  "problem-air-in-brake-system",
  "problem-master-cylinder",
  "problem-brake-servo",
  "problem-vacuum-circuit",
  "problem-worn-brake-pads",
  "problem-brake-discs",
  "problem-sticking-caliper",
  "problem-brake-hose",
  "problem-rear-brakes",
  "problem-brake-pad-mounting",
  "problem-wheel-hub-runout",
  "problem-abs-wheel-sensor",
  "problem-abs-hydraulic-unit",
  "problem-abs-power-supply",
  "problem-parking-brake-cable",
  "problem-electric-parking-brake",
  "problem-non-brake-pull",
];

function pathText(
  path: Choice[],
): string {
  if (path.length === 0) {
    return "(aucune reponse)";
  }

  return path
    .map(
      item =>
        `${item.actionId}=${item.optionId}`,
    )
    .join(" -> ");
}

const realLog =
  console.log;

console.log = () => {};

const output: string[] =
  [];

const globalConclusions =
  new Map<string, number>();

let globalAnomalies =
  0;

let globalManualReviews =
  0;

for (const profile of profiles) {

  const queue: Choice[][] = [
    [],
  ];

  let explored =
    0;

  let terminals =
    0;

  let anomalies =
    0;

  let manualReviews =
    0;

  const conclusions =
    new Map<string, number>();

  const firstAnomalies:
    string[] = [];

  while (
    queue.length > 0 &&
    explored <
      MAX_PATHS_PER_PROFILE
  ) {

    const path =
      queue.shift()!;

    explored++;

    const engine =
      new DiagnosticEngineV2();

    let result =
      engine.createSession(
        `braking-autopilot-${profile}-${explored}`,
        profile,
        "braking",
        [],
      );

    let valid =
      true;

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

        valid =
          false;

        if (
          firstAnomalies.length <
          20
        ) {
          firstAnomalies.push(
            `${pathText(path)} | parcours continue apres fin`,
          );
        }

        break;
      }

      if (
        seenActions.has(
          result.action.id,
        )
      ) {

        valid =
          false;

        if (
          firstAnomalies.length <
          20
        ) {
          firstAnomalies.push(
            `${pathText(path)} | action repetee=${result.action.id}`,
          );
        }

        break;
      }

      seenActions.add(
        result.action.id,
      );

      if (
        result.action.id !==
        choice.actionId
      ) {

        valid =
          false;

        if (
          firstAnomalies.length <
          20
        ) {
          firstAnomalies.push(
            `${pathText(path)} | attendu=${choice.actionId} obtenu=${result.action.id}`,
          );
        }

        break;
      }

      const option =
        result.action.options?.find(
          item =>
            item.id ===
            choice.optionId,
        );

      if (!option) {

        valid =
          false;

        if (
          firstAnomalies.length <
          20
        ) {
          firstAnomalies.push(
            `${pathText(path)} | option introuvable=${choice.optionId}`,
          );
        }

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
      anomalies++;
      continue;
    }

    if (
      result.completed
    ) {

      terminals++;

      const top =
        result.reasoning
          .decision
          .probabilities[0];

      const id =
        result.session
          .conclusion
          ?.diagnosisId ??
        top?.hypothesis.id ??
        "NONE";

      conclusions.set(
        id,
        (
          conclusions.get(id) ??
          0
        ) + 1,
      );

      globalConclusions.set(
        id,
        (
          globalConclusions.get(id) ??
          0
        ) + 1,
      );

      continue;
    }

    const action =
      result.action;

    if (!action) {

      if (
        result.session.status ===
        "manual-review-required"
      ) {

        manualReviews++;

        continue;
      }

      anomalies++;

      if (
        firstAnomalies.length <
        20
      ) {
        firstAnomalies.push(
          `${pathText(path)} | action NONE mais completed=false status=${result.session.status}`,
        );
      }

      continue;
    }

    if (
      action.type ===
      "complete-diagnosis"
    ) {

      /*
       * Terminal valide pour l'autopilot.
       *
       * Le moteur moderne peut volontairement
       * rester waiting-for-user ici.
       * L'audit ne doit pas forcer evaluateSession().
       */
      terminals++;

      const top =
        result.reasoning
          .decision
          .probabilities[0];

      const id =
        result.session
          .conclusion
          ?.diagnosisId ??
        top?.hypothesis.id ??
        "NONE";

      conclusions.set(
        id,
        (
          conclusions.get(id) ??
          0
        ) + 1,
      );

      globalConclusions.set(
        id,
        (
          globalConclusions.get(id) ??
          0
        ) + 1,
      );

      continue;
    }

    if (
      path.length >=
      MAX_DEPTH
    ) {

      anomalies++;

      if (
        firstAnomalies.length <
        20
      ) {
        firstAnomalies.push(
          `${pathText(path)} | profondeur>${MAX_DEPTH}`,
        );
      }

      continue;
    }

    const options =
      action.options ?? [];

    if (
      options.length ===
      0
    ) {

      anomalies++;

      if (
        firstAnomalies.length <
        20
      ) {
        firstAnomalies.push(
          `${pathText(path)} | action sans option : ${action.id}`,
        );
      }

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
            action.id,

          optionId:
            option.id,
        },
      ]);
    }
  }

  globalAnomalies +=
    anomalies;

  globalManualReviews +=
    manualReviews;

  output.push("");

  output.push(
    `=== ${profile.toUpperCase()} ===`,
  );

  output.push(
    `Parcours explores : ${explored}`,
  );

  output.push(
    `Parcours terminaux : ${terminals}`,
  );

  output.push(
    `Anomalies : ${anomalies}`,
  );

  output.push(
    `Manual reviews : ${manualReviews}`,
  );

  output.push(
    "Conclusions :",
  );

  for (
    const [id, count]
    of [
      ...conclusions.entries(),
    ].sort(
      (a, b) =>
        b[1] - a[1],
    )
  ) {

    output.push(
      `${id}: ${count}`,
    );
  }

  if (
    firstAnomalies.length >
    0
  ) {

    output.push(
      "Premieres anomalies :",
    );

    for (
      const item
      of firstAnomalies.slice(
        0,
        10,
      )
    ) {

      output.push(
        item,
      );
    }
  }

  if (
    explored >=
    MAX_PATHS_PER_PROFILE
  ) {

    output.push(
      `ATTENTION : limite de ${MAX_PATHS_PER_PROFILE} parcours atteinte.`,
    );
  }
}

console.log =
  realLog;

console.log("");

console.log(
  "=== BRAKING ENGINE AUTOPILOT ===",
);

for (
  const line
  of output
) {

  console.log(
    line,
  );
}

console.log("");

console.log(
  "=== GLOBAL BRAKING CONCLUSIONS ===",
);

for (
  const id
  of expectedHypotheses
) {

  console.log(
    `${id}: ${globalConclusions.get(id) ?? 0}`,
  );
}

console.log("");

console.log(
  "=== NEVER REACHED ===",
);

const neverReached =
  expectedHypotheses.filter(
    id =>
      !globalConclusions.has(id),
  );

if (
  neverReached.length ===
  0
) {

  console.log(
    "(aucune)",
  );
}
else {

  for (
    const id
    of neverReached
  ) {

    console.log(id);
  }
}

console.log("");

console.log(
  `TOTAL ANOMALIES : ${globalAnomalies}`,
);

console.log(
  `TOTAL MANUAL REVIEWS : ${globalManualReviews}`,
);

process.exitCode =
  globalAnomalies > 0
    ? 1
    : 0;
