import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

function printResult(
  title: string,
  result: any,
): void {

  console.log("");
  console.log(
    "============================================================",
  );
  console.log(title);
  console.log(
    "============================================================",
  );

  console.log(
    `STATUS=${result.session.status}`,
  );

  console.log(
    `COMPLETED=${result.completed}`,
  );

  console.log(
    `ACTION=${result.action?.id ?? "NONE"}`,
  );

  console.log(
    `ACTION_TYPE=${result.action?.type ?? "NONE"}`,
  );

  console.log(
    `ACTION_TEXT=${result.action?.text ?? "NONE"}`,
  );

  console.log(
    `CONCLUSION=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
  );

  console.log("");
  console.log("--- TOP HYPOTHESES ---");

  const probabilities =
    result.reasoning
      ?.decision
      ?.probabilities ??
    [];

  probabilities
    .slice(0, 10)
    .forEach(
      (
        row: any,
        index: number,
      ) => {

        console.log(
          `${index + 1}. ${row.hypothesis?.id ?? "NONE"} | ${((row.probability ?? 0) * 100).toFixed(2)}%`,
        );
      },
    );

  console.log("");
  console.log("--- COMPLETION ADVICE ---");

  console.dir(
    result.completionAdvice ?? null,
    {
      depth: 10,
    },
  );

  console.log("");
  console.log("--- CONTEXT ISSUES ---");

  console.dir(
    result.reasoning
      ?.contextIssues ??
      [],
    {
      depth: 10,
    },
  );

  console.log("");
  console.log("--- CONFIRMED EVIDENCE ---");

  console.dir(
    result.reasoning
      ?.context
      ?.confirmedEvidenceIds ??
      [],
    {
      depth: 10,
    },
  );

  console.log("");
  console.log("--- ANSWERS ---");

  console.dir(
    result.session
      ?.answers ??
      result.session
      ?.responses ??
      result.session
      ?.observations ??
      "NON EXPOSE",
    {
      depth: 10,
    },
  );
}

const engine =
  new DiagnosticEngineV2();

let result =
  engine.createSession(
    "braking-particulier-stop-audit",
    "particulier",
    "braking",
    [],
  );

printResult(
  "ETAPE 0 - SESSION INITIALE",
  result,
);

/*
 * Réponse 1 :
 * Le véhicule tire d'un côté.
 */
if (
  !result.action ||
  result.action.id !==
    "braking-main-symptom"
) {

  throw new Error(
    `Action initiale inattendue : ${result.action?.id ?? "NONE"}`,
  );
}

result =
  engine.answer(
    result.session,
    "braking",
    "braking-main-symptom",
    "pulling",
  );

printResult(
  "ETAPE 1 - APRES PULLING",
  result,
);

/*
 * Réponse 2 :
 * Le véhicule tire vers la gauche.
 */
if (
  !result.action ||
  result.action.id !==
    "braking-pull-direction"
) {

  throw new Error(
    `Action après pulling inattendue : ${result.action?.id ?? "NONE"}`,
  );
}

result =
  engine.answer(
    result.session,
    "braking",
    "braking-pull-direction",
    "left",
  );

printResult(
  "ETAPE 2 - APRES LEFT",
  result,
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " RECHERCHE ACTIONS FREINAGE DISPONIBLES",
);
console.log(
  "============================================================",
);

/*
 * Inspection volontaire de l'objet moteur.
 * Cela permet de voir ce qui est exposé
 * sans modifier le moteur.
 */

console.log("");
console.log("--- RESULT KEYS ---");

console.log(
  Object.keys(
    result,
  ).sort(),
);

console.log("");
console.log("--- SESSION KEYS ---");

console.log(
  Object.keys(
    result.session ?? {},
  ).sort(),
);

console.log("");
console.log("--- REASONING KEYS ---");

console.log(
  Object.keys(
    result.reasoning ?? {},
  ).sort(),
);

console.log("");
console.log(
  "============================================================",
);
console.log(
  " VERDICT",
);
console.log(
  "============================================================",
);

if (
  result.session.status ===
    "manual-review-required" &&
  !result.action
) {

  console.log(
    "ARRET PREMATURE CONFIRME",
  );

  console.log(
    "Le parcours particulier s'arrête après seulement 2 réponses.",
  );

  console.log(
    "Il faut identifier pourquoi aucune action accessible au particulier n'est sélectionnée.",
  );
}
else {

  console.log(
    "ARRET PREMATURE NON REPRODUIT",
  );

  console.log(
    `NEXT=${result.action?.id ?? "NONE"}`,
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " FIN - AUCUNE MODIFICATION",
);
console.log(
  "============================================================",
);