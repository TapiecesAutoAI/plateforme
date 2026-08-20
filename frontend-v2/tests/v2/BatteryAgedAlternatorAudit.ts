import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Answer =
  readonly [string, string];

const scenarios: {
  name: string;
  answers: Answer[];
}[] = [
  {
    name: "AGED-BATTERY",
    answers: [
      ["battery-main-symptom", "flat"],
      ["battery-age", "over-four"],
      ["battery-case-check", "normal"],
      ["battery-rest-voltage-known", "yes"],
      ["battery-rest-voltage-value", "below-11-8"],
      ["battery-terminals-check", "good"],
      ["battery-ground-check", "good"],
      ["battery-jump-start-test", "success"],
      ["battery-restart-after-jump", "fails"],
      ["battery-post-charge-voltage-known", "yes"],
      ["battery-post-charge-voltage-value", "below-12-2"],
      ["battery-test-known", "yes"],
    ],
  },

  {
    name: "ALTERNATOR",
    answers: [
      ["battery-main-symptom", "warning-light"],
      ["battery-light-behaviour", "engine-running"],
      ["battery-charging-voltage-known", "yes"],
      ["battery-charging-voltage-value", "below-12-8"],
      ["battery-belt-check", "normal"],
      ["battery-alternator-connection-check", "good"],
      ["battery-charging-load-known", "yes"],
    ],
  },
];

const realLog =
  console.log;

console.log = () => {};

const output: string[] = [];

for (const scenario of scenarios) {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `battery-target-${scenario.name}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  output.push("");
  output.push(
    `=== ${scenario.name} ===`,
  );

  for (
    const [expectedAction, optionId]
    of scenario.answers
  ) {

    const actual =
      result.action?.id ??
      "NONE";

    output.push(
      `ACTION=${actual} | attendu=${expectedAction} | option=${optionId}`,
    );

    if (
      actual !== expectedAction
    ) {
      output.push(
        ">>> ECART",
      );
      break;
    }

    result =
      engine.answer(
        result.session,
        "battery",
        expectedAction,
        optionId,
      );

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    output.push(
      `   TOP=${top?.hypothesis.id ?? "NONE"} | ` +
      `P=${((top?.probability ?? 0) * 100).toFixed(2)}% | ` +
      `completed=${result.completed} | ` +
      `status=${result.session.status} | ` +
      `next=${result.action?.id ?? "NONE"}`,
    );

    if (
      result.completed ||
      result.session.status ===
        "manual-review-required"
    ) {
      break;
    }
  }

  output.push(
    `FINAL conclusion=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
  );

  output.push(
    `FINAL status=${result.session.status}`,
  );

  output.push(
    `FINAL completed=${result.completed}`,
  );
}

console.log =
  realLog;

console.log(
  "=== BATTERY AGED + ALTERNATOR TARGET AUDIT ===",
);

for (const line of output) {
  console.log(line);
}
