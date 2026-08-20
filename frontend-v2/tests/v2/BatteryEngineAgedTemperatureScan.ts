import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

import type {
  UserProfile,
} from "../../types";

const profile: UserProfile =
  "mecanicien-garage";

const temperatures = [
  0.25,
  0.40,
  0.55,
  0.70,
  0.85,
  1.00,
];

type Choice = {
  actionId: string;
  optionId: string;
};

const basePath: Choice[] = [
  {
    actionId: "battery-main-symptom",
    optionId: "flat",
  },
  {
    actionId: "battery-age",
    optionId: "over-four",
  },
  {
    actionId: "battery-case-check",
    optionId: "normal",
  },
];

const scenarios = [
  {
    name: "NO-TEST / 12.8-13.5",
    suffix: [
      {
        actionId: "battery-rest-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-rest-voltage-value",
        optionId: "below-12-2",
      },
      {
        actionId: "battery-test-known",
        optionId: "no",
      },
      {
        actionId: "battery-charging-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-charging-voltage-value",
        optionId: "12-8-to-13-5",
      },
    ],
  },

  {
    name: "NO-TEST / 13.5-14.8",
    suffix: [
      {
        actionId: "battery-rest-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-rest-voltage-value",
        optionId: "below-12-2",
      },
      {
        actionId: "battery-test-known",
        optionId: "no",
      },
      {
        actionId: "battery-charging-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-charging-voltage-value",
        optionId: "13-5-to-14-8",
      },
    ],
  },

  {
    name: "TEST-GOOD / 12.8-13.5",
    suffix: [
      {
        actionId: "battery-rest-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-rest-voltage-value",
        optionId: "below-12-2",
      },
      {
        actionId: "battery-test-known",
        optionId: "yes",
      },
      {
        actionId: "battery-test-result",
        optionId: "good",
      },
      {
        actionId: "battery-charging-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-charging-voltage-value",
        optionId: "12-8-to-13-5",
      },
    ],
  },

  {
    name: "TEST-GOOD / 13.5-14.8",
    suffix: [
      {
        actionId: "battery-rest-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-rest-voltage-value",
        optionId: "below-12-2",
      },
      {
        actionId: "battery-test-known",
        optionId: "yes",
      },
      {
        actionId: "battery-test-result",
        optionId: "good",
      },
      {
        actionId: "battery-charging-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-charging-voltage-value",
        optionId: "13-5-to-14-8",
      },
    ],
  },

  {
    name: "TEST-GOOD / >14.8",
    suffix: [
      {
        actionId: "battery-rest-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-rest-voltage-value",
        optionId: "below-12-2",
      },
      {
        actionId: "battery-test-known",
        optionId: "yes",
      },
      {
        actionId: "battery-test-result",
        optionId: "good",
      },
      {
        actionId: "battery-charging-voltage-known",
        optionId: "yes",
      },
      {
        actionId: "battery-charging-voltage-value",
        optionId: "above-14-8",
      },
    ],
  },
];

function pct(
  value: number | undefined,
): string {
  return (
    ((value ?? 0) * 100)
      .toFixed(2)
  );
}

function getProbability(
  probabilities: any[],
  id: string,
): number {
  return (
    probabilities.find(
      item =>
        item.hypothesis?.id === id,
    )?.probability ?? 0
  );
}

const originalLog =
  console.log;

console.log = () => {};

const rows: any[] = [];

for (
  const temperature
  of temperatures
) {
  /*
   * On construit volontairement
   * une nouvelle instance pour
   * chaque température.
   *
   * Si l'option temperature
   * n'existe pas encore dans
   * DiagnosticEngineV2,
   * le cast évite de polluer
   * le typecheck du test.
   */
  const engine =
    new DiagnosticEngineV2(
      {
        probabilityTemperature:
          temperature,
      } as any,
    );

  for (
    const scenario
    of scenarios
  ) {
    const path = [
      ...basePath,
      ...scenario.suffix,
    ];

    let result =
      engine.start(
        "battery",
        profile,
      );

    let valid = true;

    for (
      const choice
      of path
    ) {
      if (
        result.completed ||
        !result.action
      ) {
        valid = false;
        break;
      }

      if (
        result.action.id !==
        choice.actionId
      ) {
        valid = false;
        break;
      }

      result =
        engine.answer(
          result.session,
          "battery",
          choice.actionId,
          choice.optionId,
        );
    }

    if (!valid) {
      rows.push({
        Temperature:
          temperature.toFixed(2),
        Scenario:
          scenario.name,
        Status:
          "PATH-MISMATCH",
        Top:
          "NONE",
        TopPct:
          "0.00",
        LeadPct:
          "0.00",
        AgedPct:
          "0.00",
        DischargedPct:
          "0.00",
        AlternatorPct:
          "0.00",
        RegulatorPct:
          "0.00",
        Next:
          result.action?.id ??
          "NONE",
      });

      continue;
    }

    const probabilities =
      result.reasoning
        .decision
        .probabilities;

    const top =
      probabilities[0];

    const second =
      probabilities[1];

    const lead =
      Math.max(
        0,
        (
          top?.probability ??
          0
        ) -
        (
          second?.probability ??
          0
        ),
      );

    rows.push({
      Temperature:
        temperature.toFixed(2),

      Scenario:
        scenario.name,

      Status:
        result.session.status,

      Top:
        top?.hypothesis?.id ??
        "NONE",

      TopPct:
        pct(
          top?.probability,
        ),

      LeadPct:
        pct(
          lead,
        ),

      AgedPct:
        pct(
          getProbability(
            probabilities,
            "problem-aged-battery",
          ),
        ),

      DischargedPct:
        pct(
          getProbability(
            probabilities,
            "problem-discharged-battery",
          ),
        ),

      AlternatorPct:
        pct(
          getProbability(
            probabilities,
            "problem-alternator",
          ),
        ),

      RegulatorPct:
        pct(
          getProbability(
            probabilities,
            "problem-voltage-regulator",
          ),
        ),

      Next:
        result.action?.id ??
        "NONE",
    });
  }
}

console.log =
  originalLog;

console.log("");
console.log(
  "============================================================",
);

console.log(
  " BATTERY AGED - RESULTATS TEMPERATURE",
);

console.log(
  "============================================================",
);

console.log("");

console.table(rows);

console.log("");

console.log(
  "============================================================",
);

console.log(
  " RESUME PAR TEMPERATURE",
);

console.log(
  "============================================================",
);

for (
  const temperature
  of temperatures
) {
  const current =
    rows.filter(
      row =>
        row.Temperature ===
        temperature.toFixed(2),
    );

  const agedAverage =
    current.reduce(
      (
        sum,
        row,
      ) =>
        sum +
        Number(
          row.AgedPct,
        ),
      0,
    ) /
    Math.max(
      1,
      current.length,
    );

  const leadAverage =
    current.reduce(
      (
        sum,
        row,
      ) =>
        sum +
        Number(
          row.LeadPct,
        ),
      0,
    ) /
    Math.max(
      1,
      current.length,
    );

  const manualReviews =
    current.filter(
      row =>
        row.Status ===
        "manual-review-required",
    ).length;

  const pathMismatch =
    current.filter(
      row =>
        row.Status ===
        "PATH-MISMATCH",
    ).length;

  console.log(
    [
      `TEMP=${temperature.toFixed(2)}`,
      `AGED_AVG=${agedAverage.toFixed(2)}%`,
      `LEAD_AVG=${leadAverage.toFixed(2)}%`,
      `MANUAL=${manualReviews}`,
      `PATH_ERROR=${pathMismatch}`,
    ].join(" | "),
  );
}

console.log("");

console.log(
  "============================================================",
);

console.log(
  " FIN TEMPERATURE SCAN",
);

console.log(
  "============================================================",
);
