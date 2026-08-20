import type {
  QuestionAnalytics,
} from "../analytics/ReasoningAnalyticsEngine";

export type AdvisorPriority =

  | "critical"

  | "high"

  | "medium"

  | "low";

export interface AdvisorSuggestion {

  questionId:
    string;

  priority:
    AdvisorPriority;

  title:
    string;

  reason:
    string;

  estimatedGain:
    number;

}

export class ReasoningAdvisor {

  public analyze(

    analytics:
      readonly QuestionAnalytics[],

  ): AdvisorSuggestion[] {

    const suggestions:
      AdvisorSuggestion[] =
      [];

    for (

      const question

      of analytics

    ) {

      if (

        question.averageROI <

        0.50

      ) {

        suggestions.push({

          questionId:
            question.questionId,

          priority:
            "high",

          title:
            "Question peu rentable",

          reason:
            "Le gain d'information est faible par rapport au coût.",

          estimatedGain:
            5,

        });

      }

      if (

        question.averageQuestionCost >

        40

      ) {

        suggestions.push({

          questionId:
            question.questionId,

          priority:
            "medium",

          title:
            "Réduire le coût",

          reason:
            "Question trop longue ou trop complexe.",

          estimatedGain:
            3,

        });

      }

      if (

        question.stopRate >

        0.70

      ) {

        suggestions.push({

          questionId:
            question.questionId,

          priority:
            "low",

          title:
            "Question très terminale",

          reason:
            "Elle conclut presque toujours le diagnostic.",

          estimatedGain:
            1,

        });

      }

      if (

        question.decisionSellRate >

        0.90 &&

        question.averageConfidence <

        85

      ) {

        suggestions.push({

          questionId:
            question.questionId,

          priority:
            "critical",

          title:
            "Vente trop précoce",

          reason:
            "La pièce est proposée avec une confiance insuffisante.",

          estimatedGain:
            10,

        });

      }

    }

    return suggestions.sort(

      (

        left,

        right,

      ) =>

        right.estimatedGain -

        left.estimatedGain,

    );

  }

}
