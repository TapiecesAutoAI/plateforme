import fs from "node:fs";

import {
  HypothesisScorer,
} from "../../engine/reasoning/HypothesisScorer";

import {
  KnowledgeLoader,
} from "../../engine/knowledge/KnowledgeLoader";

type Hypothesis = {
  id: string;
};

type Rule = {
  id: string;
  evidenceId: string;
  hypothesisId: string;
  effect: "support" | "contradict";
  weight: number;
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

const knowledge =
  new KnowledgeLoader().loadDomain(
    "charging",
  );

const scorer =
  new HypothesisScorer();

console.log(
  "\n=== CHARGING HYPOTHESIS DOMINANCE AUDIT ===",
);

for (
  const hypothesis
  of hypotheses
) {
  const supportEvidenceIds =
    rules
      .filter(
        rule =>
          rule.hypothesisId ===
            hypothesis.id &&
          rule.effect ===
            "support",
      )
      .map(
        rule =>
          rule.evidenceId,
      );

  const ranking =
    scorer.score(
      knowledge,
      supportEvidenceIds,
    );

  const own =
    ranking.find(
      item =>
        item.id ===
        hypothesis.id,
    );

  console.log("");
  console.log(
    hypothesis.id,
  );

  console.log(
    `  supports utilisés : ${supportEvidenceIds.length}`,
  );

  console.log(
    `  rang propre       : ${
      ranking.findIndex(
        item =>
          item.id ===
          hypothesis.id,
      ) + 1
    }`,
  );

  console.log(
    `  probabilité propre: ${
      ((own?.probability ?? 0) * 100).toFixed(2)
    } %`,
  );

  console.log(
    `  gagnant           : ${
      ranking[0]?.id ?? "aucun"
    }`,
  );

  console.log(
    `  prob gagnant      : ${
      ((ranking[0]?.probability ?? 0) * 100).toFixed(2)
    } %`,
  );
}