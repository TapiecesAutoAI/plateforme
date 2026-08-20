import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine =
  new DiagnosticEngineV2();

function printState(
  label: string,
  result: any,
) {

  console.log("");
  console.log(
    "============================================================",
  );
  console.log(label);
  console.log(
    "============================================================",
  );

  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ?? [];

  for (
    const row
    of probabilities.slice(0, 15)
  ) {

    const hypothesis =
      row.hypothesis ?? {};

    const evidence =
      result.session.evidence ?? [];

    const confirmedIds =
      new Set(
        evidence.map(
          (e: any) => e.id,
        ),
      );

    const supportingIds =
      hypothesis.supportingEvidenceIds ??
      [];

    const confirmedSupport =
      supportingIds.filter(
        (id: string) =>
          confirmedIds.has(id),
      );

    console.log(
      [
        `ID=${hypothesis.id ?? "NONE"}`,
        `BASE=${hypothesis.baseScore ?? "N/A"}`,
        `P=${(
          (row.probability ?? 0) *
          100
        ).toFixed(6)}%`,
        `SUPPORT_TOTAL=${supportingIds.length}`,
        `SUPPORT_CONFIRMED=${confirmedSupport.length}`,
        `CONFIRMED_IDS=${confirmedSupport.join(",") || "NONE"}`,
      ].join(" | "),
    );
  }
}

let result =
  engine.createSession(
    "transmission-base-score-audit",
    "particulier",
    "transmission",
    [],
  );

printState(
  "ETAPE 0 - INITIAL",
  result,
);

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

for (
  const [actionId, optionId]
  of path
) {

  const actual =
    result.action?.id ??
    "NONE";

  if (actual !== actionId) {
    throw new Error(
      `ACTION INATTENDUE | EXPECTED=${actionId} | ACTUAL=${actual}`,
    );
  }

  result =
    engine.answer(
      structuredClone(
        result.session,
      ),
      "transmission",
      actionId,
      optionId,
    );

  printState(
    `${actionId}=${optionId}`,
    result,
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " EVIDENCE FINALE SESSION",
);
console.log(
  "============================================================",
);

console.dir(
  result.session.evidence,
  {
    depth: 10,
  },
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " REASONING FINAL COMPLET",
);
console.log(
  "============================================================",
);

console.dir(
  result.reasoning,
  {
    depth: 10,
  },
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " FIN CHAT10 BASE SCORE AUDIT",
);
console.log(
  "============================================================",
);
