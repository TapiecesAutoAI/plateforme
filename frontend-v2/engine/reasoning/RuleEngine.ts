import type {
  DiagnosticHypothesis,
} from "../core/sessionTypes";

import type {
  KnowledgePackage,
  KnowledgeRule,
} from "../knowledge";

export type RuleEngineResult = {
  hypotheses: DiagnosticHypothesis[];

  primaryHypothesis:
    DiagnosticHypothesis | null;

  secondaryHypothesis:
    DiagnosticHypothesis | null;

  lead: number;
};

function clamp(
  value: number,
): number {
  if (!Number.isFinite(value)) {
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

function combineWeights(
  weights: number[],
): number {
  if (
    weights.length === 0
  ) {
    return 0;
  }

  const remaining =
    weights.reduce(
      (
        current,
        weight,
      ) =>
        current *
        (
          1 -
          clamp(weight)
        ),
      1,
    );

  return clamp(
    1 -
    remaining,
  );
}

function getRulesForHypothesis(
  rules: KnowledgeRule[],
  hypothesisId: string,
): KnowledgeRule[] {
  return rules.filter(
    (rule) =>
      rule.hypothesisId ===
      hypothesisId,
  );
}

export class RuleEngine {
  public evaluate(
    knowledge:
      KnowledgePackage,
    confirmedEvidenceIds:
      string[],
  ): RuleEngineResult {
    const confirmed =
      new Set(
        confirmedEvidenceIds,
      );

    const hypotheses =
      knowledge.hypotheses
        .map(
          (definition) => {
            const rules =
              getRulesForHypothesis(
                knowledge.rules,
                definition.id,
              );

            const supportingRules =
              rules.filter(
                (rule) =>
                  rule.effect ===
                    "support" &&
                  confirmed.has(
                    rule.evidenceId,
                  ),
              );

            const contradictingRules =
              rules.filter(
                (rule) =>
                  rule.effect ===
                    "contradict" &&
                  confirmed.has(
                    rule.evidenceId,
                  ),
              );

            const supportScore =
              combineWeights(
                supportingRules.map(
                  (rule) =>
                    rule.weight,
                ),
              );

            const contradictionScore =
              combineWeights(
                contradictingRules.map(
                  (rule) =>
                    rule.weight,
                ),
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

              supportingEvidenceIds:
                supportingRules.map(
                  (rule) =>
                    rule.evidenceId,
                ),

              contradictingEvidenceIds:
                contradictingRules.map(
                  (rule) =>
                    rule.evidenceId,
                ),
            };
          },
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.probability -
            first.probability,
        );

    const activeHypotheses =
      hypotheses.filter(
        (hypothesis) =>
          !hypothesis.eliminated,
      );

    const primaryHypothesis =
      activeHypotheses[0] ??
      null;

    const secondaryHypothesis =
      activeHypotheses[1] ??
      null;

    return {
      hypotheses,

      primaryHypothesis,

      secondaryHypothesis,

      lead:
        primaryHypothesis
          ? Math.max(
              0,
              primaryHypothesis
                .probability -
                (
                  secondaryHypothesis
                    ?.probability ??
                  0
                ),
            )
          : 0,
    };
  }
}
