import fs from "node:fs";

type Rule = {
  id: string;
  evidenceId: string;
  hypothesisId: string;
  effect: "support" | "contradict";
  weight: number;
};

type ActionOption = {
  id: string;
  addsEvidence?: string[];
};

type Action = {
  id: string;
  type: string;
  priority?: number;
  requiredEvidence?: string[];
  options?: ActionOption[];
};

const missingHypotheses = [
  "problem-alternator-connections",
  "problem-ground-circuit",
  "problem-positive-cable",
  "problem-alternator-command",
  "problem-battery-sensor",
  "problem-freewheel-pulley",
];

const rules =
  JSON.parse(
    fs.readFileSync(
      "./knowledge/charging/rules.json",
      "utf8",
    ),
  ) as Rule[];

const actions =
  JSON.parse(
    fs.readFileSync(
      "./knowledge/charging/actions.json",
      "utf8",
    ),
  ) as Action[];

console.log(
  "\n=== CHARGING MISSING HYPOTHESES AUDIT ===",
);

for (
  const hypothesisId
  of missingHypotheses
) {
  console.log("");
  console.log(
    `=== ${hypothesisId} ===`,
  );

  const supportRules =
    rules.filter(
      rule =>
        rule.hypothesisId ===
          hypothesisId &&
        rule.effect ===
          "support",
    );

  for (
    const rule
    of supportRules
  ) {
    console.log("");
    console.log(
      `Evidence : ${rule.evidenceId}`,
    );

    console.log(
      `Poids    : ${rule.weight}`,
    );

    const producers =
      actions.filter(
        action =>
          (action.options ?? [])
            .some(
              option =>
                (
                  option.addsEvidence ??
                  []
                ).includes(
                  rule.evidenceId,
                ),
            ),
      );

    if (
      producers.length ===
      0
    ) {
      console.log(
        "  >>> AUCUNE ACTION PRODUCTRICE",
      );

      continue;
    }

    for (
      const action
      of producers
    ) {
      console.log(
        [
          `  Action : ${action.id}`,
          `type=${action.type}`,
          `priority=${action.priority ?? "?"}`,
          `required=[${(action.requiredEvidence ?? []).join(", ")}]`,
        ].join(
          " | ",
        ),
      );
    }
  }
}