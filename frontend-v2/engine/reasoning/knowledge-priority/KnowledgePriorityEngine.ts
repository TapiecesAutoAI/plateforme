import type {
  GrowthSuggestion,
} from "../knowledge-growth/KnowledgeGrowthEngine";

export interface PrioritizedKnowledgeTask {

  target:
    string;

  score:
    number;

  urgency:
    "critical"
    | "high"
    | "medium"
    | "low";

  estimatedHours:
    number;

  expectedConfidenceGain:
    number;

}

export class KnowledgePriorityEngine {

  public prioritize(

    suggestions:
      readonly GrowthSuggestion[],

  ): PrioritizedKnowledgeTask[] {

    return suggestions

      .map(

        suggestion => {

          const urgencyWeight =

            suggestion.priority === "critical"
              ? 100
              : suggestion.priority === "high"
              ? 75
              : suggestion.priority === "medium"
              ? 50
              : 25;

          const score =
            Math.round(

              urgencyWeight *

              0.60 +

              suggestion.expectedImpact *

              4,

            );

          return {

            target:
              suggestion.target,

            score,

            urgency:
              suggestion.priority,

            estimatedHours:
              Math.max(

                1,

                Math.round(

                  suggestion.expectedImpact /

                  2,

                ),

              ),

            expectedConfidenceGain:
              suggestion.expectedImpact,

          };

        },

      )

      .sort(

        (

          left,

          right,

        ) =>

          right.score -

          left.score,

      );

  }

}
