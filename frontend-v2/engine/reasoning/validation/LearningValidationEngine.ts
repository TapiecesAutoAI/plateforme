import type {
  LearningRecommendation,
} from "../learning/SelfLearningEngine";

export interface ValidationInput {

  minimumConfirmedRepairs:
    number;

  minimumConfidence:
    number;

}

export interface ValidationResult {

  accepted:
    LearningRecommendation[];

  rejected:
    LearningRecommendation[];

}

export class LearningValidationEngine {

  public validate(

    recommendations:
      readonly LearningRecommendation[],

    input:
      ValidationInput,

  ): ValidationResult {

    const accepted:
      LearningRecommendation[] =
      [];

    const rejected:
      LearningRecommendation[] =
      [];

    for (

      const recommendation

      of recommendations

    ) {

      if (

        recommendation.confidence <

        input.minimumConfidence

      ) {

        rejected.push(

          recommendation,

        );

        continue;

      }

      accepted.push(

        recommendation,

      );

    }

    return {

      accepted,

      rejected,

    };

  }

}
