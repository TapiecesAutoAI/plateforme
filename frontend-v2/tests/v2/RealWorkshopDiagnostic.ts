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

import * as readline
  from "node:readline/promises";

import {
  stdin as input,
  stdout as output,
} from "node:process";

const DOMAIN =
  "braking";

const AUDIENCE =
  "particulier";

const rl =
  readline.createInterface({
    input,
    output,
  });

function separator(): void {

  console.log("");
  console.log(
    "============================================================",
  );
}

function percent(
  value: number | undefined,
): string {

  return (
    (
      (value ?? 0) *
      100
    ).toFixed(1) +
    "%"
  );
}

async function askOption(
  action: any,
): Promise<string> {

  separator();

  console.log(
    `ACTION : ${action.id}`,
  );

  console.log("");
  console.log(
    action.text ??
    "Question diagnostic",
  );

  const options =
    Array.isArray(
      action.options,
    )
      ? action.options
      : [];

  if (
    options.length === 0
  ) {

    throw new Error(
      `Aucune option disponible pour ${action.id}`,
    );
  }

  console.log("");

  options.forEach(
    (
      option: any,
      index: number,
    ) => {

      console.log(
        `${index + 1}. ${option.label ?? option.value ?? option.id}`,
      );

      if (
        option.value &&
        option.value !==
          option.label
      ) {

        console.log(
          `   ${option.value}`,
        );
      }
    },
  );

  console.log("");

  while (true) {

    const answer =
      (
        await rl.question(
          "Votre choix : ",
        )
      ).trim();

    const numeric =
      Number(
        answer,
      );

    if (
      Number.isInteger(
        numeric,
      ) &&
      numeric >= 1 &&
      numeric <=
        options.length
    ) {

      return String(
        options[
          numeric - 1
        ].id,
      );
    }

    /*
     * Permet aussi de saisir directement
     * l'id technique d'une option.
     */
    const direct =
      options.find(
        (option: any) =>
          String(
            option.id,
          ) === answer,
      );

    if (direct) {

      return String(
        direct.id,
      );
    }

    console.log(
      "Choix invalide. Entrez le numéro proposé.",
    );
  }
}

async function main(): Promise<void> {

  const engine =
    new DiagnosticEngineV2();

  let result =
    engine.createSession(
      `real-workshop-${Date.now()}`,
      AUDIENCE,
      DOMAIN,
      [],
    );

  const history:
    {
      actionId: string;
      optionId: string;
      question: string;
    }[] = [];

  let safetyCounter =
    0;

  while (
    !result.completed &&
    result.action &&
    safetyCounter <
      60
  ) {

    safetyCounter++;

    const action =
      result.action;

    const optionId =
      await askOption(
        action,
      );

    history.push({
      actionId:
        action.id,

      optionId,

      question:
        action.text ??
        "",
    });

    result =
      engine.answer(
        result.session,
        DOMAIN,
        action.id,
        optionId,
      );

    /*
     * On affiche l'évolution du TOP
     * après chaque réponse.
     */
    const probabilities =
      result.reasoning
        .decision
        .probabilities;

    const top1 =
      probabilities[0];

    const top2 =
      probabilities[1];

    console.log("");
    console.log(
      "ÉTAT DU RAISONNEMENT",
    );

    console.log(
      `TOP1 : ${top1?.hypothesis.name ?? top1?.hypothesis.id ?? "NONE"} = ${percent(top1?.probability)}`,
    );

    console.log(
      `TOP2 : ${top2?.hypothesis.name ?? top2?.hypothesis.id ?? "NONE"} = ${percent(top2?.probability)}`,
    );

    console.log(
      `STATUS : ${result.session.status}`,
    );

    /*
     * Manual review sans action suivante :
     * le dialogue moteur est terminé.
     */
    if (
      result.session.status ===
        "manual-review-required" &&
      !result.action
    ) {
      break;
    }
  }

  separator();

  console.log(
    " DIAGNOSTIC TERRAIN - RESULTAT",
  );

  separator();

  const probabilities =
    result.reasoning
      .decision
      .probabilities;

  const evidenceIds =
    result.reasoning
      .context
      .confirmedEvidenceIds;

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
      result.completionAdvice ??
        null,
    );

  const top1 =
    probabilities[0];

  const top2 =
    probabilities[1];

  console.log(
    `STATUS     : ${result.session.status}`,
  );

  console.log(
    `COMPLETED  : ${result.completed}`,
  );

  console.log(
    `CONCLUSION : ${result.session.conclusion?.diagnosisId ?? "NONE"}`,
  );

  console.log("");

  console.log(
    `TOP1 : ${top1?.hypothesis.id ?? "NONE"} | ${percent(top1?.probability)}`,
  );

  console.log(
    `TOP2 : ${top2?.hypothesis.id ?? "NONE"} | ${percent(top2?.probability)}`,
  );

  console.log("");

  /*
   * =========================================================
   * PRIORITE 1 : A -> B
   * =========================================================
   */

  if (
    causal?.active
  ) {

    console.log(
      "MODE FINAL : A -> B",
    );

    console.log("");
    console.log(
      "CHAINE CAUSALE DETECTEE",
    );

    console.log(
      `CAUSE PRIMAIRE   : ${causal.primary.label} (${causal.primary.probabilityPercentage}%)`,
    );

    console.log(
      `DEFAUT SECONDAIRE: ${causal.secondary.label} (${causal.secondary.probabilityPercentage}%)`,
    );

    console.log("");
    console.log(
      `RELATION : ${causal.relation.text}`,
    );

    console.log("");
    console.log(
      `CONTROLE : ${causal.verification.text}`,
    );

    console.log("");
    console.log(
      "ORDRE DE REPARATION :",
    );

    causal.repairOrder.forEach(
      (
        step,
        index,
      ) => {

        console.log(
          `${index + 1}. ${step}`,
        );
      },
    );
  }

  /*
   * =========================================================
   * PRIORITE 2 : A + B
   * =========================================================
   */

  else if (
    coexistence?.active
  ) {

    console.log(
      "MODE FINAL : A + B",
    );

    console.log("");

    for (
      const candidate
      of coexistence.candidates
    ) {

      console.log(
        `${candidate.label} : ${candidate.diagnosticWeightPercentage}%`,
      );
    }

    console.log("");
    console.log(
      `VERIFICATION : ${coexistence.verification.text}`,
    );
  }

  /*
   * =========================================================
   * PRIORITE 3 : A OU B
   * =========================================================
   */

  else if (
    ambiguity?.active
  ) {

    console.log(
      "MODE FINAL : A OU B",
    );

    console.log("");

    ambiguity.candidates.forEach(
      candidate => {

        console.log(
          `${candidate.label} : ${candidate.confidencePercentage}%`,
        );
      },
    );

    console.log("");

    console.log(
      "CONTROLE POUR TRANCHER :",
    );

    console.log(
      ambiguity.finalCheck.text ??
      "Contrôle mécanicien requis.",
    );
  }

  /*
   * =========================================================
   * PRIORITE 4 : A
   * =========================================================
   */

  else if (
    result.completed &&
    result.session.conclusion
  ) {

    console.log(
      "MODE FINAL : A",
    );

    console.log("");

    console.log(
      `PANNE : ${result.session.conclusion.diagnosisId}`,
    );

    console.log(
      `CERTITUDE TOP1 : ${percent(top1?.probability)}`,
    );
  }

  else {

    console.log(
      "MODE FINAL : NON RESOLU",
    );

    console.log("");

    console.log(
      "Le moteur ne dispose pas encore d'assez d'éléments pour conclure.",
    );
  }

  /*
   * =========================================================
   * HISTORIQUE
   * =========================================================
   */

  separator();

  console.log(
    " PARCOURS MECANICIEN",
  );

  separator();

  history.forEach(
    (
      row,
      index,
    ) => {

      console.log(
        `${index + 1}. ${row.actionId}`,
      );

      console.log(
        `   REPONSE=${row.optionId}`,
      );
    },
  );

  separator();

  console.log(
    "FIN TEST TERRAIN",
  );

  await rl.close();
}

main().catch(
  async error => {

    console.error(
      error,
    );

    await rl.close();

    process.exitCode =
      1;
  },
);