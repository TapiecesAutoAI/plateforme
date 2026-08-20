import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Step = {
  actionId: string;
  optionId: string;
};

type Scenario = {
  name: string;
  path: Step[];
};

const scenarios: Scenario[] = [

  // ----------------------------------------------------------
  // 1. CAS SUSPECT :
  // âge > 4 ans mais test batterie = GOOD
  // ----------------------------------------------------------

  {
    name: "AGED + BATTERY TEST GOOD",
    path: [
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
    ],
  },

  // ----------------------------------------------------------
  // 2. CAS POSITIF :
  // âge >4 + après recharge <12,2 V
  // ----------------------------------------------------------

  {
    name: "AGED + POST CHARGE BELOW 12.2",
    path: [
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
        optionId: "fails",
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
  },

  // ----------------------------------------------------------
  // 3. CAS POSITIF :
  // âge >4 + cranking <8 V
  // ----------------------------------------------------------

  {
    name: "AGED + CRANKING BELOW 8",
    path: [
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
        optionId: "fails",
      },
      {
        actionId: "battery-cranking-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-cranking-voltage-value",
        optionId: "below-8",
      },
    ],
  },
];

for (
  const scenario
  of scenarios
) {

  const engine: any =
    new DiagnosticEngineV2();

  let result: any =
    engine.createSession(
      `aged-038-${scenario.name}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  let pathValid = true;
  let answered = 0;

  for (
    const step
    of scenario.path
  ) {

    if (
      result.completed ||
      !result.action
    ) {
      break;
    }

    if (
      result.action.id !==
      step.actionId
    ) {

      console.log(
        JSON.stringify({
          scenario:
            scenario.name,

          error:
            "ACTION_MISMATCH",

          expected:
            step.actionId,

          actual:
            result.action.id,

          answered,
        }),
      );

      pathValid = false;
      break;
    }

    const option =
      result.action.options?.find(
        (candidate: any) =>
          candidate.id ===
          step.optionId,
      );

    if (!option) {

      console.log(
        JSON.stringify({
          scenario:
            scenario.name,

          error:
            "OPTION_NOT_FOUND",

          action:
            step.actionId,

          option:
            step.optionId,
        }),
      );

      pathValid = false;
      break;
    }

    result =
      engine.answer(
        result.session,
        "battery",
        result.action.id,
        option.id,
      );

    answered += 1;
  }

  if (!pathValid) {
    continue;
  }

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

  const internal =
    probabilities.find(
      (entry: any) =>
        entry.hypothesis.id ===
        "problem-internal-battery-failure",
    );

  const top =
    probabilities[0];

  const second =
    probabilities[1];

  console.log(
    JSON.stringify({
      scenario:
        scenario.name,

      answered,

      completed:
        result.completed,

      status:
        result.session.status,

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

      topProbability:
        top?.probability ??
        0,

      second:
        second?.hypothesis.id ??
        "NONE",

      secondProbability:
        second?.probability ??
        0,

      lead:
        (
          (top?.probability ?? 0) -
          (second?.probability ?? 0)
        ),

      agedProbability:
        aged?.probability ??
        0,

      agedSupport:
        aged?.support ??
        0,

      agedContradiction:
        aged?.contradiction ??
        0,

      dischargedProbability:
        discharged?.probability ??
        0,

      internalProbability:
        internal?.probability ??
        0,
    }),
  );
}
