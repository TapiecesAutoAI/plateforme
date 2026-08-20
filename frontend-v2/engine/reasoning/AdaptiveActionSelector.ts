import { QuestionFilterEngine } from "./question-filter/QuestionFilterEngine";

import type {
  DiagnosticAction,
} from "../core/actionTypes";



import type {
  DiagnosticSession,
} from "../core/sessionTypes";



import type {
  KnowledgePackage,
} from "../knowledge";

import {
  RuleEngine,
} from "./RuleEngine";

export class AdaptiveActionSelector {

  private readonly questionFilter =
    new QuestionFilterEngine();

  private readonly ruleEngine =
    new RuleEngine();

  public select(
    session: DiagnosticSession,
    knowledge: KnowledgePackage,
  ): DiagnosticAction | null {
    const completed =
      new Set(
        session.completedActionIds,
      );

    const availableActions =
      knowledge.actions.filter(
        (action) => {
          if (
            action.type ===
              "complete-diagnosis" ||
            completed.has(
              action.id,
            ) ||
            !action.audiences.includes(
              session.profile,
            )
          ) {
            return false;
          }

          const confirmedEvidenceIds =
            new Set(
              session.evidence.map(
                (item) =>
                  item.id,
              ),
            );

          const requiredEvidence =
            action.requiredEvidence ??
            [];

          if (
            requiredEvidence.some(
              (evidenceId) =>
                !confirmedEvidenceIds.has(
                  evidenceId,
                ),
            )
          ) {
            return false;
          }

          const excludedEvidence =
            action.excludedByEvidence ??
            [];

          if (
            excludedEvidence.some(
              (evidenceId) =>
                confirmedEvidenceIds.has(
                  evidenceId,
                ),
            )
          ) {
            return false;
          }

          return true;
        },
      );

    const profileFilteredActions =
      this.questionFilter.filter(
        session.profile as any,
        availableActions as any,
      ) as DiagnosticAction[];

    if (
      profileFilteredActions.length ===
      0
    ) {
      return null;
    }

    const reasoning =
      this.ruleEngine.evaluate(
        knowledge,
        session.evidence.map(
          (item) =>
            item.id,
        ),
      );

    const leadingHypothesisIds =
      reasoning.hypotheses
        .filter(
          (hypothesis) =>
            !hypothesis.eliminated,
        )
        .slice(
          0,
          3,
        )
        .map(
          (hypothesis) =>
            hypothesis.id,
        );

    return (
      profileFilteredActions
        .map(
          (action) => ({
            action,

            score:
              this.scoreAction(
                action,
                knowledge,
                leadingHypothesisIds,
              ),
          }),
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.score -
            first.score,
        )[0]?.action ??
      null
    );
  }

  private scoreAction(
    action: DiagnosticAction,
    knowledge: KnowledgePackage,
    leadingHypothesisIds: string[],
  ): number {
    const producedEvidenceIds =
      new Set(
        action.options?.flatMap(
          (option) => [
            ...(option.addsEvidence ??
              []),

            ...(option.rejectsEvidence ??
              []),
          ],
        ) ?? [],
      );

    let score =
      1 /
      (
        1 +
        Math.max(
          action.priority,
          0,
        )
      );

    for (
      const rule
      of knowledge.rules
    ) {
      if (
        ![
          rule.evidenceId,
          ...(rule.evidenceIds ?? []),
        ].some(
          evidenceId =>
            producedEvidenceIds.has(
              evidenceId,
            ),
        )
      ) {
        continue;
      }

      const hypothesisBonus =
        leadingHypothesisIds.includes(
          rule.hypothesisId,
        )
          ? 1.5
          : 1;

      score +=
        Math.abs(
          rule.weight,
        ) *
        hypothesisBonus;
    }

    return score;
  }
}





