import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

type TerminalResult = {
  path: Choice[];
  completed: boolean;
  conclusionId: string | null;
  confidence: number;
  questionCount: number;
  failures: string[];
};

const MAX_DEPTH = 12;
const MAX_PATHS = 2000;

type ChargingProfile =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

const profiles:
  ChargingProfile[] = [
    "depanneur",
  ];

function replay(
  path: Choice[],
  profile: ChargingProfile,
): {
  result: ReturnType<
    DiagnosticEngineV2["createSession"]
  >;
  reachedEndOfPath: boolean;
  failures: string[];
} {
  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `charging-engine-autopilot-${Date.now()}-${Math.random()}`,
      profile,
      "charging",
      [],
    );

  const failures: string[] =
    [];

  const seenActions =
    new Set<string>();

  for (
    let index = 0;
    index < path.length;
    index += 1
  ) {
    if (
      result.completed ||
      !result.action
    ) {
      failures.push(
        `Le parcours contient encore des réponses après la fin du diagnostic.`,
      );

      return {
        result,
        reachedEndOfPath:
          false,
        failures,
      };
    }

    const action =
      result.action;

    if (
      seenActions.has(
        action.id,
      )
    ) {
      failures.push(
        `Question rǸpǸtǸe : ${action.id}.`,
      );
    }

    seenActions.add(
      action.id,
    );

    const expectedChoice =
      path[index];

    if (
      expectedChoice.actionId !==
      action.id
    ) {
      failures.push(
        [
          "Parcours devenu incohǸrent.",
          `Attendu : ${expectedChoice.actionId}.`,
          `Obtenu : ${action.id}.`,
        ].join(" "),
      );

      return {
        result,
        reachedEndOfPath:
          false,
        failures,
      };
    }

    const option =
      action.options?.find(
        item =>
          item.id ===
          expectedChoice.optionId,
      );

    if (!option) {
      failures.push(
        [
          "Option introuvable.",
          `Question : ${action.id}.`,
          `Option : ${expectedChoice.optionId}.`,
        ].join(" "),
      );

      return {
        result,
        reachedEndOfPath:
          false,
        failures,
      };
    }

    result =
      engine.answer(
        result.session,
        "charging",
        action.id,
        option.id,
      );
  }

  return {
    result,
    reachedEndOfPath:
      true,
    failures,
  };
}

function validateTerminal(
  path: Choice[],
  result:
    ReturnType<
      DiagnosticEngineV2["createSession"]
    >,
  inheritedFailures:
    string[],
): TerminalResult {
  const failures = [
    ...inheritedFailures,
  ];

  const primary =
    result.reasoning
      .decision
      .probabilities[0] ??
    null;

  const confidence =
    primary?.probability ??
    0;

  if (
    !Number.isFinite(
      confidence,
    ) ||
    confidence < 0 ||
    confidence > 1
  ) {
    failures.push(
      `Confiance invalide : ${confidence}.`,
    );
  }

  if (
    result.completed &&
    primary === null
  ) {
    failures.push(
      "Diagnostic terminé sans hypothèse principale.",
    );
  }

  const actionIds =
    path.map(
      item =>
        item.actionId,
    );

  if (
    new Set(
      actionIds,
    ).size !==
    actionIds.length
  ) {
    failures.push(
      "Une mǦme question apparaǩt plusieurs fois dans le parcours.",
    );
  }

  return {
    path,
    completed:
      result.completed,
    conclusionId:
      primary?.hypothesis.id ??
      null,
    confidence,
    questionCount:
      path.length,
    failures: [
      ...new Set(
        failures,
      ),
    ],
  };
}

function formatPath(
  path: Choice[],
): string {
  if (
    path.length ===
    0
  ) {
    return "(aucune rǸponse)";
  }

  return path
    .map(
      item =>
        `${item.actionId}=${item.optionId}`,
    )
    .join(
      " -> ",
    );
}

type ProfileRunResult = {
  profile: ChargingProfile;
  exploredPaths: number;
  terminals: TerminalResult[];
  failed: TerminalResult[];
  successful: number;
  conclusions: Map<string, number>;
};

function runProfile(
  profile: ChargingProfile,
): ProfileRunResult {
  const queue:
    Choice[][] = [
      [],
    ];

  const terminals:
    TerminalResult[] =
    [];

  let exploredPaths =
    0;

  while (
    queue.length >
      0 &&
    exploredPaths <
      MAX_PATHS
  ) {
    const path =
      queue.shift()!;

    exploredPaths +=
      1;

    const replayResult =
      replay(
        path,
        profile,
      );

    if (
      !replayResult
        .reachedEndOfPath
    ) {
      terminals.push(
        validateTerminal(
          path,
          replayResult.result,
          replayResult.failures,
        ),
      );

      continue;
    }

    const result =
      replayResult.result;

    if (
      result.completed ||
      !result.action
    ) {
      terminals.push(
        validateTerminal(
          path,
          result,
          replayResult.failures,
        ),
      );

      continue;
    }

    if (
      path.length >=
      MAX_DEPTH
    ) {
      terminals.push(
        validateTerminal(
          path,
          result,
          [
            ...replayResult.failures,
            `Profondeur maximale ${MAX_DEPTH} atteinte avant conclusion.`,
          ],
        ),
      );

      continue;
    }

    if (
      result.action.type ===
        "complete-diagnosis"
    ) {
      terminals.push(
        validateTerminal(
          path,
          result,
          replayResult.failures,
        ),
      );

      continue;
    }

    const options =
      result.action.options ??
      [];

    if (
      options.length ===
      0
    ) {
      terminals.push(
        validateTerminal(
          path,
          result,
          [
            ...replayResult.failures,
            `Question sans option : ${result.action.id}.`,
          ],
        ),
      );

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
            result.action.id,
          optionId:
            option.id,
        },
      ]);
    }
  }

  const failed =
    terminals.filter(
      item =>
        item.failures.length >
        0,
    );

  const successful =
    terminals.length -
    failed.length;

  const conclusions =
    new Map<
      string,
      number
    >();

  for (
    const terminal
    of terminals
  ) {
    const key =
      terminal.conclusionId ??
      "(aucune)";

    conclusions.set(
      key,
      (
        conclusions.get(
          key,
        ) ??
        0
      ) +
        1,
    );
  }

  return {
    profile,
    exploredPaths,
    terminals,
    failed,
    successful,
    conclusions,
  };
}

function printProfileResult(
  result: ProfileRunResult,
): void {
  console.log("");
  console.log(
    `=== ${result.profile.toUpperCase()} ===`,
  );

  console.log(
    `Parcours explorǸs : ${result.exploredPaths}`,
  );

  console.log(
    `Parcours terminaux : ${result.terminals.length}`,
  );

  console.log(
    `OK : ${result.successful}`,
  );

  console.log(
    `Anomalies : ${result.failed.length}`,
  );

  console.log("");
  console.log(
    "Conclusions :",
  );

  for (
    const [
      conclusionId,
      count,
    ]
    of [
      ...result.conclusions.entries(),
    ].sort(
      (
        first,
        second,
      ) =>
        second[1] -
        first[1],
    )
  ) {
    console.log(
      `${conclusionId}: ${count}`,
    );
  }

  if (
    result.failed.length >
    0
  ) {
    console.log("");
    console.log(
      "Premières anomalies :",
    );

    for (
      const [
        index,
        failure,
      ]
      of result.failed
        .slice(
          0,
          10,
        )
        .entries()
    ) {
      console.log("");
      console.log(
        `#${index + 1}`,
      );

      console.log(
        formatPath(
          failure.path,
        ),
      );

      console.log(
        `Conclusion : ${failure.conclusionId ?? "aucune"}`,
      );

      console.log(
        `Confiance : ${(failure.confidence * 100).toFixed(2)} %`,
      );

      for (
        const message
        of failure.failures
      ) {
        console.log(
          `- ${message}`,
        );
      }
    }
  }

  if (
    result.exploredPaths >=
    MAX_PATHS
  ) {
    console.log("");
    console.log(
      `ATTENTION : limite de ${MAX_PATHS} parcours atteinte.`,
    );
  }
}


function run() {
  const originalConsoleLog =
    console.log;

  console.log = () => {};

  const results =
    profiles.map(
      profile =>
        runProfile(profile),
    );

  console.log =
    originalConsoleLog;

  console.log("");
  console.log(
    "=== CHARGING ENGINE AUTOPILOT MULTI-PROFILE ===",
  );

  for (
    const result
    of results
  ) {
    printProfileResult(
      result,
    );
  }

  const totalExplored =
    results.reduce(
      (total, result) =>
        total +
        result.exploredPaths,
      0,
    );

  const totalTerminals =
    results.reduce(
      (total, result) =>
        total +
        result.terminals.length,
      0,
    );

  const totalFailed =
    results.reduce(
      (total, result) =>
        total +
        result.failed.length,
      0,
    );

  console.log("");
  console.log(
    "=== TOTAL CHARGING ENGINE ===",
  );

  console.log(
    `Parcours explorǸs : ${totalExplored}`,
  );

  console.log(
    `Parcours terminaux : ${totalTerminals}`,
  );

  console.log(
    `Anomalies : ${totalFailed}`,
  );

  process.exitCode =
    totalFailed > 0
      ? 1
      : 0;
}

run();

