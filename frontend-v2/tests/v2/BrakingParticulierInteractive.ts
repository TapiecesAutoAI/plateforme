import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

import * as readline
  from "node:readline/promises";

import {
  stdin as input,
  stdout as output,
} from "node:process";

async function main(): Promise<void> {

  const rl =
    readline.createInterface({
      input,
      output,
    });

  try {

    const engine =
      new DiagnosticEngineV2();

    let result =
      engine.createSession(
        "braking-particulier-interactive",
        "particulier",
        "braking",
        [],
      );

    let step = 0;

    while (
      result.action &&
      !result.completed &&
      step < 20
    ) {

      step++;

      console.log("");
      console.log(
        "============================================================",
      );

      console.log(
        `ETAPE ${step}`,
      );

      console.log(
        "============================================================",
      );

      console.log("");
      console.log(
        result.action.text,
      );

      const options =
        result.action.options ?? [];

      console.log("");

      options.forEach(
        (
          option: any,
          index: number,
        ) => {

          console.log(
            `${index + 1}. ${option.label}`,
          );

          if (option.value) {

            console.log(
              `   ${option.value}`,
            );
          }
        },
      );

      console.log("");

      let selected: any =
        null;

      while (!selected) {

        const raw =
          (
            await rl.question(
              "Votre choix : ",
            )
          ).trim();

        const index =
          Number(raw) - 1;

        if (
          Number.isInteger(index) &&
          index >= 0 &&
          index < options.length
        ) {

          selected =
            options[index];
        }
        else {

          console.log(
            "Choix invalide.",
          );
        }
      }

      const currentActionId =
        result.action.id;

      result =
        engine.answer(
          result.session,
          "braking",
          currentActionId,
          selected.id,
        );

      const top =
        result.reasoning
          .decision
          .probabilities
          .slice(0, 3);

      console.log("");
      console.log(
        "--- ETAT DIAGNOSTIC ---",
      );

      for (
        const row
        of top
      ) {

        console.log(
          `${row.hypothesis.id} : ${(row.probability * 100).toFixed(1)}%`,
        );
      }

      console.log(
        `STATUS : ${result.session.status}`,
      );
    }

    console.log("");
    console.log(
      "============================================================",
    );

    console.log(
      " RESULTAT FINAL",
    );

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
      `CONCLUSION=${result.session.conclusion?.diagnosisId ?? "NONE"}`,
    );

    if (
      !result.completed &&
      !result.action
    ) {

      console.log("");
      console.log(
        "Le moteur demande une validation professionnelle.",
      );
    }
  }
  finally {

    rl.close();
  }
}

main().catch(
  error => {

    console.error(
      error,
    );

    process.exitCode = 1;
  },
);