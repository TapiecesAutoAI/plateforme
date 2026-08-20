import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Choice = {
  actionId: string;
  optionId: string;
};

const PREFIX: Choice[] = [
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
    optionId: "yes",
  },
  {
    actionId: "battery-rest-voltage-value",
    optionId: "below-11-8",
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
];

const queue: Choice[][] = [
  PREFIX,
];

const MAX_PATHS = 500;

let explored = 0;
let postChargeLow = 0;

const conclusions =
  new Map<string, number>();

const rows: string[] = [];

const realLog =
  console.log;

console.log = () => {};

while (
  queue.length > 0 &&
  explored < MAX_PATHS
) {

  const path =
    queue.shift()!;

  explored++;

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `battery-aged-focused-${explored}`,
      "mecanicien-garage",
      "battery",
      [],
    );

  let valid = true;

  for (const step of path) {

    if (
      !result.action ||
      result.completed ||
      result.action.id !==
        step.actionId
    ) {
      valid = false;
      break;
    }

    result =
      engine.answer(
        result.session,
        "battery",
        step.actionId,
        step.optionId,
      );
  }

  if (!valid) {
    continue;
  }

  const hasLow =
    result.session.evidence.some(
      e =>
        e.id ===
        "measurement-post-charge-below-12-2",
    );

  if (hasLow) {

    postChargeLow++;

    const top =
      result.reasoning
        .decision
        .probabilities[0];

    if (postChargeLow <= 20) {
      rows.push(
        [
          `LOW #${postChargeLow}`,
          `TOP=${top?.hypothesis.id ?? "NONE"}`,
          `P=${((top?.probability ?? 0) * 100).toFixed(2)}%`,
          `STATUS=${result.session.status}`,
          `NEXT=${result.action?.id ?? "NONE"}`,
          `CONCLUSION=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
        ].join(" | "),
      );
    }
  }

  if (result.completed) {

    const id =
      result.session
        .conclusion
        ?.diagnosisId ??
      "NONE";

    conclusions.set(
      id,
      (
        conclusions.get(id) ??
        0
      ) + 1,
    );

    continue;
  }

  if (
    result.session.status ===
      "manual-review-required" ||
    !result.action
  ) {
    continue;
  }

  for (
    const option
    of result.action.options ?? []
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

console.log = realLog;

console.log("");
console.log(
  "=== AGED BATTERY FOCUSED AUTOPILOT ===",
);

console.log(
  `Parcours explores : ${explored}`,
);

console.log(
  `Post-charge <12.2V : ${postChargeLow}`,
);

console.log("");
console.log(
  "Conclusions :",
);

for (
  const [id, count]
  of conclusions
) {
  console.log(
    `${id}: ${count}`,
  );
}

console.log("");

for (const row of rows) {
  console.log(row);
}
