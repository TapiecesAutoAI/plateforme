import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Step = readonly [
  string,
  string,
];

const prefix: Step[] = [
  ["battery-main-symptom", "flat"],
  ["battery-age", "over-four"],
  ["battery-case-check", "normal"],
  ["battery-rest-voltage-known", "no"],
  ["battery-terminals-check", "good"],
  ["battery-ground-check", "good"],
  ["battery-jump-start-test", "success"],
  ["battery-restart-after-jump", "fails"],
  ["battery-post-charge-voltage-known", "yes"],
  ["battery-post-charge-voltage-value", "below-12-2"],
];

const chargingValues = [
  "below-12-8",
  "12-8-to-13-5",
  "13-5-to-14-8",
  "above-14-8",
];

function answer(
  engine: any,
  result: any,
  actionId: string,
  optionId: string,
): any {

  if (!result.action) {
    throw new Error(
      `Action absente avant ${actionId}`,
    );
  }

  if (
    result.action.id !==
    actionId
  ) {
    throw new Error(
      `Attendu ${actionId}, obtenu ${result.action.id}`,
    );
  }

  const option =
    result.action.options?.find(
      (candidate: any) =>
        candidate.id === optionId,
    );

  if (!option) {
    throw new Error(
      `Option ${optionId} absente sur ${actionId}`,
    );
  }

  return engine.answer(
    result.session,
    "battery",
    actionId,
    optionId,
  );
}

function makeBase(
  withGoodTest: boolean,
): {
  engine: any;
  result: any;
} {

  const engine: any =
    new DiagnosticEngineV2();

  let result: any =
    engine.createSession(
      withGoodTest
        ? "aged-matrix-good"
        : "aged-matrix-no-test",
      "mecanicien-garage",
      "battery",
      [],
    );

  for (
    const [actionId, optionId]
    of prefix
  ) {
    result =
      answer(
        engine,
        result,
        actionId,
        optionId,
      );
  }

  result =
    answer(
      engine,
      result,
      "battery-test-known",
      withGoodTest
        ? "yes"
        : "no",
    );

  if (withGoodTest) {
    result =
      answer(
        engine,
        result,
        "battery-test-result",
        "good",
      );
  }

  return {
    engine,
    result,
  };
}

function summarize(
  branch: string,
  chargingValue: string,
  result: any,
) {

  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ??
    [];

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

  const alternator =
    probabilities.find(
      (entry: any) =>
        entry.hypothesis.id ===
        "problem-alternator",
    );

  const regulator =
    probabilities.find(
      (entry: any) =>
        entry.hypothesis.id ===
        "problem-voltage-regulator",
    );

  const top =
    probabilities[0];

  const second =
    probabilities[1];

  console.log(
    JSON.stringify({
      branch,
      chargingValue,

      status:
        result.session.status,

      completed:
        result.completed,

      nextAction:
        result.action?.id ??
        "NONE",

      conclusion:
        result.session
          .conclusion
          ?.diagnosisId ??
        "NONE",

      top:
        top?.hypothesis.id ??
        "NONE",

      topPct:
        Number(
          (
            (top?.probability ?? 0) *
            100
          ).toFixed(2),
        ),

      leadPct:
        Number(
          (
            (
              (top?.probability ?? 0) -
              (second?.probability ?? 0)
            ) *
            100
          ).toFixed(2),
        ),

      agedPct:
        Number(
          (
            (aged?.probability ?? 0) *
            100
          ).toFixed(2),
        ),

      dischargedPct:
        Number(
          (
            (discharged?.probability ?? 0) *
            100
          ).toFixed(2),
        ),

      alternatorPct:
        Number(
          (
            (alternator?.probability ?? 0) *
            100
          ).toFixed(2),
        ),

      regulatorPct:
        Number(
          (
            (regulator?.probability ?? 0) *
            100
          ).toFixed(2),
        ),
    }),
  );
}

for (
  const withGoodTest
  of [false, true]
) {

  for (
    const chargingValue
    of chargingValues
  ) {

    const {
      engine,
      result: baseResult,
    } =
      makeBase(
        withGoodTest,
      );

    let result =
      answer(
        engine,
        baseResult,
        "battery-charging-voltage-known",
        "yes",
      );

    result =
      answer(
        engine,
        result,
        "battery-charging-voltage-value",
        chargingValue,
      );

    summarize(
      withGoodTest
        ? "TEST-GOOD"
        : "NO-TEST",
      chargingValue,
      result,
    );
  }
}
