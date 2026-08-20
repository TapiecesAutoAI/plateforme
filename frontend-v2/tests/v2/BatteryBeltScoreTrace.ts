import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const path = [
  {
    actionId: "battery-main-symptom",
    optionId: "warning-light",
  },
  {
    actionId: "battery-light-behaviour",
    optionId: "engine-running",
  },
  {
    actionId: "battery-charging-voltage-known",
    optionId: "yes",
  },
  {
    actionId: "battery-charging-voltage-value",
    optionId: "below-12-8",
  },
  {
    actionId: "battery-belt-check",
    optionId: "loose",
  },
];

const engine: any =
  new DiagnosticEngineV2();

let result: any =
  engine.createSession(
    "battery-belt-score-trace",
    "mecanicien-garage",
    "battery",
    [],
  );

for (const step of path) {

  if (!result.action) {
    throw new Error(
      `Action absente avant ${step.actionId}`,
    );
  }

  if (
    result.action.id !==
    step.actionId
  ) {
    throw new Error(
      `Attendu ${step.actionId}, obtenu ${result.action.id}`,
    );
  }

  const option =
    result.action.options?.find(
      (candidate: any) =>
        candidate.id ===
        step.optionId,
    );

  if (!option) {
    throw new Error(
      `Option ${step.optionId} introuvable`,
    );
  }

  result =
    engine.answer(
      result.session,
      "battery",
      result.action.id,
      option.id,
    );
}

console.log("");
console.log(
  "=== RESULTAT FINAL ===",
);

console.log(
  "STATUS:",
  result.session.status,
);

console.log(
  "CONCLUSION:",
  result.session
    .conclusion
    ?.diagnosisId ??
    "NONE",
);

console.log("");

for (
  const entry
  of result.reasoning
    .decision
    .probabilities
) {

  if (
    entry.hypothesis.id ===
      "problem-accessory-belt" ||
    entry.hypothesis.id ===
      "problem-alternator"
  ) {

    console.log({
      hypothesis:
        entry.hypothesis.id,

      support:
        entry.support,

      contradiction:
        entry.contradiction,

      score:
        entry.score,

      probability:
        entry.probability,
    });
  }
}
