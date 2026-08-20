import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

import {
  buildDiagnosticAmbiguity,
} from "../../engine/reasoning/DiagnosticAmbiguity";

import {
  buildDiagnosticCoexistence,
} from "../../engine/reasoning/DiagnosticCoexistence";

import {
  buildDiagnosticCausalChain,
} from "../../engine/reasoning/DiagnosticCausalChain";

type Scenario = {
  name: string;
  domain: string;
  answers: readonly (
    readonly [string, string]
  )[];
};

type Mode =
  | "A"
  | "A_OR_B"
  | "A_PLUS_B"
  | "A_TO_B"
  | "UNRESOLVED";

const scenarios: Scenario[] = [

  // =========================================================
  // BATTERY
  // =========================================================

  {
    name:
      "BATTERY - courroie accessoire",
    domain:
      "battery",
    answers: [
      [
        "battery-main-symptom",
        "warning-light",
      ],
      [
        "battery-light-behaviour",
        "engine-running",
      ],
      [
        "battery-charging-voltage-known",
        "yes",
      ],
      [
        "battery-charging-voltage-value",
        "below-12-8",
      ],
      [
        "battery-belt-check",
        "missing",
      ],
    ],
  },

  {
    name:
      "BATTERY - ambiguite courroie / alternateur",
    domain:
      "battery",
    answers: [
      [
        "battery-main-symptom",
        "warning-light",
      ],
      [
        "battery-light-behaviour",
        "engine-running",
      ],
      [
        "battery-charging-voltage-known",
        "yes",
      ],
      [
        "battery-charging-voltage-value",
        "below-12-8",
      ],
      [
        "battery-belt-check",
        "loose",
      ],
    ],
  },

  // =========================================================
  // BRAKING
  // =========================================================

  {
    name:
      "BRAKING - parcours reel",
    domain:
      "braking",
    answers: [],
  },

  // =========================================================
  // COOLING
  // =========================================================

  {
    name:
      "COOLING - parcours reel",
    domain:
      "cooling",
    answers: [],
  },

  // =========================================================
  // STARTING
  // =========================================================

  {
    name:
      "STARTING - parcours reel",
    domain:
      "starting",
    answers: [],
  },

  // =========================================================
  // STEERING
  // =========================================================

  {
    name:
      "STEERING - parcours reel",
    domain:
      "steering",
    answers: [],
  },

  // =========================================================
  // SUSPENSION
  // =========================================================

  {
    name:
      "SUSPENSION - parcours reel",
    domain:
      "suspension",
    answers: [],
  },

  // =========================================================
  // TRANSMISSION
  // =========================================================

  {
    name:
      "TRANSMISSION - parcours reel",
    domain:
      "transmission",
    answers: [],
  },
];

function pct(
  value: number | undefined,
): string {

  return (
    (
      (value ?? 0) *
      100
    ).toFixed(2) +
    "%"
  );
}

const realLog =
  console.log;

console.log =
  () => {};

const output: string[] = [];

const counters: Record<Mode, number> = {
  A: 0,
  A_OR_B: 0,
  A_PLUS_B: 0,
  A_TO_B: 0,
  UNRESOLVED: 0,
};

for (
  const scenario
  of scenarios
) {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `four-modes-${scenario.domain}`,
      "mecanicien-garage",
      scenario.domain,
      [],
    );

  let valid =
    true;

  for (
    const [
      expectedActionId,
      optionId,
    ]
    of scenario.answers
  ) {

    if (
      !result.action ||
      result.action.id !==
        expectedActionId
    ) {

      output.push("");
      output.push(
        "============================================",
      );

      output.push(
        scenario.name,
      );

      output.push(
        "============================================",
      );

      output.push(
        "ECART PARCOURS",
      );

      output.push(
        `ATTENDU=${expectedActionId}`,
      );

      output.push(
        `OBTENU=${result.action?.id ?? "NONE"}`,
      );

      valid =
        false;

      break;
    }

    result =
      engine.answer(
        result.session,
        scenario.domain,
        expectedActionId,
        optionId,
      );
  }

  if (!valid) {
    continue;
  }

  const probabilities =
    result.reasoning
      .decision
      .probabilities;

  const evidenceIds =
    result.reasoning
      .context
      .confirmedEvidenceIds;

  const completionAdvice =
    result.completionAdvice ??
    null;

  const causal =
    buildDiagnosticCausalChain(
      result.session.status,
      probabilities,
      evidenceIds,
    );

  const coexistence =
    buildDiagnosticCoexistence(
      result.session.status,
      probabilities,
      evidenceIds,
    );

  const ambiguity =
    buildDiagnosticAmbiguity(
      result.session.status,
      probabilities,
      completionAdvice,
    );

  let mode: Mode =
    "UNRESOLVED";

  if (
    causal?.active
  ) {
    mode =
      "A_TO_B";
  }
  else if (
    coexistence?.active
  ) {
    mode =
      "A_PLUS_B";
  }
  else if (
    ambiguity?.active
  ) {
    mode =
      "A_OR_B";
  }
  else if (
    result.completed &&
    result.session.conclusion
  ) {
    mode =
      "A";
  }

  counters[mode]++;

  const top1 =
    probabilities[0];

  const top2 =
    probabilities[1];

  output.push("");
  output.push(
    "============================================",
  );

  output.push(
    scenario.name,
  );

  output.push(
    "============================================",
  );

  output.push(
    `DOMAIN=${scenario.domain}`,
  );

  output.push(
    `STATUS=${result.session.status}`,
  );

  output.push(
    `COMPLETED=${result.completed}`,
  );

  output.push(
    `NEXT=${result.action?.id ?? "NONE"}`,
  );

  output.push(
    `CONCLUSION=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
  );

  output.push("");

  output.push(
    `TOP1=${top1?.hypothesis.id ?? "NONE"} | ${pct(top1?.probability)}`,
  );

  output.push(
    `TOP2=${top2?.hypothesis.id ?? "NONE"} | ${pct(top2?.probability)}`,
  );

  output.push("");

  output.push(
    `CAUSAL=${causal?.active ? "YES" : "NO"}`,
  );

  output.push(
    `COEXISTENCE=${coexistence?.active ? "YES" : "NO"}`,
  );

  output.push(
    `AMBIGUITY=${ambiguity?.active ? "YES" : "NO"}`,
  );

  output.push("");

  output.push(
    `FINAL_MODE=${mode}`,
  );

  if (
    causal?.active
  ) {

    output.push(
      `PRIMARY=${causal.primary.hypothesisId}`,
    );

    output.push(
      `SECONDARY=${causal.secondary.hypothesisId}`,
    );

    output.push(
      `RELATION=${causal.relation.text}`,
    );

    output.push(
      `CHECK=${causal.verification.actionId ?? "NONE"}`,
    );
  }

  if (
    coexistence?.active &&
    !causal?.active
  ) {

    output.push(
      `FAULT_1=${coexistence.candidates[0]?.hypothesisId ?? "NONE"}`,
    );

    output.push(
      `FAULT_2=${coexistence.candidates[1]?.hypothesisId ?? "NONE"}`,
    );

    output.push(
      `CHECK=${coexistence.verification.actionId ?? "NONE"}`,
    );
  }

  if (
    ambiguity?.active &&
    !coexistence?.active &&
    !causal?.active
  ) {

    output.push(
      `OPTION_1=${ambiguity.candidates[0]?.hypothesisId ?? "NONE"}`,
    );

    output.push(
      `OPTION_2=${ambiguity.candidates[1]?.hypothesisId ?? "NONE"}`,
    );

    output.push(
      `CHECK=${ambiguity.finalCheck.actionId ?? "NONE"}`,
    );
  }
}

console.log =
  realLog;

console.log("");
console.log(
  "============================================================",
);

console.log(
  " DIAGNOSTIC V2 - AUDIT 4 MODES",
);

console.log(
  "============================================================",
);

for (
  const row
  of output
) {
  console.log(row);
}

console.log("");
console.log(
  "============================================================",
);

console.log(
  " DISTRIBUTION",
);

console.log(
  "============================================================",
);

console.log(
  `A       = ${counters.A}`,
);

console.log(
  `A OU B  = ${counters.A_OR_B}`,
);

console.log(
  `A + B   = ${counters.A_PLUS_B}`,
);

console.log(
  `A -> B  = ${counters.A_TO_B}`,
);

console.log(
  `NON RESOLU = ${counters.UNRESOLVED}`,
);

console.log("");
console.log(
  "============================================================",
);

console.log(
  " CONTROLE PRIORITES",
);

console.log(
  "============================================================",
);

console.log(
  "A -> B > A + B > A OU B > A",
);

console.log("");
console.log(
  "IMPORTANT : les domaines sans réponses",
);

console.log(
  "servent ici à vérifier leur état initial.",
);

console.log(
  "Le test terrain complet sera exécuté ensuite",
);

console.log(
  "avec réponses mécanicien réalistes.",
);

console.log("");
console.log(
  "============================================================",
);

console.log(
  " FIN",
);

console.log(
  "============================================================",
);