import fs from "node:fs";
import path from "node:path";

type Scenario = {
  id: string;
  name: string;
  profile: "particulier";
  domain: "starting";
  initialText: string;
  answers: {
    actionId: string;
    optionId: string;
  }[];
  expected: {
    primaryHypothesisId?: string;
    primaryPartName?: string;
    purchaseDecision?: string;
    purchaseDecisionNot?: string;
    minimumConfidence?: number;
  };
};

const scenarios: Scenario[] = [
  {
    id: "battery-rapid-clicks",
    name: "Batterie - clics rapides",
    profile: "particulier",
    domain: "starting",
    initialText:
      "Ma voiture ne démarre plus. J'entends plusieurs clics rapides et les phares baissent.",
    answers: [
      {
        actionId: "starting-booster-test",
        optionId: "yes",
      },
    ],
    expected: {
      primaryHypothesisId: "problem-weak-battery",
      primaryPartName: "Batterie",
      purchaseDecision: "purchase-recommended",
      minimumConfidence: 0.85,
    },
  },

  {
    id: "starter-single-click",
    name: "Démarreur - booster inefficace",
    profile: "particulier",
    domain: "starting",
    initialText:
      "Ma voiture ne démarre plus. J'entends plusieurs clics rapides.",
    answers: [
      {
        actionId: "starting-booster-test",
        optionId: "no",
      },
      {
        actionId: "starting-check-battery-terminals",
        optionId: "good",
      },
      {
        actionId: "starting-booster-sound",
        optionId: "single-click",
      },
    ],
    expected: {
      primaryHypothesisId: "problem-starter",
      primaryPartName: "Démarreur",
      purchaseDecision: "purchase-recommended",
      minimumConfidence: 0.85,
    },
  },
];

const output = path.join(
  process.cwd(),
  "tests",
  "scenarios",
  "starting-scenarios.json",
);

fs.mkdirSync(path.dirname(output), {
  recursive: true,
});

fs.writeFileSync(
  output,
  JSON.stringify(scenarios, null, 2),
  "utf8",
);

console.log(
  `✅ ${scenarios.length} scénarios générés`,
);