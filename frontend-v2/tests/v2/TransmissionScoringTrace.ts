import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

function dump(
  title: string,
  result: any,
) {
  console.log("");
  console.log(
    "============================================================",
  );
  console.log(title);
  console.log(
    "============================================================",
  );

  console.log(
    "STATUS=",
    result.session.status,
  );

  console.log(
    "COMPLETED=",
    result.completed,
  );

  console.log(
    "ACTION=",
    result.action?.id ?? "NONE",
  );

  console.log("");
  console.log("EVIDENCE:");

  console.dir(
    result.session.evidence ??
      result.session.evidences ??
      [],
    {
      depth: 10,
    },
  );

  console.log("");
  console.log("TOP PROBABILITIES:");

  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ?? [];

  for (
    const row
    of probabilities.slice(0, 10)
  ) {
    console.log(
      [
        row?.hypothesis?.id ??
          "NONE",

        `P=${(
          (row?.probability ?? 0) *
          100
        ).toFixed(4)}%`,

        `SCORE=${
          row?.score ??
          row?.rawScore ??
          "N/A"
        }`,
      ].join(" | "),
    );
  }

  console.log("");
  console.log("REASONING:");

  console.dir(
    result.reasoning,
    {
      depth: 8,
    },
  );
}

let result =
  engine.createSession(
    "transmission-scoring-trace",
    "particulier",
    "transmission",
    [],
  );

dump(
  "ETAPE 0 - INITIAL",
  result,
);

/*
 * Parcours volontairement MANUAL.
 *
 * gear-selection
 * -> manual
 * -> hard-gears
 * -> clutch disengagement yes
 * -> hydraulic soft-or-stays-down
 */

const path = [
  [
    "transmission-main-symptom",
    "gear-selection",
  ],
  [
    "transmission-type",
    "manual",
  ],
  [
    "transmission-manual-symptom",
    "hard-gears",
  ],
  [
    "transmission-clutch-disengagement",
    "yes",
  ],
  [
    "transmission-particulier-clutch-hydraulic",
    "soft-or-stays-down",
  ],
] as const;

let step = 0;

for (
  const [
    expectedAction,
    answerId,
  ]
  of path
) {
  step++;

  const actualAction =
    result.action?.id ??
    "NONE";

  console.log("");
  console.log(
    `EXPECTED_ACTION=${expectedAction}`,
  );

  console.log(
    `ACTUAL_ACTION=${actualAction}`,
  );

  if (
    actualAction !==
    expectedAction
  ) {
    throw new Error(
      [
        `ACTION INATTENDUE ETAPE ${step}`,
        `EXPECTED=${expectedAction}`,
        `ACTUAL=${actualAction}`,
      ].join(" | "),
    );
  }

  const isolated =
    structuredClone(
      result.session,
    );

  result =
    engine.answer(
      isolated,
      "transmission",
      expectedAction,
      answerId,
    );

  dump(
    `ETAPE ${step} - ${expectedAction}=${answerId}`,
    result,
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " TRACE SYNTHETIQUE",
);
console.log(
  "============================================================",
);

const evidence =
  result.session.evidence ??
  result.session.evidences ??
  [];

console.log(
  "FINAL_EVIDENCE_COUNT=",
  Array.isArray(evidence)
    ? evidence.length
    : "NON_ARRAY",
);

const probabilities =
  result.reasoning
    ?.decision
    ?.probabilities ?? [];

console.log(
  "FINAL_TOP1=",
  probabilities[0]
    ?.hypothesis
    ?.id ?? "NONE",
);

console.log(
  "FINAL_TOP1_P=",
  (
    (
      probabilities[0]
        ?.probability ?? 0
    ) * 100
  ).toFixed(4) + "%",
);

console.log(
  "FINAL_TOP2=",
  probabilities[1]
    ?.hypothesis
    ?.id ?? "NONE",
);

console.log(
  "FINAL_TOP2_P=",
  (
    (
      probabilities[1]
        ?.probability ?? 0
    ) * 100
  ).toFixed(4) + "%",
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " FIN TRACE SCORING TRANSMISSION",
);
console.log(
  "============================================================",
);
