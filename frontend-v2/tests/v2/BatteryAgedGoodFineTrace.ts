import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const path = [
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
    optionId: "swollen",
  },
  {
    actionId: "battery-test-known",
    optionId: "yes",
  },
  {
    actionId: "battery-test-result",
    optionId: "good",
  },
  {
    actionId: "battery-charging-voltage-known",
    optionId: "yes",
  },
  {
    actionId: "battery-charging-voltage-value",
    optionId: "12-8-to-13-5",
  },
  {
    actionId: "battery-charging-load-known",
    optionId: "no",
  },
];

const engine: any =
  new DiagnosticEngineV2();

let result: any =
  engine.createSession(
    "aged-good-fine-trace",
    "mecanicien-garage",
    "battery",
    [],
  );

for (const step of path) {

  if (!result.action) {
    break;
  }

  if (result.action.id !== step.actionId) {
    throw new Error(
      `Attendu ${step.actionId}, obtenu ${result.action.id}`,
    );
  }

  const option =
    result.action.options?.find(
      (candidate: any) =>
        candidate.id === step.optionId,
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

const probabilities =
  result.reasoning
    ?.decision
    ?.probabilities ?? [];

const aged =
  probabilities.find(
    (entry: any) =>
      entry.hypothesis.id ===
      "problem-aged-battery",
  );

const discharged =
  probabilities.find(
    (entry: any) =>
      entry.hypothesis.id ===
      "problem-discharged-battery",
  );

const top =
  probabilities[0];

const second =
  probabilities[1];

console.log(
  JSON.stringify({
    status:
      result.session.status,

    conclusion:
      result.session
        .conclusion
        ?.diagnosisId ??
      "NONE",

    top:
      top?.hypothesis.id ??
      "NONE",

    topProbability:
      top?.probability ?? 0,

    second:
      second?.hypothesis.id ??
      "NONE",

    secondProbability:
      second?.probability ?? 0,

    lead:
      (
        (top?.probability ?? 0) -
        (second?.probability ?? 0)
      ),

    agedProbability:
      aged?.probability ?? 0,

    agedScore:
      aged?.score ?? 0,

    agedSupport:
      aged?.support ?? 0,

    agedContradiction:
      aged?.contradiction ?? 0,

    dischargedProbability:
      discharged?.probability ?? 0,
  }),
);
