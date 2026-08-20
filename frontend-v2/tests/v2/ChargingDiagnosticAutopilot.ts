import {
  ChargingQuestionPlanner,
  chargingQuestions,
} from "../../engine/knowledge/charging";

import {
  createChargingKnowledgePackage,
} from "../../engine/knowledge/charging/ChargingKnowledgeAdapter";

import {
  HypothesisScorer,
} from "../../engine/reasoning/HypothesisScorer";

import type {
  UserProfile,
} from "../../engine/profiles";

type ExplorationState = {
  evidenceIds: string[];
  completedQuestionIds: string[];
  path: string[];
};

const profiles: UserProfile[] = [
  "particulier",
  "bricoleur",
  "vendeur",
  "garage",
  "depanneur",
];

const MAX_DEPTH = 20;

function canonicalKey(
  state: ExplorationState,
): string {
  return [
    [...state.evidenceIds]
      .sort()
      .join(","),
    [...state.completedQuestionIds]
      .sort()
      .join(","),
  ].join("|");
}

function runProfile(
  profile: UserProfile,
) {
  const planner =
    new ChargingQuestionPlanner();

  const scorer =
    new HypothesisScorer();

  const knowledge =
    createChargingKnowledgePackage();

  const stack: ExplorationState[] = [
    {
      evidenceIds: [],
      completedQuestionIds: [],
      path: [],
    },
  ];

  const visited =
    new Set<string>();

  let explored = 0;
  let terminals = 0;
  let anomalies = 0;
  let maxDepth = 0;

  const anomalySamples:
    string[] = [];

  while (
    stack.length >
    0
  ) {
    const state =
      stack.pop()!;

    const key =
      canonicalKey(
        state,
      );

    if (
      visited.has(
        key,
      )
    ) {
      continue;
    }

    visited.add(
      key,
    );

    explored += 1;

    maxDepth =
      Math.max(
        maxDepth,
        state.path.length,
      );

    if (
      state.path.length >=
      MAX_DEPTH
    ) {
      anomalies += 1;

      if (
        anomalySamples.length <
        10
      ) {
        anomalySamples.push(
          `Profondeur maximale atteinte : ${state.path.join(" -> ")}`,
        );
      }

      continue;
    }

    const rankedHypotheses =
      scorer.score(
        knowledge,
        state.evidenceIds,
      );

    const activeHypothesisIds =
      rankedHypotheses
        .filter(
          hypothesis =>
            hypothesis.probability >=
            0.10,
        )
        .slice(
          0,
          3,
        )
        .map(
          hypothesis =>
            hypothesis.id,
        );

    const candidate =
      planner.selectNextQuestion(
        profile,
        state.evidenceIds,
        state.completedQuestionIds,
        activeHypothesisIds,
      );

    if (
      !candidate
    ) {
      terminals += 1;
      continue;
    }

    const question =
      candidate.question;

    if (
      state.completedQuestionIds.includes(
        question.id,
      )
    ) {
      anomalies += 1;

      if (
        anomalySamples.length <
        10
      ) {
        anomalySamples.push(
          `Question répétée : ${question.id}`,
        );
      }

      continue;
    }

    if (
      question.options.length ===
      0
    ) {
      anomalies += 1;

      if (
        anomalySamples.length <
        10
      ) {
        anomalySamples.push(
          `Question sans option : ${question.id}`,
        );
      }

      continue;
    }

    for (
      const option
      of question.options
    ) {
      const evidenceIds =
        Array.from(
          new Set([
            ...state.evidenceIds,
            ...option.addsEvidenceIds,
          ]),
        );

      stack.push({
        evidenceIds,

        completedQuestionIds: [
          ...state.completedQuestionIds,
          question.id,
        ],

        path: [
          ...state.path,
          `${question.id}:${option.id}`,
        ],
      });
    }
  }

  return {
    profile,
    explored,
    terminals,
    anomalies,
    maxDepth,
    anomalySamples,
  };
}

console.log(
  "\n=== CHARGING DIAGNOSTIC AUTOPILOT ===",
);

console.log(
  `Questions métier : ${chargingQuestions.length}`,
);

let totalExplored = 0;
let totalTerminals = 0;
let totalAnomalies = 0;

for (
  const profile
  of profiles
) {
  const result =
    runProfile(
      profile,
    );

  totalExplored +=
    result.explored;

  totalTerminals +=
    result.terminals;

  totalAnomalies +=
    result.anomalies;

  console.log(
    `\n=== ${result.profile.toUpperCase()} ===`,
  );

  console.log(
    `Parcours explorés : ${result.explored}`,
  );

  console.log(
    `Parcours terminaux : ${result.terminals}`,
  );

  console.log(
    `Profondeur max : ${result.maxDepth}`,
  );

  console.log(
    `Anomalies : ${result.anomalies}`,
  );

  for (
    const anomaly
    of result.anomalySamples
  ) {
    console.log(
      `- ${anomaly}`,
    );
  }
}

console.log(
  "\n=== TOTAL CHARGING ===",
);

console.log(
  `Parcours explorés : ${totalExplored}`,
);

console.log(
  `Parcours terminaux : ${totalTerminals}`,
);

console.log(
  `Anomalies : ${totalAnomalies}`,
);

if (
  totalAnomalies >
  0
) {
  process.exitCode =
    1;
}
