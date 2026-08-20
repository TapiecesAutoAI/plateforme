import {
  DecisionEngineV3,
  type DiagnosticDecision,
} from "../DecisionEngineV3";

import type {
  ReasoningProfileId,
} from "../../model";

import {
  InformationGainCalculator,
} from "../InformationGainCalculator";

import {
  QuestionCostCalculator,
} from "../QuestionCostCalculator";

import {
  DiagnosticConfidenceCalculator,
} from "../DiagnosticConfidenceCalculator";

export interface PipelineQuestion {

  id:
    string;

  diagnosticPower?:
    number;

  discriminates?:
    string[];

  estimatedTimeSeconds?:
    number;

  difficulty?:
    1 | 2 | 3 | 4 | 5;

  requiresTool?:
    boolean;

}

export interface PipelineHypothesis {

  id:
    string;

  confidence:
    number;

}

export interface PipelineInput {

  question:
    PipelineQuestion;

  hypotheses:
    PipelineHypothesis[];

  answeredQuestionCount:
    number;

  contradictionCount:
    number;

  similarCases:
    number;

  validatedRepairs:
    number;


  supportingEvidenceCount?:
    number;

  alternativeProbability?:
    number;

  profileId?:
    ReasoningProfileId;
}


export interface PipelineResult {

  decision:
    DiagnosticDecision;

  informationGain:
    number;

  questionCost:
    number;

  confidence:
    number;

}

export class ReasoningPipeline {

  private readonly gainCalculator =
    new InformationGainCalculator();

  private readonly costCalculator =
    new QuestionCostCalculator();

  private readonly confidenceCalculator =
    new DiagnosticConfidenceCalculator();

  private readonly decisionEngine =
    new DecisionEngineV3();

  public evaluate(

    input:
      PipelineInput,

  ): PipelineResult {

    const gain =
      this.gainCalculator.calculate(

        input.question,

        input.hypotheses,

      );

    const cost =
      this.costCalculator.calculate(

        input.question,

        input.answeredQuestionCount,

      );

    const bestHypothesis =

      input.hypotheses.length === 0

        ? 0

        : Math.max(

            ...input.hypotheses.map(

              hypothesis =>

                hypothesis.confidence,

            ),

          );

    const confidence =
      this.confidenceCalculator.calculate({

        hypothesisConfidence:
          bestHypothesis,

        informationGain:
          gain.normalizedGain,

        contradictionCount:
          input.contradictionCount,

        answeredQuestions:
          input.answeredQuestionCount,

        similarCases:
          input.similarCases,

        validatedRepairs:
          input.validatedRepairs,

      });

    const decision =
      this.decisionEngine.evaluate({

        questionId:
          input.question.id,

        informationGain:
          gain.normalizedGain,

        questionCost:
          cost.totalCost,

        confidence:
          confidence.confidence,

        fatigue:
          input.answeredQuestionCount,

        similarCases:
          input.similarCases,

        validatedRepairs:
          input.validatedRepairs,

        contradictionCount:
          input.contradictionCount,


        supportingEvidenceCount:
          input.supportingEvidenceCount,

        alternativeProbability:
          input.alternativeProbability,

        profileId:
          input.profileId,
      });

    return {

      decision,

      informationGain:
        gain.normalizedGain,

      questionCost:
        cost.totalCost,

      confidence:
        confidence.confidence,

    };

  }

}
