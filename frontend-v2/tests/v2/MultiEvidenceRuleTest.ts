import {
  HypothesisScorer,
} from "../../engine/reasoning/HypothesisScorer";

import type {
  KnowledgePackage,
  KnowledgeRule,
} from "../../engine/knowledge/knowledgeTypes";

const scorer =
  new HypothesisScorer();

const rule: KnowledgeRule = {
  id: "test-multi-evidence",
  evidenceId: "E1",
  evidenceIds: [
    "E2",
    "E3",
  ],
  hypothesisId: "H1",
  effect: "support",
  weight: 0.9,
};

const knowledge = {
  domain: "battery",

  hypotheses: [
    {
      id: "H1",
      label: "Hypothese test",
      description: "Test multi evidence",
      priorProbability: 0.5,
      supportingEvidenceIds: [
        "E1",
        "E2",
        "E3",
      ],
      contradictingEvidenceIds: [],
    },
    {
      id: "H2",
      label: "Hypothese controle",
      description: "Controle",
      priorProbability: 0.5,
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
    },
  ],

  rules: [
    rule,
  ],

  actions: [],
  evidences: [],
} as unknown as KnowledgePackage;

function run(
  name: string,
  evidenceIds: string[],
) {
  const result =
    scorer.score(
      knowledge,
      evidenceIds,
    );

  const h1 =
    result.find(
      item =>
        item.id === "H1",
    );

  if (!h1) {
    throw new Error(
      "H1 introuvable.",
    );
  }

  console.log(
    `${name.padEnd(18)} | ` +
    `E=[${evidenceIds.join(",")}] | ` +
    `score=${h1.score.toFixed(6)} | ` +
    `P=${(h1.probability * 100).toFixed(2)}% | ` +
    `supports=[${h1.supportingEvidenceIds.join(",")}]`,
  );

  return h1;
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " TEST AND MULTI-EVIDENCE",
);
console.log(
  "============================================================",
);

const none =
  run(
    "AUCUNE",
    [],
  );

const onlyE1 =
  run(
    "E1",
    [
      "E1",
    ],
  );

const e1e2 =
  run(
    "E1 + E2",
    [
      "E1",
      "E2",
    ],
  );

const e2e3 =
  run(
    "E2 + E3",
    [
      "E2",
      "E3",
    ],
  );

const complete =
  run(
    "E1 + E2 + E3",
    [
      "E1",
      "E2",
      "E3",
    ],
  );

console.log("");
console.log(
  "============================================================",
);
console.log(
  " ASSERTIONS",
);
console.log(
  "============================================================",
);

const baselineScore =
  none.score;

if (
  Math.abs(
    onlyE1.score -
    baselineScore,
  ) > 0.000001
) {
  throw new Error(
    "ECHEC : E1 seul active la regle.",
  );
}

if (
  Math.abs(
    e1e2.score -
    baselineScore,
  ) > 0.000001
) {
  throw new Error(
    "ECHEC : E1+E2 active la regle sans E3.",
  );
}

if (
  Math.abs(
    e2e3.score -
    baselineScore,
  ) > 0.000001
) {
  throw new Error(
    "ECHEC : E2+E3 active la regle sans E1.",
  );
}

if (
  complete.score <=
  baselineScore
) {
  throw new Error(
    "ECHEC : E1+E2+E3 n'active pas la regle.",
  );
}

if (
  !complete.supportingEvidenceIds.includes(
    "E1",
  )
) {
  throw new Error(
    "ECHEC : evidence primaire E1 absente.",
  );
}

console.log(
  "OK : E1 seul             -> inactive",
);
console.log(
  "OK : E1 + E2             -> inactive",
);
console.log(
  "OK : E2 + E3             -> inactive",
);
console.log(
  "OK : E1 + E2 + E3        -> ACTIVE",
);

console.log("");
console.log(
  "MULTI-EVIDENCE AND : VALIDE",
);
