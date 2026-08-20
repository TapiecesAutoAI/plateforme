import {
  STARTING_REFERENCE_SCENARIOS,
} from "./DiagnosticScenario";

import {
  KnowledgeLoader,
} from "../knowledge";

type MigrationStatus =
  | "VALID"
  | "ALIAS"
  | "MISSING";

interface MigrationItem {
  scenarioId: string;
  type:
    | "hypothesis"
    | "question";
  originalId: string;
  resolvedId: string | null;
  status: MigrationStatus;
}

const HYPOTHESIS_ALIASES:
  Readonly<Record<string, string>> = {
    "battery-weak":
      "problem-weak-battery",

    "battery-discharged":
      "problem-weak-battery",

    "battery-failure":
      "problem-weak-battery",

    "starter-failure":
      "problem-starter",

    "starter-defective":
      "problem-starter",

    "starter-solenoid-failure":
      "problem-starter",

    "battery-terminal-connection":
      "problem-battery-connection",

    "battery-ground-connection":
      "problem-battery-connection",

    "battery-connection-failure":
      "problem-battery-connection",

    "immobilizer-failure":
      "problem-immobilizer",

    "key-recognition-failure":
      "problem-immobilizer",

    "fuel-pump-failure":
      "problem-fuel-supply",

    "fuel-delivery-failure":
      "problem-fuel-supply",

    "starter-drive-failure":
      "problem-starter-drive",

    "starter-pinion-failure":
      "problem-starter-drive",

    "flywheel-ring-gear-failure":
      "problem-starter-drive",
  };

const QUESTION_ALIASES:
  Readonly<Record<string, string>> = {
    "starting-lights-behaviour":
      "starting-general-lights",
  };

function resolveId(
  originalId: string,
  existingIds: ReadonlySet<string>,
  aliases:
    Readonly<Record<string, string>>,
): {
  resolvedId: string | null;
  status: MigrationStatus;
} {
  if (
    existingIds.has(
      originalId,
    )
  ) {
    return {
      resolvedId:
        originalId,
      status:
        "VALID",
    };
  }

  const alias =
    aliases[
      originalId
    ];

  if (
    alias &&
    existingIds.has(
      alias,
    )
  ) {
    return {
      resolvedId:
        alias,
      status:
        "ALIAS",
    };
  }

  return {
    resolvedId:
      null,
    status:
      "MISSING",
  };
}

function collectMigrationItems():
  MigrationItem[] {
  const loader =
    new KnowledgeLoader();

  const items:
    MigrationItem[] =
    [];

  for (
    const scenario
    of STARTING_REFERENCE_SCENARIOS
  ) {
    const knowledge =
      loader.loadDomain(
        scenario.domain,
      );

    const hypothesisIds =
      new Set(
        knowledge.hypotheses.map(
          hypothesis =>
            hypothesis.id,
        ),
      );

    const actionIds =
      new Set(
        knowledge.actions.map(
          action =>
            action.id,
        ),
      );

    for (
      const hypothesisId
      of scenario.expectation
        .expectedHypothesisIds
    ) {
      const resolution =
        resolveId(
          hypothesisId,
          hypothesisIds,
          HYPOTHESIS_ALIASES,
        );

      items.push({
        scenarioId:
          scenario.id,
        type:
          "hypothesis",
        originalId:
          hypothesisId,
        resolvedId:
          resolution.resolvedId,
        status:
          resolution.status,
      });
    }

    for (
      const answer
      of scenario.answers
    ) {
      if (
        !answer.questionId
      ) {
        continue;
      }

      const resolution =
        resolveId(
          answer.questionId,
          actionIds,
          QUESTION_ALIASES,
        );

      items.push({
        scenarioId:
          scenario.id,
        type:
          "question",
        originalId:
          answer.questionId,
        resolvedId:
          resolution.resolvedId,
        status:
          resolution.status,
      });
    }

    for (
      const questionId
      of scenario.expectation
        .forbiddenQuestionIds
    ) {
      const resolution =
        resolveId(
          questionId,
          actionIds,
          QUESTION_ALIASES,
        );

      items.push({
        scenarioId:
          scenario.id,
        type:
          "question",
        originalId:
          questionId,
        resolvedId:
          resolution.resolvedId,
        status:
          resolution.status,
      });
    }
  }

  return items;
}

function printReport(
  items: MigrationItem[],
): void {
  const aliases =
    items.filter(
      item =>
        item.status ===
        "ALIAS",
    );

  const missing =
    items.filter(
      item =>
        item.status ===
        "MISSING",
    );

  const valid =
    items.filter(
      item =>
        item.status ===
        "VALID",
    );

  console.log("");
  console.log(
    "========================================",
  );
  console.log(
    " SCENARIO MIGRATION ANALYZER",
  );
  console.log(
    "========================================",
  );

  console.log("");
  console.log(
    `VALID   : ${valid.length}`,
  );
  console.log(
    `ALIASES : ${aliases.length}`,
  );
  console.log(
    `MISSING : ${missing.length}`,
  );

  if (
    aliases.length >
    0
  ) {
    console.log("");
    console.log(
      "ALIASES CONFIRMÉS",
    );
    console.log(
      "----------------------------------------",
    );

    for (
      const item
      of aliases
    ) {
      console.log(
        [
          item.scenarioId,
          item.type,
          item.originalId,
          "->",
          item.resolvedId,
        ].join(
          " | ",
        ),
      );
    }
  }

  if (
    missing.length >
    0
  ) {
    console.log("");
    console.log(
      "IDENTIFIANTS À MIGRER",
    );
    console.log(
      "----------------------------------------",
    );

    for (
      const item
      of missing
    ) {
      console.log(
        [
          item.scenarioId,
          item.type,
          item.originalId,
        ].join(
          " | ",
        ),
      );
    }
  }

  console.log("");
  console.log(
    "========================================",
  );

  if (
    missing.length >
    0
  ) {
    console.log(
      "MIGRATION : REQUIRED",
    );
  } else {
    console.log(
      "MIGRATION : READY",
    );
  }

  console.log(
    "========================================",
  );
}

const items =
  collectMigrationItems();

printReport(
  items,
);

