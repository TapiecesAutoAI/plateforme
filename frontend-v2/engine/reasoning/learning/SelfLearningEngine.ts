import type {
  QuestionAnalytics,
} from "../analytics/ReasoningAnalyticsEngine";

export interface LearningRecommendation {

  questionId:
    string;

  recommendedDiagnosticPower?:
    number;

  recommendedEstimatedTimeSeconds?:
    number;

  recommendedDifficulty?:
    1 | 2 | 3 | 4 | 5;

  confidence:
    number;

  reason:
    string;

}

export class SelfLearningEngine {

  public learn(

    analytics:
      readonly QuestionAnalytics[],

  ): LearningRecommendation[] {

    const recommendations:
      LearningRecommendation[] =
      [];

    for (

      const question

      of analytics

    ) {

      let diagnosticPower:
        number | undefined;

      let estimatedTime:
        number | undefined;

      let difficulty:
        1 | 2 | 3 | 4 | 5 | undefined;

      let confidence =
        0;

      let reason =
        "";

      if (

        question.averageROI >

        3 &&

        question.averageConfidence >

        90

      ) {

        diagnosticPower =
          95;

        confidence =
          0.95;

        reason =
          "Question extrêmement discriminante.";

      }

      else if (

        question.averageROI <

        0.50

      ) {

        diagnosticPower =
          30;

        confidence =
          0.80;

        reason =
          "Question peu rentable.";

      }

      if (

        question.averageQuestionCost >

        40

      ) {

        estimatedTime =
          15;

        difficulty =
          2;

        confidence =
          Math.max(
            confidence,
            0.85,
          );

        reason =
          "Réduire le coût utilisateur.";

      }

      if (

        diagnosticPower ===
          undefined &&

        estimatedTime ===
          undefined &&

        difficulty ===
          undefined

      ) {

        continue;

      }

      recommendations.push({

        questionId:
          question.questionId,

        recommendedDiagnosticPower:
          diagnosticPower,

        recommendedEstimatedTimeSeconds:
          estimatedTime,

        recommendedDifficulty:
          difficulty,

        confidence,

        reason,

      });

    }

    return recommendations.sort(

      (

        left,

        right,

      ) =>

        right.confidence -

        left.confidence,

    );

  }

}
