import type {
  DiagnosticAction,
} from "../../core/actionTypes";

import type {
  KnowledgePackage,
} from "../../knowledge";

import type {
  HypothesisScore,
} from "../HypothesisScorer";

export interface DomainReducerOptions {
  minimumHypothesisProbability:
    number;

  maximumActiveHypotheses:
    number;

  keepGeneralQuestions:
    boolean;
}

type ActionMetadata =
  DiagnosticAction & {
    discriminates?:
      string[];

    supportsHypotheses?:
      string[];

    rejectsHypotheses?:
      string[];
  };

const DEFAULT_OPTIONS:
  DomainReducerOptions = {
    minimumHypothesisProbability:
      0.05,

    maximumActiveHypotheses:
      4,

    keepGeneralQuestions:
      true,
  };

export class QuestionDomainReducer {
  private readonly options:
    DomainReducerOptions;

  public constructor(
    options:
      Partial<DomainReducerOptions> = {},
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  public reduce(
    actions:
      readonly DiagnosticAction[],

    knowledge:
      KnowledgePackage,

    hypotheses:
      readonly HypothesisScore[],
  ): DiagnosticAction[] {
    const activeHypothesisIds =
      new Set(
        hypotheses
          .filter(
            hypothesis =>
              hypothesis.probability >=
                this.options
                  .minimumHypothesisProbability,
          )
          .sort(
            (
              left,
              right,
            ) =>
              right.probability -
              left.probability,
          )
          .slice(
            0,
            this.options
              .maximumActiveHypotheses,
          )
          .map(
            hypothesis =>
              hypothesis.id,
          ),
      );

    if (
      activeHypothesisIds.size ===
      0
    ) {
      return [
        ...actions,
      ];
    }

    return actions.filter(
      action =>
        this.isRelevant(
          action,
          knowledge,
          activeHypothesisIds,
        ),
    );
  }

  private isRelevant(
    action:
      DiagnosticAction,

    knowledge:
      KnowledgePackage,

    activeHypothesisIds:
      ReadonlySet<string>,
  ): boolean {
    const metadata =
      action as ActionMetadata;

    const declaredHypotheses =
      new Set([
        ...(
          metadata.discriminates ??
          []
        ),

        ...(
          metadata.supportsHypotheses ??
          []
        ),

        ...(
          metadata.rejectsHypotheses ??
          []
        ),
      ]);

    if (
      declaredHypotheses.size >
      0
    ) {
      return [
        ...declaredHypotheses,
      ].some(
        hypothesisId =>
          activeHypothesisIds.has(
            hypothesisId,
          ),
      );
    }

    const producedEvidenceIds =
      new Set(
        action.options?.flatMap(
          option => [
            ...(
              option.addsEvidence ??
              []
            ),

            ...(
              option.rejectsEvidence ??
              []
            ),
          ],
        ) ?? [],
      );

    if (
      producedEvidenceIds.size ===
      0
    ) {
      return this.options
        .keepGeneralQuestions;
    }

    const relatedHypothesisIds =
      new Set(
        knowledge.rules
          .filter(
            rule =>
              producedEvidenceIds.has(
                rule.evidenceId,
              ),
          )
          .map(
            rule =>
              rule.hypothesisId,
          ),
      );

    if (
      relatedHypothesisIds.size ===
      0
    ) {
      return this.options
        .keepGeneralQuestions;
    }

    return [
      ...relatedHypothesisIds,
    ].some(
      hypothesisId =>
        activeHypothesisIds.has(
          hypothesisId,
        ),
    );
  }
}

