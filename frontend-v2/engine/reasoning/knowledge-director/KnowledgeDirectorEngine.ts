import type {
  ExecutionReport,
} from "../knowledge-executor/KnowledgeExecutionEngine";

import type {
  KnowledgeAuditReport,
} from "../knowledge-audit/KnowledgeAuditEngine";

import type {
  KnowledgeHealthReport,
} from "../knowledge-health/KnowledgeHealthEngine";

import type {
  KnowledgeGrowthReport,
} from "../knowledge-growth/KnowledgeGrowthEngine";

export interface KnowledgeDirectorDecision {

  globalKnowledgeScore:
    number;

  productionReady:
    boolean;

  nextMission:
    string;

  estimatedConfidenceAfterMission:
    number;

  criticalActions:
    string[];

}

export class KnowledgeDirectorEngine {

  public evaluate(

    audit:
      KnowledgeAuditReport,

    health:
      KnowledgeHealthReport,

    growth:
      KnowledgeGrowthReport,

    execution:
      ExecutionReport,

  ): KnowledgeDirectorDecision {

    const globalKnowledgeScore =
      Math.round(

        audit.score * 0.30 +

        health.score * 0.30 +

        growth.currentCoverage * 0.20 +

        execution.totalProgress * 0.20,

      );

    const criticalActions =
      growth.suggestions

        .filter(

          suggestion =>

            suggestion.priority ===
            "critical",

        )

        .slice(
          0,
          10,
        )

        .map(

          suggestion =>

            suggestion.justification,

        );

    return {

      globalKnowledgeScore,

      productionReady:
        globalKnowledgeScore >= 95,

      nextMission:

        growth.suggestions.length === 0

          ? "Continuer l'apprentissage automatique."

          : growth.suggestions[0]
              .justification,

      estimatedConfidenceAfterMission:
        Math.min(

          100,

          globalKnowledgeScore +

          growth.projectedCoverage -

          growth.currentCoverage,

        ),

      criticalActions,

    };

  }

}
