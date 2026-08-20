import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine: any =
  new DiagnosticEngineV2();

const parcours = [
  ["braking-main-symptom", "weak-braking"],
  ["braking-pedal-feel", "normal"],
  ["braking-pad-thickness", "worn"],
  ["braking-disc-condition", "overheated"],
  ["braking-caliper-hose-check", "hose"],
] as const;

let result: any =
  engine.createSession(
    "braking-decision-metrics-trace",
    "mecanicien-garage",
    "braking",
    [],
  );

function show(label: string) {
  const decision =
    result.reasoning?.decision;

  console.log("");
  console.log(
    "============================================================",
  );
  console.log(label);
  console.log(
    "============================================================",
  );

  console.log(
    "STATUS:",
    result.session.status,
  );

  console.log(
    "NEXT:",
    result.action?.id ?? "NONE",
  );

  console.log(
    "DECISION TYPE:",
    decision?.type ?? "NONE",
  );

  console.log(
    "METRICS:",
    decision?.metrics ?? "NONE",
  );

  const top =
    decision?.probabilities?.[0];

  console.log(
    "TOP:",
    top
      ? `${top.hypothesis.id} = ${(top.probability * 100).toFixed(4)}%`
      : "NONE",
  );

  if (top) {
    const h =
      result.reasoning.context
        .hypotheses.get(
          top.hypothesis.id,
        );

    console.log(
      "SUPPORTING IDS:",
      h?.supportingEvidenceIds ?? [],
    );

    console.log(
      "REQUIRED IDS:",
      h?.requiredEvidenceIds ?? [],
    );

    console.log(
      "SUPPORT CONFIRMED:",
      (h?.supportingEvidenceIds ?? [])
        .filter(
          (id: string) =>
            result.reasoning.context
              .confirmedEvidenceIds
              .has(id),
        ),
    );

    console.log(
      "SUPPORT REJECTED:",
      (h?.supportingEvidenceIds ?? [])
        .filter(
          (id: string) =>
            result.reasoning.context
              .rejectedEvidenceIds
              .has(id),
        ),
    );

    console.log(
      "REQUIRED CONFIRMED:",
      (h?.requiredEvidenceIds ?? [])
        .filter(
          (id: string) =>
            result.reasoning.context
              .confirmedEvidenceIds
              .has(id),
        ),
    );

    console.log(
      "REQUIRED REJECTED:",
      (h?.requiredEvidenceIds ?? [])
        .filter(
          (id: string) =>
            result.reasoning.context
              .rejectedEvidenceIds
              .has(id),
        ),
    );
  }

  console.log(
    "CONFIRMED ALL:",
    Array.from(
      result.reasoning?.context
        ?.confirmedEvidenceIds ?? [],
    ),
  );

  console.log(
    "REJECTED ALL:",
    Array.from(
      result.reasoning?.context
        ?.rejectedEvidenceIds ?? [],
    ),
  );
}

show("SESSION INITIALE");

for (
  let i = 0;
  i < parcours.length;
  i++
) {
  const [
    expectedAction,
    optionId,
  ] = parcours[i];

  if (!result.action) {
    throw new Error(
      `Aucune action avant etape ${i + 1}`,
    );
  }

  if (
    result.action.id !==
    expectedAction
  ) {
    throw new Error(
      `Etape ${i + 1}: attendu ${expectedAction}, obtenu ${result.action.id}`,
    );
  }

  const option =
    result.action.options?.find(
      (candidate: any) =>
        candidate.id === optionId,
    );

  if (!option) {
    throw new Error(
      `Option ${optionId} introuvable`,
    );
  }

  result =
    engine.answer(
      result.session,
      "braking",
      result.action.id,
      option.id,
    );

  show(
    `APRES ETAPE ${i + 1} : ${expectedAction} -> ${optionId}`,
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " FIN - AUCUNE MODIFICATION MOTEUR",
);
console.log(
  "============================================================",
);
