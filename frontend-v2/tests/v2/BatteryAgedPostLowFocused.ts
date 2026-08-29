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

const MAX_PATHS_PER_PROFILE = 500;

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
    [
      {
        actionId: "battery-main-symptom",
        optionId: "flat",
      },
      {
        actionId: "battery-age",
        optionId: "over-four",
      },
      {
        actionId: "battery-case-check",
        optionId: "normal",
      },
      {
        actionId: "battery-rest-voltage-known",
        optionId: "no",
      },
      {
        actionId: "battery-terminals-check",
        optionId: "good",
      },
      {
        actionId: "battery-ground-check",
        optionId: "good",
      },
      {
        actionId: "battery-jump-start-test",
        optionId: "success",
      },
      {
        actionId: "battery-restart-after-jump",
        optionId: "success",
      },
      {
        actionId: "battery-post-charge-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-post-charge-voltage-value",
        optionId: "below-12-2",
      },
    ],
  ];

  let explored = 0;
  let terminals = 0;
  let anomalies = 0;
  let manualReviews = 0;
    let offeredTestKnown = 0;
    let offeredTestResult = 0;

    let choseTestYes = 0;
    let choseTestNo = 0;

    let reachedGood = 0;
    let reachedBadCell = 0;
    let reachedReplace = 0;
    let reachedRechargeRetest = 0;

    let completedBeforeGood = 0;
    let manualBeforeGood = 0;

    const focusedLines:
      string[] = [];

  const agedCompletedPaths: string[] = [];


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
    {
      const ids =
        new Set<string>(
          result.session.evidence.map(
            (evidence: any) =>
              evidence.id,
          ),
        );

      const next =
        result.action?.id ??
        "NONE";

      if (
        next ===
        "battery-test-known"
      ) {
        offeredTestKnown++;
      }

      if (
        next ===
        "battery-test-result"
      ) {
        offeredTestResult++;
      }

      const lastChoice =
        path[path.length - 1];

      if (
        lastChoice?.actionId ===
          "battery-test-known" &&
        lastChoice.optionId ===
          "yes"
      ) {
        choseTestYes++;
      }

      if (
        lastChoice?.actionId ===
          "battery-test-known" &&
        lastChoice.optionId ===
          "no"
      ) {
        choseTestNo++;
      }

      if (
        ids.has(
          "measurement-battery-test-good",
        )
      ) {
        reachedGood++;
      }

      if (
        ids.has(
          "measurement-battery-test-bad-cell",
        )
      ) {
        reachedBadCell++;
      }

      if (
        ids.has(
          "measurement-battery-test-replace",
        )
      ) {
        reachedReplace++;
      }

      if (
        ids.has(
          "measurement-battery-test-recharge-retest",
        )
      ) {
        reachedRechargeRetest++;
      }

      const hasGood =
        ids.has(
          "measurement-battery-test-good",
        );

      if (
        result.completed &&
        !hasGood
      ) {
        completedBeforeGood++;
      }

      if (
        result.session.status ===
          "manual-review-required" &&
        !hasGood
      ) {
        manualBeforeGood++;
      }

      if (
        focusedLines.length <
        80
      ) {
        focusedLines.push(
          [
            `DEPTH=${path.length}`,
            `LAST=${lastChoice?.actionId ?? "NONE"}=${lastChoice?.optionId ?? "NONE"}`,
            `NEXT=${next}`,
            `STATUS=${result.session.status}`,
            `COMPLETED=${result.completed}`,
            `TOP=${result.reasoning.decision.probabilities[0]?.hypothesis.id ?? "NONE"}`,
            `P=${(
              (
                result.reasoning
                  .decision
                  .probabilities[0]
                  ?.probability ?? 0
              ) * 100
            ).toFixed(2)}%`,
            `GOOD=${hasGood}`,
          ].join(" || "),
        );
      }
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

      if (id === "problem-aged-battery") {
        agedCompletedPaths.push(
          [
            `TYPE=DIRECT-COMPLETED`,
            `QUESTIONS=${path.length}`,
            `PATH=${pathText(path)}`,
            `TOP5=${result.reasoning.decision.probabilities
              .slice(0, 5)
              .map(
                (entry: any) =>
                  `${entry.hypothesis.id}=${(
                    entry.probability * 100
                  ).toFixed(2)}%`,
              )
              .join(" | ")}`,
          ].join(" || "),
        );
      }
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

        if (id === "problem-aged-battery") {
          agedCompletedPaths.push(
            [
              `TYPE=COMPLETE-DIAGNOSIS`,
              `QUESTIONS=${path.length}`,
              `PATH=${pathText(path)}`,
              `TOP5=${completed.reasoning.decision.probabilities
                .slice(0, 5)
                .map(
                  (entry: any) =>
                    `${entry.hypothesis.id}=${(
                      entry.probability * 100
                    ).toFixed(2)}%`,
                )
                .join(" | ")}`,
            ].join(" || "),
          );
        }
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
    "=== FOCUSED POST-LOW -> TEST ===",
  );

  output.push(
    `TEST-KNOWN OFFERED       : ${offeredTestKnown}`,
  );

  output.push(
    `TEST-RESULT OFFERED      : ${offeredTestResult}`,
  );

  output.push(
    `TEST YES CHOSEN          : ${choseTestYes}`,
  );

  output.push(
    `TEST NO CHOSEN           : ${choseTestNo}`,
  );

  output.push("");

  output.push(
    `GOOD REACHED             : ${reachedGood}`,
  );

  output.push(
    `BAD-CELL REACHED         : ${reachedBadCell}`,
  );

  output.push(
    `REPLACE REACHED          : ${reachedReplace}`,
  );

  output.push(
    `RECHARGE-RETEST REACHED  : ${reachedRechargeRetest}`,
  );

  output.push("");

  output.push(
    `COMPLETED BEFORE GOOD     : ${completedBeforeGood}`,
  );

  output.push(
    `MANUAL BEFORE GOOD        : ${manualBeforeGood}`,
  );

  output.push("");

  output.push(
    "=== 80 ETATS FOCUSED ===",
  );

  for (
    const line
    of focusedLines
  ) {
    output.push(line);
  }

  output.push("");
  output.push(
    "=== AGED BATTERY DEEP PATHS ===",
  );

  output.push(
    `Nombre aged-battery : ${agedCompletedPaths.length}`,
  );

  const depthDistribution =
    new Map<number, number>();

  for (const line of agedCompletedPaths) {
    const match =
      line.match(
        /QUESTIONS=(\d+)/,
      );

    const depth =
      Number(
        match?.[1] ?? 0,
      );

    depthDistribution.set(
      depth,
      (
        depthDistribution.get(depth) ??
        0
      ) + 1,
    );
  }

  output.push("");
  output.push(
    "Distribution profondeur :",
  );

  for (
    const [depth, count]
    of [...depthDistribution.entries()]
      .sort(
        (a, b) => a[0] - b[0],
      )
  ) {
    output.push(
      `Questions ${depth}: ${count}`,
    );
  }

  output.push("");
  output.push(
    "=== 60 CHEMINS AGED-BATTERY ===",
  );

  for (
    const line
    of agedCompletedPaths.slice(
      0,
      60,
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
  "=== NEVER REACHED ===",
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



