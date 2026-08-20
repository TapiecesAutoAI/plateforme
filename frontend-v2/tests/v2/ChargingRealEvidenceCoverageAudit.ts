import fs from "node:fs";

import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

type Rule = {
  id: string;
  evidenceId: string;
  hypothesisId: string;
  effect: "support" | "contradict";
  weight: number;
};

type Hypothesis = {
  id: string;
};

const rules =
  JSON.parse(
    fs.readFileSync(
      "./knowledge/charging/rules.json",
      "utf8",
    ),
  ) as Rule[];

const hypotheses =
  JSON.parse(
    fs.readFileSync(
      "./knowledge/charging/hypotheses.json",
      "utf8",
    ),
  ) as Hypothesis[];

const reachedEvidence =
  new Set<string>();

const askedActions =
  new Map<string, number>();

const MAX_DEPTH = 12;
const MAX_PATHS = 5000;

function replay(
  path: Choice[],
) {
  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `charging-evidence-audit-${Date.now()}-${Math.random()}`,
      "particulier",
      "charging",
      [],
    );

  for (
    const choice
    of path
  ) {
    if (
      result.completed ||
      !result.action
    ) {
      break;
    }

    if (
      result.action.id !==
      choice.actionId
    ) {
      break;
    }

    result =
      engine.answer(
        result.session,
        "charging",
        choice.actionId,
        choice.optionId,
      );
  }

  for (
    const evidence
    of result.session.evidence
  ) {
    reachedEvidence.add(
      evidence.id,
    );
  }

  if (
    result.action
  ) {
    askedActions.set(
      result.action.id,
      (
        askedActions.get(
          result.action.id,
        ) ??
        0
      ) + 1,
    );
  }

  return result;
}

function run() {
  const originalLog =
    console.log;

  console.log = () => {};

  const queue:
    Choice[][] = [
      [],
    ];

  let explored =
    0;

  while (
    queue.length >
      0 &&
    explored <
      MAX_PATHS
  ) {
    const path =
      queue.shift()!;

    explored += 1;

    const result =
      replay(
        path,
      );

    if (
      result.completed ||
      !result.action ||
      path.length >=
        MAX_DEPTH
    ) {
      continue;
    }

    for (
      const option
      of result.action.options ??
        []
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

  console.log =
    originalLog;

  console.log("");
  console.log(
    "=== CHARGING REAL EVIDENCE COVERAGE ===",
  );

  console.log(
    `États explorés : ${explored}`,
  );

  console.log(
    `Preuves réellement atteintes : ${reachedEvidence.size}`,
  );

  console.log(
    `Actions réellement posées : ${askedActions.size}`,
  );

  console.log("");
  console.log(
    "=== SUPPORTS RÉELS PAR HYPOTHÈSE ===",
  );

  for (
    const hypothesis
    of hypotheses
  ) {
    const supportRules =
      rules.filter(
        rule =>
          rule.hypothesisId ===
            hypothesis.id &&
          rule.effect ===
            "support",
      );

    const reachedSupports =
      supportRules.filter(
        rule =>
          reachedEvidence.has(
            rule.evidenceId,
          ),
      );

    console.log("");
    console.log(
      hypothesis.id,
    );

    console.log(
      `  supports définis : ${supportRules.length}`,
    );

    console.log(
      `  supports atteints: ${reachedSupports.length}`,
    );

    for (
      const rule
      of supportRules
    ) {
      console.log(
        `  ${
          reachedEvidence.has(
            rule.evidenceId,
          )
            ? "OK "
            : "NON"
        } ${rule.evidenceId}`,
      );
    }
  }

  console.log("");
  console.log(
    "=== ACTIONS RÉELLEMENT UTILISÉES ===",
  );

  for (
    const [
      actionId,
      count,
    ]
    of [
      ...askedActions.entries(),
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
      `${actionId}: ${count}`,
    );
  }
}

run();