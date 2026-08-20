import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine: any =
  new DiagnosticEngineV2();

let result: any =
  engine.createSession(
    "aged-positive-termination-trace",
    "mecanicien-garage",
    "battery",
    [],
  );

const path = [
  ["battery-main-symptom", "flat"],
  ["battery-age", "over-four"],
  ["battery-case-check", "normal"],
  ["battery-rest-voltage-known", "no"],
  ["battery-terminals-check", "good"],
  ["battery-ground-check", "good"],
  ["battery-jump-start-test", "success"],
  ["battery-restart-after-jump", "fails"],
  ["battery-post-charge-voltage-known", "yes"],
  ["battery-post-charge-voltage-value", "below-12-2"],
] as const;

function dump(
  label: string,
  current: any,
) {
  const probabilities =
    current.reasoning
      ?.decision
      ?.probabilities ??
    [];

  console.log("");
  console.log(
    "------------------------------------------------------------",
  );
  console.log(label);
  console.log(
    "------------------------------------------------------------",
  );

  console.log(
    "completed:",
    current.completed,
  );

  console.log(
    "status:",
    current.session?.status,
  );

  console.log(
    "action:",
    current.action?.id ?? "NONE",
  );

  console.log(
    "decision:",
    current.reasoning
      ?.decision
      ?.type ??
    "NONE",
  );

  console.log(
    "conclusion:",
    current.session
      ?.conclusion
      ?.diagnosisId ??
    "NONE",
  );

  console.log(
    "questions:",
    current.reasoning
      ?.context
      ?.completedQuestionIds
      ?.size ??
    0,
  );

  console.log(
    "top5:",
    probabilities
      .slice(0, 5)
      .map(
        (entry: any) => ({
          id:
            entry.hypothesis.id,

          probability:
            Number(
              (
                entry.probability * 100
              ).toFixed(4),
            ),

          support:
            entry.support,

          contradiction:
            entry.contradiction,

          score:
            entry.score,
        }),
      ),
  );
}

dump(
  "INITIAL",
  result,
);

for (
  const [expectedAction, optionId]
  of path
) {

  if (
    result.completed ||
    !result.action
  ) {
    console.log(
      "ARRET PREMATURE avant",
      expectedAction,
    );
    break;
  }

  if (
    result.action.id !==
    expectedAction
  ) {
    throw new Error(
      `Attendu ${expectedAction}, obtenu ${result.action.id}`,
    );
  }

  const option =
    result.action.options?.find(
      (candidate: any) =>
        candidate.id === optionId,
    );

  if (!option) {
    throw new Error(
      `Option ${optionId} absente pour ${expectedAction}`,
    );
  }

  result =
    engine.answer(
      result.session,
      "battery",
      result.action.id,
      option.id,
    );

  dump(
    `${expectedAction}=${optionId}`,
    result,
  );
}

console.log("");
console.log(
  "============================================================",
);
console.log(
  " APRES LE CHEMIN POSITIF",
);
console.log(
  "============================================================",
);

//
// Continuer automatiquement,
// mais sans inventer des réponses.
// On affiche simplement les prochaines étapes.
//
for (
  let i = 0;
  i < 5;
  i++
) {

  if (
    result.completed ||
    !result.action
  ) {
    break;
  }

  console.log("");
  console.log(
    `NEXT ${i + 1}:`,
    result.action.id,
  );

  console.log(
    "TYPE:",
    result.action.type,
  );

  console.log(
    "OPTIONS:",
    result.action.options
      ?.map(
        (option: any) => ({
          id:
            option.id,

          next:
            option.nextActionId,

          evidence:
            option.addsEvidence,
        }),
      ) ??
    [],
  );

  break;
}
