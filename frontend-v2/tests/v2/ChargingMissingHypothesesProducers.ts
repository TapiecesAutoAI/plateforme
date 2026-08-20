import fs from "node:fs";

import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

type Target = {
  hypothesisId: string;
  evidenceIds: string[];
};

const targets: Target[] = [
  {
    hypothesisId:
      "problem-ground-circuit",

    evidenceIds: [
      "measurement-ground-voltage-drop-high",
      "observation-charging-ground-bad",
    ],
  },

  {
    hypothesisId:
      "problem-positive-cable",

    evidenceIds: [
      "measurement-positive-voltage-drop-high",
      "observation-positive-circuit-bad",
    ],
  },

  {
    hypothesisId:
      "problem-battery-sensor",

    evidenceIds: [
      "observation-battery-sensor-bad",
    ],
  },
];

const actions =
  JSON.parse(
    fs.readFileSync(
      "./knowledge/charging/actions.json",
      "utf8",
    ),
  );

const realLog =
  console.log;

console.log = () => {};

const rows: string[] =
  [];

for (
  const target
  of targets
) {

  rows.push("");
  rows.push(
    `=== ${target.hypothesisId} ===`,
  );

  for (
    const evidenceId
    of target.evidenceIds
  ) {

    const producers =
      actions.filter(
        (action: any) =>
          (action.options ?? []).some(
            (option: any) =>
              (
                option.addsEvidence ??
                []
              ).includes(
                evidenceId,
              ),
          ),
      );

    rows.push(
      `Evidence : ${evidenceId}`,
    );

    if (
      producers.length ===
      0
    ) {
      rows.push(
        "  AUCUNE ACTION PRODUCTRICE",
      );

      continue;
    }

    for (
      const action
      of producers
    ) {

      const options =
        (action.options ?? [])
          .filter(
            (option: any) =>
              (
                option.addsEvidence ??
                []
              ).includes(
                evidenceId,
              ),
          );

      for (
        const option
        of options
      ) {
        rows.push(
          [
            `  action=${action.id}`,
            `option=${option.id}`,
            `priority=${action.priority}`,
            `required=[${(
              action.requiredEvidence ??
              []
            ).join(",")}]`,
          ].join(
            " | ",
          ),
        );
      }
    }
  }
}

console.log =
  realLog;

console.log(
  "\n=== MISSING CHARGING HYPOTHESES PRODUCERS ===",
);

for (
  const row
  of rows
) {
  console.log(row);
}
