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

const MAX_PATHS_PER_PROFILE = 20000;

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
    let funnelAge = 0;
    let funnelJumpSuccess = 0;
    let funnelRestartOffered = 0;
    let funnelPostKnownOffered = 0;
    let funnelPostValueOffered = 0;

    let funnelPostLow = 0;
    let funnelGood = 0;

    let funnelAgeJump = 0;
    let funnelAgeRestart = 0;
    let funnelAgePostKnown = 0;
    let funnelAgePostLow = 0;
    let funnelAgeGood = 0;
    let funnelTriple = 0;

    const funnelPostExamples:
      string[] = [];

    const funnelAgePostExamples:
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
    /*
     * FUNNEL TRACE
     *
     * On inspecte la session APRES replay du chemin.
     */
    {
      const confirmedIds =
        new Set<string>(
          result.session.evidence.map(
            (evidence: any) =>
              evidence.id,
          ),
        );

      const hasAge =
        confirmedIds.has(
          "observation-battery-age-over-four",
        );

      const hasJumpSuccess =
        confirmedIds.has(
          "observation-jump-start-success",
        );

      const hasPostLow =
        confirmedIds.has(
          "measurement-post-charge-below-12-2",
        );

      const hasGood =
        confirmedIds.has(
          "measurement-battery-test-good",
        );

      const nextActionId =
        result.action?.id ??
        "NONE";

      if (hasAge) {
        funnelAge++;
      }

      if (hasJumpSuccess) {
        funnelJumpSuccess++;
      }

      if (
        nextActionId ===
        "battery-restart-after-jump"
      ) {
        funnelRestartOffered++;
      }

      if (
        nextActionId ===
        "battery-post-charge-voltage-known"
      ) {
        funnelPostKnownOffered++;

        if (
          funnelPostExamples.length <
          30
        ) {
          funnelPostExamples.push(
            [
              `PATH=${pathText(path)}`,
              `AGE=${hasAge}`,
              `JUMP=${hasJumpSuccess}`,
              `GOOD=${hasGood}`,
              `NEXT=${nextActionId}`,
              `STATUS=${result.session.status}`,
            ].join(" || "),
          );
        }
      }

      if (
        nextActionId ===
        "battery-post-charge-voltage-value"
      ) {
        funnelPostValueOffered++;
      }

      if (hasPostLow) {
        funnelPostLow++;
      }

      if (hasGood) {
        funnelGood++;
      }

      if (
        hasAge &&
        hasJumpSuccess
      ) {
        funnelAgeJump++;
      }

      if (
        hasAge &&
        nextActionId ===
          "battery-restart-after-jump"
      ) {
        funnelAgeRestart++;
      }

      if (
        hasAge &&
        nextActionId ===
          "battery-post-charge-voltage-known"
      ) {
        funnelAgePostKnown++;
      }

      if (
        hasAge &&
        hasPostLow
      ) {
        funnelAgePostLow++;

        if (
          funnelAgePostExamples.length <
          30
        ) {
          funnelAgePostExamples.push(
            [
              `PATH=${pathText(path)}`,
              `GOOD=${hasGood}`,
              `NEXT=${nextActionId}`,
              `STATUS=${result.session.status}`,
              `EVIDENCE=${[
                ...confirmedIds,
              ].join(",")}`,
            ].join(" || "),
          );
        }
      }

      if (
        hasAge &&
        hasGood
      ) {
        funnelAgeGood++;
      }

      if (
        hasAge &&
        hasPostLow &&
        hasGood
      ) {
        funnelTriple++;
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
            `${pathText(path)} | complete-diagnosis non exǸcutǸ`,
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
    "=== FUNNEL JUMP -> POST-CHARGE ===",
  );

  output.push(
    `AGE >4                         : ${funnelAge}`,
  );

  output.push(
    `JUMP SUCCESS                   : ${funnelJumpSuccess}`,
  );

  output.push(
    `RESTART ACTION OFFERED         : ${funnelRestartOffered}`,
  );

  output.push(
    `POST-KNOWN ACTION OFFERED      : ${funnelPostKnownOffered}`,
  );

  output.push(
    `POST-VALUE ACTION OFFERED      : ${funnelPostValueOffered}`,
  );

  output.push(
    `POST-CHARGE <12.2              : ${funnelPostLow}`,
  );

  output.push(
    `TEST GOOD                      : ${funnelGood}`,
  );

  output.push("");

  output.push(
    "=== FUNNEL AGE >4 ===",
  );

  output.push(
    `AGE + JUMP SUCCESS             : ${funnelAgeJump}`,
  );

  output.push(
    `AGE + RESTART OFFERED          : ${funnelAgeRestart}`,
  );

  output.push(
    `AGE + POST-KNOWN OFFERED       : ${funnelAgePostKnown}`,
  );

  output.push(
    `AGE + POST <12.2               : ${funnelAgePostLow}`,
  );

  output.push(
    `AGE + GOOD                     : ${funnelAgeGood}`,
  );

  output.push(
    `AGE + POST <12.2 + GOOD        : ${funnelTriple}`,
  );

  output.push("");

  output.push(
    "=== EXEMPLES POST-KNOWN OFFERED ===",
  );

  if (
    funnelPostExamples.length ===
    0
  ) {
    output.push("AUCUN");
  }
  else {
    for (
      const example
      of funnelPostExamples
    ) {
      output.push(example);
    }
  }

  output.push("");

  output.push(
    "=== EXEMPLES AGE + POST <12.2 ===",
  );

  if (
    funnelAgePostExamples.length ===
    0
  ) {
    output.push("AUCUN");
  }
  else {
    for (
      const example
      of funnelAgePostExamples
    ) {
      output.push(example);
    }
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



