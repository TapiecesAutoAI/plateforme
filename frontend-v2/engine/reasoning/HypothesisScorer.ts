import type {
  KnowledgePackage,
} from "../knowledge";

export type HypothesisScore = {
  id: string;

  label: string;

  score: number;

  probability: number;

  supportingEvidenceIds: string[];

  contradictingEvidenceIds: string[];
};

type CombinationRule = {
  id: string;

  ifAll: string[];

  boost?: Record<string, number>;

  reduce?: Record<string, number>;
};

const PRIOR_SCORE =
  0.10;

const MAX_PROBABILITY =
  0.97;

const COMBINATION_RULES:
  CombinationRule[] = [
    {
      id:
        "starter-strong-pattern",

      ifAll: [
        "symptom-single-click",
        "observation-lights-stay-normal",
        "observation-jump-start-fails",
      ],

      boost: {
        "problem-starter":
          1.85,

        "problem-starter-solenoid":
          1.55,
      },

      reduce: {
        "problem-weak-battery":
          0.18,

        "problem-battery-internal-failure":
          0.30,

        "problem-battery-connection":
          0.55,
      },
    },

        {
      id:
        "single-click-strong-dim-battery-priority",

      ifAll: [
        "symptom-single-click",
        "observation-lights-dim-strongly",
      ],

      /*
       * Un clic unique peut indiquer un démarreur,
       * mais une forte chute des phares indique surtout
       * une chute de tension sous charge.
       *
       * Tant qu'un booster ou une mesure de tension
       * n'a pas confirmé le démarreur, batterie /
       * connexion restent prioritaires.
       */
      boost: {
        "problem-weak-battery":
          1.65,

        "problem-battery-internal-failure":
          1.30,

        "problem-battery-connection":
          1.40,
      },

      reduce: {
        "problem-starter":
          0.52,

        "problem-starter-solenoid":
          0.62,

        "problem-starter-control-circuit":
          0.68,

        "problem-engine-mechanical-lock":
          0.70,
      },
    },
{
      id:
        "weak-battery-strong-pattern",

      ifAll: [
        "symptom-single-click",
        "observation-lights-dim-strongly",
        "observation-jump-start-success",
      ],

      boost: {
        "problem-weak-battery":
          2.10,

        "problem-battery-internal-failure":
          1.45,
      },

      reduce: {
        "problem-starter":
          0.35,

        "problem-starter-solenoid":
          0.38,

        "problem-engine-mechanical-lock":
          0.55,
      },
    },

    {
      id:
        "battery-connection-pattern",

      ifAll: [
        "symptom-single-click",
        "observation-battery-terminal-corrosion",
      ],

      boost: {
        "problem-battery-connection":
          2.00,
      },

      reduce: {
        "problem-starter":
          0.70,

        "problem-starter-solenoid":
          0.72,
      },
    },

    {
      id:
        "starter-drive-pattern",

      ifAll: [
        "symptom-starter-spins-free",
      ],

      boost: {
        "problem-starter-drive":
          2.40,
      },

      reduce: {
        "problem-weak-battery":
          0.08,

        "problem-battery-internal-failure":
          0.10,

        "problem-battery-connection":
          0.15,

        "problem-starter-solenoid":
          0.20,

        "problem-engine-mechanical-lock":
          0.22,
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
          1.70,

        "problem-starter-solenoid":
          1.50,
      },

      reduce: {
        "problem-weak-battery":
          0.15,

        "problem-battery-internal-failure":
          0.45,
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
          1.90,

        "problem-battery-internal-failure":
          1.40,
      },

      reduce: {
        "problem-starter":
          0.45,

        "problem-starter-solenoid":
          0.50,
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
          1.80,

        "problem-starter":
          1.30,
      },

      reduce: {
        "problem-weak-battery":
          0.55,
      },
    },

    {
      id:
        "control-circuit-pattern",

      ifAll: [
        "symptom-no-crank",
        "observation-starter-control-voltage-absent",
        "observation-lights-stay-normal",
      ],

      boost: {
        "problem-starter-control-circuit":
          1.90,

        "problem-starter-relay":
          1.55,
      },

      reduce: {
        "problem-weak-battery":
          0.35,

        "problem-starter-solenoid":
          0.50,
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
          2.50,
      },

      reduce: {
        "problem-weak-battery":
          0.04,

        "problem-battery-internal-failure":
          0.05,

        "problem-battery-connection":
          0.08,

        "problem-starter":
          0.04,

        "problem-starter-solenoid":
          0.04,

        "problem-starter-drive":
          0.10,

        "problem-starter-worn-brushes":
          0.10,

        "problem-starter-relay":
          0.08,

        "problem-starter-control-circuit":
          0.06,

        "problem-engine-mechanical-lock":
          0.03,
      },
    },
  ];

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.max(
    minimum,
    Math.min(
      value,
      maximum,
    ),
  );
}

function supportMultiplier(
  weight: number,
): number {
  return (
    1 +
    clamp(
      weight,
      0,
      1,
    ) *
      2.5
  );
}

function contradictionMultiplier(
  weight: number,
): number {
  return clamp(
    1 -
      clamp(
        weight,
        0,
        1,
      ) *
        0.85,
    0.15,
    1,
  );
}

function applyCombinationRules(
  results:
    HypothesisScore[],

  confirmedEvidenceIds:
    Set<string>,
): HypothesisScore[] {
  const activeRules =
    COMBINATION_RULES.filter(
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
    return results;
  }

  return results.map(
    (
      result,
    ) => {
      let score =
        result.score;

      for (
        const rule
        of activeRules
      ) {
        const boost =
          rule.boost?.[
            result.id
          ];

        const reduction =
          rule.reduce?.[
            result.id
          ];

        if (
          boost !==
          undefined
        ) {
          score *=
            Math.max(
              boost,
              0,
            );
        }

        if (
          reduction !==
          undefined
        ) {
          score *=
            clamp(
              reduction,
              0,
              1,
            );
        }
      }

      return {
        ...result,

        score:
          Math.max(
            score,
            0,
          ),
      };
    },
  );
}

export class HypothesisScorer {
  public score(
    knowledge: KnowledgePackage,
    evidenceIds: string[],
  ): HypothesisScore[] {
    const confirmedEvidenceIds =
      new Set(
        evidenceIds,
      );

    const baseResults =
      knowledge.hypotheses.map(
        (
          hypothesis,
        ): HypothesisScore => {
          let score =
            PRIOR_SCORE;

          const supportingEvidenceIds:
            string[] = [];

          const contradictingEvidenceIds:
            string[] = [];

          const hypothesisRules =
            knowledge.rules.filter(
              (rule) =>
                rule.hypothesisId ===
                  hypothesis.id &&
                confirmedEvidenceIds.has(
                  rule.evidenceId,
                ) &&
                (
                  rule.evidenceIds === undefined ||
                  rule.evidenceIds.every(
                    evidenceId =>
                      confirmedEvidenceIds.has(
                        evidenceId,
                      ),
                  )
                ),
            );

          for (
            const rule
            of hypothesisRules
          ) {
            if (
              rule.effect ===
              "contradict"
            ) {
              score *=
                contradictionMultiplier(
                  rule.weight,
                );

              contradictingEvidenceIds.push(
                rule.evidenceId,
              );

              continue;
            }

            score *=
              supportMultiplier(
                rule.weight,
              );

            supportingEvidenceIds.push(
              rule.evidenceId,
            );
          }

          return {
            id:
              hypothesis.id,

            label:
              hypothesis.label,

            score,

            probability:
              0,

            supportingEvidenceIds,

            contradictingEvidenceIds,
          };
        },
      );

    const adjustedResults =
      applyCombinationRules(
        baseResults,
        confirmedEvidenceIds,
      );

    const totalScore =
      adjustedResults.reduce(
        (
          total,
          hypothesis,
        ) =>
          total +
          Math.max(
            hypothesis.score,
            0,
          ),
        0,
      );

    const normalized =
      adjustedResults.map(
        (
          hypothesis,
        ) => ({
          ...hypothesis,

          probability:
            totalScore >
            0
              ? hypothesis.score /
                totalScore
              : 0,
        }),
      );

    normalized.sort(
      (
        first,
        second,
      ) =>
        second.probability -
        first.probability,
    );

    if (
      normalized.length >
        1 &&
      normalized[0]
        .probability >
        MAX_PROBABILITY
    ) {
      const excess =
        normalized[0]
          .probability -
        MAX_PROBABILITY;

      normalized[0]
        .probability =
        MAX_PROBABILITY;

      const alternativesTotal =
        normalized
          .slice(
            1,
          )
          .reduce(
            (
              total,
              hypothesis,
            ) =>
              total +
              hypothesis
                .probability,
            0,
          );

      if (
        alternativesTotal >
        0
      ) {
        for (
          let index =
            1;
          index <
          normalized.length;
          index +=
          1
        ) {
          normalized[
            index
          ].probability +=
            excess *
            (
              normalized[
                index
              ].probability /
              alternativesTotal
            );
        }
      }
    }

    return normalized;
  }
}
