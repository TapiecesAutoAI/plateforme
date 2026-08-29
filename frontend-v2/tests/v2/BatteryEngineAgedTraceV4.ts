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
  3000;

const MAX_DEPTH =
  20;

const expectedHypotheses = [
  "problem-discharged-battery",
  "problem-aged-battery",
  "problem-battery-connections",
  "problem-ground-connection",
  "problem-alternator",
  "problem-voltage-regulator",
  "problem-accessory-belt",
  "problem-parasitic-drain",
  "problem-wrong-battery",
  "problem-internal-battery-failure",
];

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

const realLog =
  console.log;

console.log = () => {};

const output: string[] = [];

const globalConclusions =
  new Map<string, number>();

for (const profile of profiles) {

  const queue: Choice[][] = [
    [],
  ];

  let explored = 0;
  let terminals = 0;
  let anomalies = 0;
  let manualReviews = 0;
  const agedTrace: string[] = [];

  const isAgedPath = (
    currentPath: Choice[],
  ): boolean =>
    currentPath.some(
      (choice) =>
        choice.actionId ===
          "battery-age" &&
        choice.optionId ===
          "over-four",
    );

  const addAgedTrace = (
    kind: string,
    currentPath: Choice[],
    diagnosisId: string,
    probabilities: any[],
  ): void => {
    if (!isAgedPath(currentPath)) {
      return;
    }

    const ranking =
      probabilities
        .slice(0, 5)
        .map(
          (entry: any) =>
            `${entry.hypothesis.id}=${(
              entry.probability * 100
            ).toFixed(2)}%`,
        )
        .join(" | ");

    agedTrace.push(
      [
        `TYPE=${kind}`,
        `TOP=${diagnosisId}`,
        `QUESTIONS=${currentPath.length}`,
        `RANKING=${ranking}`,
        `PATH=${pathText(currentPath)}`,
      ].join(" || "),
    );
  };

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
        `battery-autopilot-${profile}-${explored}`,
        profile,
        "battery",
        [],
      );

    let valid =
      true;

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

        firstAnomalies.push(
          `${pathText(path)} | parcours continue après fin`,
        );

        break;
      }

      if (
        result.action.id !==
        choice.actionId
      ) {
        valid =
          false;

        firstAnomalies.push(
          `${pathText(path)} | attendu=${choice.actionId} obtenu=${result.action.id}`,
        );

        break;
      }

      result =
        engine.answer(
          result.session,
          "battery",
          choice.actionId,
          choice.optionId,
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

      addAgedTrace(
        "DIRECT-COMPLETED",
        path,
        id,
        result.reasoning
          .decision
          .probabilities,
      );
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

        const manualTop =
          result.reasoning
            .decision
            .probabilities[0];

        addAgedTrace(
          "MANUAL-REVIEW",
          path,
          manualTop
            ?.hypothesis.id ??
            "NONE",
          result.reasoning
            .decision
            .probabilities,
        );

        continue;
      }

      anomalies++;

      if (
        firstAnomalies.length <
        20
      ) {
        firstAnomalies.push(
          `${pathText(path)} | action NONE mais completed=false`,
        );
      }

      continue;
    }

    if (
      action.type ===
      "complete-diagnosis"
    ) {
      const completed =
        engine.evaluateSession(
          result.session,
          "battery",
        );

      if (
        !completed.completed
      ) {
        anomalies++;

        if (
          firstAnomalies.length <
          20
        ) {
          firstAnomalies.push(
            `${pathText(path)} | complete-diagnosis non exécuté`,
          );
        }
      }
      else {
        terminals++;

        const id =
          completed.session
            .conclusion
            ?.diagnosisId ??
          completed.reasoning
            .decision
            .probabilities[0]
            ?.hypothesis.id ??
          "NONE";

        addAgedTrace(
          "COMPLETE-DIAGNOSIS",
          path,
          id,
          completed.reasoning
            .decision
            .probabilities,
        );
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
      }

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

  output.push("");
  output.push(
    "=== TRACE AGE > 4 ANS ===",
  );

  output.push(
    `Nombre de sorties age > 4 : ${agedTrace.length}`,
  );

  const agedDistribution =
    new Map<string, number>();

  const agedTypes =
    new Map<string, number>();

  for (const line of agedTrace) {
    const topMatch =
      line.match(
        /TOP=([^|]+)/,
      );

    const typeMatch =
      line.match(
        /TYPE=([^|]+)/,
      );

    const top =
      topMatch?.[1]?.trim() ??
      "NONE";

    const type =
      typeMatch?.[1]?.trim() ??
      "UNKNOWN";

    agedDistribution.set(
      top,
      (
        agedDistribution.get(top) ??
        0
      ) + 1,
    );

    agedTypes.set(
      type,
      (
        agedTypes.get(type) ??
        0
      ) + 1,
    );
  }

  output.push("");
  output.push(
    "Distribution types :",
  );

  for (
    const [type, count]
    of [...agedTypes.entries()]
      .sort(
        (a, b) =>
          b[1] - a[1],
      )
  ) {
    output.push(
      `${type}: ${count}`,
    );
  }

  output.push("");
  output.push(
    "Distribution TOP sur chemins age > 4 :",
  );

  for (
    const [id, count]
    of [...agedDistribution.entries()]
      .sort(
        (a, b) =>
          b[1] - a[1],
      )
  ) {
    output.push(
      `${id}: ${count}`,
    );
  }

  output.push("");
  output.push(
    "=== 50 PREMIERES SORTIES AGE > 4 ===",
  );

  for (
    const line
    of agedTrace.slice(
      0,
      50,
    )
  ) {
    output.push(line);
  }

  output.push("");
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
      output.push(item);
    }
  }

  const coverageIncomplete =
    explored >=
    MAX_PATHS_PER_PROFILE;

  if (coverageIncomplete) {
    output.push(
      `ATTENTION : limite de ${MAX_PATHS_PER_PROFILE} parcours atteinte.`,
    );

    output.push(
      "COUVERTURE COMPLETE : NON",
    );

    output.push(
      "RAISON : budget maximal de parcours atteint.",
    );
  }
  else {
    output.push(
      "COUVERTURE COMPLETE : OUI",
    );
  }
}

console.log =
  realLog;

console.log("");
console.log(
  "=== BATTERY ENGINE AUTOPILOT MULTI-PROFILE ===",
);

for (
  const line
  of output
) {
  console.log(line);
}

console.log("");
console.log(
  "=== GLOBAL BATTERY CONCLUSIONS ===",
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
  "=== NON ATTEINTES DANS LE BUDGET ACTUEL ===",
);

for (
  const id
  of expectedHypotheses
) {
  if (
    !globalConclusions.has(id)
  ) {
    console.log(id);
  }
}


