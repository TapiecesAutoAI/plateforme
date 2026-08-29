import type {
  DiagnosticScenario,
  DiagnosticTestProfile,
} from "./DiagnosticScenario";

import {
  STARTING_REFERENCE_SCENARIOS_V2,
} from "./StartingReferenceScenarios";

import {
  ScenarioExecutor,
} from "./ScenarioExecutor";

import {
  ScenarioValidator,
} from "./ScenarioValidator";


type ProfileConfig = {
  profile: DiagnosticTestProfile;
  maximumQuestions: number;
};


const PROFILE_CONFIGS:
  readonly ProfileConfig[] = [
    {
      profile: "particulier",
      maximumQuestions: 5,
    },
    {
      profile: "bricoleur",
      maximumQuestions: 7,
    },
    {
      profile: "vendeur-pieces-auto",
      maximumQuestions: 8,
    },
    {
      profile: "mecanicien-garage",
      maximumQuestions: 15,
    },
    {
      profile: "depanneur",
      maximumQuestions: 6,
    },
  ];


function cloneScenarioForProfile(
  scenario: DiagnosticScenario,
  config: ProfileConfig,
): DiagnosticScenario {

  return {
    ...scenario,

    id:
      `${scenario.id}__${config.profile}`,

    profile:
      config.profile,

    expectation: {
      ...scenario.expectation,

      maximumQuestions:
        config.maximumQuestions,
    },
  };
}


export function runProfileScenarioMatrix() {

  const executor =
    new ScenarioExecutor();

  const validator =
    new ScenarioValidator();

  let total =
    0;

  let pass =
    0;

  let fail =
    0;


  const profileStats =
    new Map<
      DiagnosticTestProfile,
      {
        total: number;
        pass: number;
        fail: number;
        questionTotal: number;
      }
    >();


  console.log("");
  console.log(
    "============================================================",
  );
  console.log(
    " STARTING MULTI-PROFILE MATRIX",
  );
  console.log(
    " 7 SCENARIOS x 5 PROFILS = 35 DIAGNOSTICS",
  );
  console.log(
    "============================================================",
  );


  for (
    const config
    of PROFILE_CONFIGS
  ) {

    console.log("");
    console.log(
      "------------------------------------------------------------",
    );
    console.log(
      ` PROFIL : ${config.profile.toUpperCase()}`,
    );
    console.log(
      ` MAX QUESTIONS : ${config.maximumQuestions}`,
    );
    console.log(
      "------------------------------------------------------------",
    );


    const stats = {
      total: 0,
      pass: 0,
      fail: 0,
      questionTotal: 0,
    };


    for (
      const baseScenario
      of STARTING_REFERENCE_SCENARIOS_V2
    ) {

      const scenario =
        cloneScenarioForProfile(
          baseScenario,
          config,
        );


      const execution =
        executor.execute(
          scenario,
        );


      const result =
        validator.validate(
          scenario,
          execution,
        );


      total +=
        1;

      stats.total +=
        1;

      stats.questionTotal +=
        result.questionCount;


      if (
        result.passed
      ) {

        pass +=
          1;

        stats.pass +=
          1;


        console.log(
          `PASS | ${baseScenario.id}`,
        );

      }
      else {

        fail +=
          1;

        stats.fail +=
          1;


        console.log(
          `FAIL | ${baseScenario.id}`,
        );


        for (
          const failure
          of result.failures
        ) {

          console.log(
            `  - ${failure}`,
          );

        }

      }


      console.log(
        `  Hypothese : ${result.conclusionId ?? "aucune"}`,
      );

      console.log(
        `  Confiance : ${(result.confidence * 100).toFixed(1)} %`,
      );

      console.log(
        `  Piece     : ${result.recommendedPart ?? "aucune"}`,
      );

      console.log(
        `  Questions : ${result.questionCount} / ${config.maximumQuestions}`,
      );

    }


    profileStats.set(
      config.profile,
      stats,
    );


    const profileCoverage =
      stats.total === 0
        ? 0
        : (
            stats.pass /
            stats.total
          ) *
          100;


    const averageQuestions =
      stats.total === 0
        ? 0
        : stats.questionTotal /
          stats.total;


    console.log("");

    console.log(
      ` RESULTAT ${config.profile}`,
    );

    console.log(
      ` PASS      : ${stats.pass}/${stats.total}`,
    );

    console.log(
      ` COVERAGE  : ${profileCoverage.toFixed(1)} %`,
    );

    console.log(
      ` QUESTIONS : moyenne ${averageQuestions.toFixed(2)}`,
    );

  }


  console.log("");
  console.log(
    "============================================================",
  );
  console.log(
    " SYNTHESE PAR PROFIL",
  );
  console.log(
    "============================================================",
  );


  for (
    const config
    of PROFILE_CONFIGS
  ) {

    const stats =
      profileStats.get(
        config.profile,
      );


    if (
      !stats
    ) {
      continue;
    }


    const coverage =
      stats.total === 0
        ? 0
        : (
            stats.pass /
            stats.total
          ) *
          100;


    const averageQuestions =
      stats.total === 0
        ? 0
        : stats.questionTotal /
          stats.total;


    console.log(
      [
        config.profile.padEnd(
          20,
          " ",
        ),
        `${stats.pass}/${stats.total}`.padEnd(
          8,
          " ",
        ),
        `${coverage.toFixed(1)} %`.padEnd(
          9,
          " ",
        ),
        `moy. ${averageQuestions.toFixed(2)} questions`,
      ].join(
        " | ",
      ),
    );

  }


  const globalCoverage =
    total === 0
      ? 0
      : (
          pass /
          total
        ) *
        100;


  console.log("");
  console.log(
    "============================================================",
  );

  console.log(
    `TOTAL      : ${total}`,
  );

  console.log(
    `PASS       : ${pass}`,
  );

  console.log(
    `FAIL       : ${fail}`,
  );

  console.log(
    `COVERAGE   : ${globalCoverage.toFixed(1)} %`,
  );

  console.log(
    `REGRESSION : ${fail > 0 ? "YES" : "NO"}`,
  );

  console.log(
    "============================================================",
  );


  if (
    fail > 0
  ) {

    process.exitCode =
      1;

  }


  return {
    total,
    pass,
    fail,
    coverage:
      globalCoverage,
    regression:
      fail > 0,
  };

}


runProfileScenarioMatrix();