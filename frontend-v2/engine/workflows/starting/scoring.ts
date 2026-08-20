import type {
  DiagnosticEvidence,
  DiagnosticHypothesis,
} from "../../core/sessionTypes";

import {
  startingHypotheses,
  type StartingHypothesisDefinition,
  type StartingHypothesisId,
} from "./hypotheses";

import type {
  StartingEvidenceId,
} from "./evidences";

type StartingReasoningRule = {
  id: string;

  ifAll:
    StartingEvidenceId[];

  boost?:
    Partial<
      Record<
        StartingHypothesisId,
        number
      >
    >;

  reduce?:
    Partial<
      Record<
        StartingHypothesisId,
        number
      >
    >;
};

const STARTING_REASONING_RULES:
  StartingReasoningRule[] = [
    {
      id:
        "rapid-clicking-weak-battery-strong",

      ifAll: [
        "symptom-rapid-clicking",
        "observation-lights-dim-strongly",
      ],

      boost: {
        "problem-weak-battery":
          0.58,

        "problem-battery-internal-failure":
          0.34,
      },

      reduce: {
        "problem-starter":
          0.62,

        "problem-starter-solenoid":
          0.55,

        "problem-starter-drive":
          0.82,
      },
    },

    {
      id:
        "single-click-lights-dim-battery",

      ifAll: [
        "symptom-single-click",
        "observation-lights-dim-strongly",
      ],

      boost: {
        "problem-weak-battery":
          0.36,

        "problem-battery-connection":
          0.22,
      },

      reduce: {
        "problem-starter-control-circuit":
          0.32,
      },
    },

    {
      id:
        "single-click-bad-terminals",

      ifAll: [
        "symptom-single-click",
        "observation-battery-terminal-corrosion",
      ],

      boost: {
        "problem-battery-connection":
          0.62,
      },

      reduce: {
        "problem-weak-battery":
          0.18,

        "problem-starter":
          0.34,

        "problem-starter-solenoid":
          0.30,
      },
    },

    {
      id:
        "single-click-normal-lights-booster-fails",

      ifAll: [
        "symptom-single-click",
        "observation-lights-stay-normal",
        "observation-jump-start-fails",
      ],

      boost: {
        "problem-starter":
          0.52,

        "problem-starter-solenoid":
          0.34,
      },

      reduce: {
        "problem-weak-battery":
          0.82,

        "problem-battery-internal-failure":
          0.68,

        "problem-battery-connection":
          0.42,
      },
    },

    {
      id:
        "engine-cranks-no-start-primary-family",

      ifAll: [
        "symptom-engine-cranks",
      ],

      boost: {
        "problem-engine-cranks-no-start":
          0.82,
      },

      reduce: {
        "problem-starter":
          0.95,

        "problem-starter-solenoid":
          0.95,

        "problem-starter-drive":
          0.92,

        "problem-starter-control-circuit":
          0.95,

        "problem-weak-battery":
          0.92,

        "problem-battery-internal-failure":
          0.90,

        "problem-battery-connection":
          0.88,

        "problem-engine-mechanical-lock":
          0.90,
      },
    },
    {
      id:
        "starter-confirmed",

      ifAll: [
        "symptom-single-click",
        "observation-lights-stay-normal",
        "observation-jump-start-fails",
      ],

      boost: {
        "problem-starter":
          0.38,

        "problem-starter-solenoid":
          0.28,
      },

      reduce: {
        "problem-weak-battery":
          0.72,

        "problem-battery-internal-failure":
          0.58,

        "problem-battery-connection":
          0.32,
      },
    },

    {
      id:
        "weak-battery-confirmed",

      ifAll: [
        "symptom-single-click",
        "observation-lights-dim-strongly",
        "observation-jump-start-success",
      ],

      boost: {
        "problem-weak-battery":
          0.42,

        "problem-battery-internal-failure":
          0.26,
      },

      reduce: {
        "problem-starter":
          0.56,

        "problem-starter-solenoid":
          0.48,

        "problem-engine-mechanical-lock":
          0.40,
      },
    },

    {
      id:
        "battery-connection-confirmed",

      ifAll: [
        "symptom-single-click",
        "observation-battery-terminal-corrosion",
      ],

      boost: {
        "problem-battery-connection":
          0.50,
      },

      reduce: {
        "problem-starter":
          0.22,

        "problem-starter-solenoid":
          0.18,
      },
    },

    {
      id:
        "starter-drive-confirmed",

      ifAll: [
        "symptom-starter-spins-free",
      ],

      boost: {
        "problem-starter-drive":
          0.999,
      },

      reduce: {
        "problem-weak-battery":
          0.92,

        "problem-battery-internal-failure":
          0.10,

        "problem-battery-connection":
          0.15,

        "problem-starter":
          0.95,

        "problem-starter-solenoid":
          0.76,
        "problem-engine-mechanical-lock":
          0.72,
      },
    },

    {
      id:
        "possible-engine-lock",

      ifAll: [
        "symptom-single-click",
        "observation-lights-dim-strongly",
        "observation-jump-start-fails",
      ],

      boost: {
        "problem-engine-mechanical-lock":
          0.32,
      },

      reduce: {
        "problem-weak-battery":
          0.24,
      },
    },

    {
      id:
        "starter-normal-voltage",

      ifAll: [
        "symptom-single-click",
        "observation-battery-voltage-normal",
      ],

      boost: {
        "problem-starter":
          0.32,

        "problem-starter-solenoid":
          0.28,
      },

      reduce: {
        "problem-weak-battery":
          0.84,

        "problem-battery-internal-failure":
          0.50,
      },
    },

    {
      id:
        "battery-low-voltage",

      ifAll: [
        "observation-battery-voltage-low",
        "observation-lights-dim-strongly",
      ],

      boost: {
        "problem-weak-battery":
          0.45,

        "problem-battery-internal-failure":
          0.28,
      },

      reduce: {
        "problem-starter":
          0.48,

        "problem-starter-solenoid":
          0.40,
      },
    },

    {
      id:
        "starter-intermittent",

      ifAll: [
        "observation-starts-intermittently",
        "observation-jump-start-fails",
      ],

      boost: {
        "problem-starter-worn-brushes":
          0.48,

        "problem-starter":
          0.22,
      },

      reduce: {
        "problem-weak-battery":
          0.32,
      },
    },

    {
      id:
        "control-circuit-confirmed",

      ifAll: [
        "symptom-no-crank",
        "observation-starter-control-voltage-absent",
        "observation-lights-stay-normal",
      ],

      boost: {
        "problem-starter-control-circuit":
          0.48,

        "problem-starter-relay":
          0.34,
      },

      reduce: {
        "problem-weak-battery":
          0.50,

        "problem-starter-solenoid":
          0.38,
      },
    },

    {
      id:
        "engine-cranks-no-start",

      ifAll: [
        "symptom-engine-cranks",
      ],

      boost: {
        "problem-engine-cranks-no-start":
          0.65,
      },

      reduce: {
        "problem-weak-battery":
          0.96,

        "problem-battery-internal-failure":
          0.94,

        "problem-battery-connection":
          0.92,

        "problem-starter":
          0.96,

        "problem-starter-solenoid":
          0.96,

        "problem-starter-drive":
          0.90,

        "problem-starter-worn-brushes":
          0.90,

        "problem-starter-relay":
          0.92,

        "problem-starter-control-circuit":
          0.94,

        "problem-engine-mechanical-lock":
          0.98,
      },
    },
  ];

function clamp(
  value:
    number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      value,
      0.99,
    ),
  );
}

function combineIndependentWeights(
  weights:
    number[],
): number {
  if (
    weights.length ===
    0
  ) {
    return 0;
  }

  return clamp(
    1 -
      weights.reduce(
        (
          remaining,
          weight,
        ) =>
          remaining *
          (
            1 -
            clamp(
              weight,
            )
          ),
        1,
      ),
  );
}

function scoreDefinition(
  definition:
    StartingHypothesisDefinition,

  confirmedEvidenceIds:
    Set<string>,

  rejectedEvidenceIds:
    Set<string>,
): DiagnosticHypothesis {
  const supportValues:
    number[] = [];

  const contradictionValues:
    number[] = [];

  const supportingEvidenceIds:
    string[] = [];

  const contradictingEvidenceIds:
    string[] = [];

  for (
    const [
      evidenceId,
      weight,
    ]
    of Object.entries(
      definition.support,
    )
  ) {
    if (
      confirmedEvidenceIds.has(
        evidenceId,
      )
    ) {
      supportValues.push(
        weight ??
        0,
      );

      supportingEvidenceIds.push(
        evidenceId,
      );
    }

    if (
      rejectedEvidenceIds.has(
        evidenceId,
      )
    ) {
      contradictionValues.push(
        (
          weight ??
          0
        ) *
        0.75,
      );

      contradictingEvidenceIds.push(
        evidenceId,
      );
    }
  }

  for (
    const [
      evidenceId,
      weight,
    ]
    of Object.entries(
      definition.contradictions,
    )
  ) {
    if (
      confirmedEvidenceIds.has(
        evidenceId,
      )
    ) {
      contradictionValues.push(
        weight ??
        0,
      );

      contradictingEvidenceIds.push(
        evidenceId,
      );
    }
  }

  const supportScore =
    combineIndependentWeights(
      supportValues,
    );

  const contradictionScore =
    combineIndependentWeights(
      contradictionValues,
    );

  const probability =
    clamp(
      supportScore *
      (
        1 -
        contradictionScore
      ),
    );

  return {
    id:
      definition.id,

    label:
      definition.label,

    probability,

    eliminated:
      probability <=
        0.03 &&
      contradictionScore >=
        0.70,

    supportingEvidenceIds,

    contradictingEvidenceIds,
  };
}

function applyReasoningRules(
  hypotheses:
    DiagnosticHypothesis[],

  confirmedEvidenceIds:
    Set<string>,
): DiagnosticHypothesis[] {
  const activeRules =
    STARTING_REASONING_RULES.filter(
      (
        rule,
      ) =>
        rule.ifAll.every(
          (
            evidenceId,
          ) =>
            confirmedEvidenceIds.has(
              evidenceId,
            ),
        ),
    );

  if (
    activeRules.length ===
    0
  ) {
    return hypotheses;
  }

  return hypotheses.map(
    (
      hypothesis,
    ) => {
      let probability =
        hypothesis.probability;

      for (
        const rule
        of activeRules
      ) {
        const hypothesisId =
          hypothesis.id as
            StartingHypothesisId;

        const boost =
          rule.boost?.[
            hypothesisId
          ] ??
          0;

        const reduction =
          rule.reduce?.[
            hypothesisId
          ] ??
          0;

        if (
          boost >
          0
        ) {
          probability =
            probability +
            (
              1 -
              probability
            ) *
            clamp(
              boost,
            );
        }

        if (
          reduction >
          0
        ) {
          probability =
            probability *
            (
              1 -
              clamp(
                reduction,
              )
            );
        }
      }

      probability =
        clamp(
          probability,
        );

      return {
        ...hypothesis,

        probability,

        eliminated:
          hypothesis.eliminated ||
          probability <=
            0.01,
      };
    },
  );
}

export type StartingScoringResult = {
  hypotheses:
    DiagnosticHypothesis[];

  primary:
    DiagnosticHypothesis |
    null;

  secondary:
    DiagnosticHypothesis |
    null;

  lead:
    number;
};

export function scoreStartingHypotheses(
  evidence:
    DiagnosticEvidence[],

  rejectedEvidenceIds:
    string[] = [],
): StartingScoringResult {
  const confirmedEvidenceIds =
    new Set(
      evidence.map(
        (
          item,
        ) =>
          item.id,
      ),
    );

  const rejectedIds =
    new Set(
      rejectedEvidenceIds,
    );

  const baseHypotheses =
    startingHypotheses.map(
      (
        definition,
      ) =>
        scoreDefinition(
          definition,
          confirmedEvidenceIds,
          rejectedIds,
        ),
    );

  const hypotheses =
    applyReasoningRules(
      baseHypotheses,
      confirmedEvidenceIds,
    ).sort(
      (
        first,
        second,
      ) =>
        second.probability -
        first.probability,
    );

  const primary =
    hypotheses.find(
      (
        hypothesis,
      ) =>
        !hypothesis.eliminated,
    ) ??
    null;

  const secondary =
    hypotheses.find(
      (
        hypothesis,
      ) =>
        !hypothesis.eliminated &&
        hypothesis.id !==
          primary?.id,
    ) ??
    null;

  return {
    hypotheses,

    primary,

    secondary,

    lead:
      primary
        ? Math.max(
            0,
            primary.probability -
              (
                secondary
                  ?.probability ??
                0
              ),
          )
        : 0,
  };
}



