import fs from "node:fs";

type Hypothesis = {
  id: string;
  label: string;
};

type Rule = {
  id: string;
  evidenceId: string;
  hypothesisId: string;
  effect: string;
  weight: number;
};

type ActionOption = {
  id: string;
  addsEvidence?: string[];
  rejectsEvidence?: string[];
};

type Action = {
  id: string;
  options?: ActionOption[];
};

function load<T>(
  path: string,
): T {
  return JSON.parse(
    fs.readFileSync(
      path,
      "utf8",
    ),
  ) as T;
}

const hypotheses =
  load<Hypothesis[]>(
    "./knowledge/charging/hypotheses.json",
  );

const rules =
  load<Rule[]>(
    "./knowledge/charging/rules.json",
  );

const actions =
  load<Action[]>(
    "./knowledge/charging/actions.json",
  );

const reachableEvidenceIds =
  new Set(
    actions.flatMap(
      action =>
        (action.options ?? [])
          .flatMap(
            option =>
              option.addsEvidence ?? [],
          ),
    ),
  );

console.log(
  "\n=== CHARGING ENGINE COVERAGE AUDIT ===",
);

for (
  const hypothesis
  of hypotheses
) {
  const hypothesisRules =
    rules.filter(
      rule =>
        rule.hypothesisId ===
        hypothesis.id,
    );

  const supportRules =
    hypothesisRules.filter(
      rule =>
        rule.effect ===
        "support",
    );

  const reachableSupportRules =
    supportRules.filter(
      rule =>
        reachableEvidenceIds.has(
          rule.evidenceId,
        ),
    );

  console.log("");
  console.log(
    hypothesis.id,
  );

  console.log(
    `  règles totales       : ${hypothesisRules.length}`,
  );

  console.log(
    `  règles support       : ${supportRules.length}`,
  );

  console.log(
    `  supports atteignables: ${reachableSupportRules.length}`,
  );

  if (
    reachableSupportRules.length ===
    0
  ) {
    console.log(
      "  >>> INATTEIGNABLE PAR LES QUESTIONS",
    );
  }
}