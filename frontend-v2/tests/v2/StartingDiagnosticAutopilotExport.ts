import {
  writeFileSync,
} from "node:fs";
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
const MAX_PATHS = 5000;

function replay(
  path: Choice[],
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
      `autopilot-${Date.now()}-${Math.random()}`,
      "particulier",
      "starting",
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
        "starting",
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

function run() {
  const originalConsoleLog =
    console.log;

  console.log = () => {};
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

  const exportPath =
    process.env
      .STARTING_EXPORT_PATH;

  if (exportPath) {
    writeFileSync(
      exportPath,
      JSON.stringify(
        {
          exploredPaths,
          terminalCount:
            terminals.length,
          terminals:
            terminals.map(
              terminal => ({
                path:
                  terminal.path,
                pathKey:
                  formatPath(
                    terminal.path,
                  ),
                completed:
                  terminal.completed,
                conclusionId:
                  terminal.conclusionId,
                confidence:
                  terminal.confidence,
                questionCount:
                  terminal.questionCount,
                failures:
                  terminal.failures,
              }),
            ),
        },
        null,
        2,
      ),
      "utf8",
    );
  }
  console.log =
    originalConsoleLog;

  console.log("");
  console.log(
    "=== STARTING DIAGNOSTIC AUTOPILOT ===",
  );

  console.log(
    `Parcours explorǸs : ${exploredPaths}`,
  );

  console.log(
    `Parcours terminaux : ${terminals.length}`,
  );

  console.log(
    `OK : ${successful}`,
  );

  console.log(
    `Anomalies : ${failed.length}`,
  );

  console.log("");
  console.log(
    "=== CONCLUSIONS ===",
  );

  for (
    const [
      conclusionId,
      count,
    ]
    of [
      ...conclusions.entries(),
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
    failed.length >
    0
  ) {
    console.log("");
    console.log(
      "=== PREMIÈRES ANOMALIES ===",
    );

    for (
      const [
        index,
        failure,
      ]
      of failed
        .slice(
          0,
          30,
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
    exploredPaths >=
    MAX_PATHS
  ) {
    console.log("");
    console.log(
      `ATTENTION : limite de ${MAX_PATHS} parcours atteinte.`,
    );
  }

  process.exitCode =
    failed.length >
    0
      ? 1
      : 0;
}

run();
