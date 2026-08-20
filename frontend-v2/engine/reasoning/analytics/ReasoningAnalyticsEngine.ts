import type {
  PipelineInput,
} from "../pipeline/ReasoningPipeline";

import {
  ReasoningPipeline,
} from "../pipeline/ReasoningPipeline";

export interface QuestionAnalytics {

  questionId:
    string;

  executions:
    number;

  averageConfidence:
    number;

  averageInformationGain:
    number;

  averageQuestionCost:
    number;

  averageROI:
    number;

  stopRate:
    number;

  decisionSellRate:
    number;

}

interface MutableAnalytics {

  executions:
    number;

  confidence:
    number;

  gain:
    number;

  cost:
    number;

  roi:
    number;

  stop:
    number;

  sell:
    number;

}

export class ReasoningAnalyticsEngine {

  private readonly pipeline =
    new ReasoningPipeline();

  private readonly analytics =
    new Map<
      string,
      MutableAnalytics
    >();

  public record(

    input:
      PipelineInput,

  ): void {

    const result =
      this.pipeline.evaluate(
        input,
      );

    const current =
      this.analytics.get(
        input.question.id,
      ) ?? {

        executions: 0,

        confidence: 0,

        gain: 0,

        cost: 0,

        roi: 0,

        stop: 0,

        sell: 0,

      };

    current.executions++;

    current.confidence +=
      result.confidence;

    current.gain +=
      result.informationGain;

    current.cost +=
      result.questionCost;

    current.roi +=
      result.decision.roi;

    if (
      result.decision.shouldStop
    ) {

      current.stop++;

    }

    if (
      result.decision.shouldSell
    ) {

      current.sell++;

    }

    this.analytics.set(

      input.question.id,

      current,

    );

  }

  public getReport():

    QuestionAnalytics[] {

    return [

      ...this.analytics.entries(),

    ]

      .map(

        ([

          questionId,

          value,

        ]) => ({

          questionId,

          executions:
            value.executions,

          averageConfidence:
            Number(

              (

                value.confidence /

                value.executions

              ).toFixed(

                2,

              ),

            ),

          averageInformationGain:
            Number(

              (

                value.gain /

                value.executions

              ).toFixed(

                2,

              ),

            ),

          averageQuestionCost:
            Number(

              (

                value.cost /

                value.executions

              ).toFixed(

                2,

              ),

            ),

          averageROI:
            Number(

              (

                value.roi /

                value.executions

              ).toFixed(

                2,

              ),

            ),

          stopRate:
            Number(

              (

                value.stop /

                value.executions

              ).toFixed(

                2,

              ),

            ),

          decisionSellRate:
            Number(

              (

                value.sell /

                value.executions

              ).toFixed(

                2,

              ),

            ),

        }),

      )

      .sort(

        (

          left,

          right,

        ) =>

          right.averageROI -

          left.averageROI,

      );

  }

}
