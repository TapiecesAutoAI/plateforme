import {
  ReasoningPipeline,
  type PipelineInput,
} from "../pipeline/ReasoningPipeline";

export interface SimulationQuestion {

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

export interface SimulationStep {

  question:
    SimulationQuestion;

  answeredQuestionCount:
    number;

  contradictionCount:
    number;

}

export interface SimulationResult {

  averageConfidence:
    number;

  averageInformationGain:
    number;

  averageQuestionCost:
    number;

  stopRate:
    number;

  sellRate:
    number;

  testRate:
    number;

  manualReviewRate:
    number;

}

export class ReasoningSimulationEngine {

  private readonly pipeline =
    new ReasoningPipeline();

  public run(

    steps:
      SimulationStep[],

    hypotheses:
      PipelineInput["hypotheses"],

  ): SimulationResult {

    if (
      steps.length === 0
    ) {

      return {

        averageConfidence: 0,

        averageInformationGain: 0,

        averageQuestionCost: 0,

        stopRate: 0,

        sellRate: 0,

        testRate: 0,

        manualReviewRate: 0,

      };

    }

    let confidence = 0;

    let gain = 0;

    let cost = 0;

    let stop = 0;

    let sell = 0;

    let test = 0;

    let manual = 0;

    for (
      const step
      of steps
    ) {

      const result =
        this.pipeline.evaluate({

          question:
            step.question,

          hypotheses,

          answeredQuestionCount:
            step.answeredQuestionCount,

          contradictionCount:
            step.contradictionCount,

          similarCases:
            0,

          validatedRepairs:
            0,

        });

      confidence +=
        result.confidence;

      gain +=
        result.informationGain;

      cost +=
        result.questionCost;

      if (
        result.decision.shouldStop
      ) {
        stop++;
      }

      if (
        result.decision.shouldSell
      ) {
        sell++;
      }

      if (
        result.decision.shouldTest
      ) {
        test++;
      }

      if (
        result.decision.type ===
        "manual-review"
      ) {
        manual++;
      }

    }

    return {

      averageConfidence:
        Number(
          (
            confidence /
            steps.length
          ).toFixed(
            2,
          ),
        ),

      averageInformationGain:
        Number(
          (
            gain /
            steps.length
          ).toFixed(
            2,
          ),
        ),

      averageQuestionCost:
        Number(
          (
            cost /
            steps.length
          ).toFixed(
            2,
          ),
        ),

      stopRate:
        Number(
          (
            stop /
            steps.length
          ).toFixed(
            2,
          ),
        ),

      sellRate:
        Number(
          (
            sell /
            steps.length
          ).toFixed(
            2,
          ),
        ),

      testRate:
        Number(
          (
            test /
            steps.length
          ).toFixed(
            2,
          ),
        ),

      manualReviewRate:
        Number(
          (
            manual /
            steps.length
          ).toFixed(
            2,
          ),
        ),

    };

  }

}
