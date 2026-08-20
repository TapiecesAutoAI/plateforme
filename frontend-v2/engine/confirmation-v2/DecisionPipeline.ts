import type {
  Evidence,
  Hypothesis,
  ProbabilityResult,
  Question,
} from "../model";

import {
  QuestionPlanner,
} from "./QuestionPlanner";

import type {
  ConfirmationV2Candidate,
} from "./ConfirmationEngineV2";

export interface DeveloperPipelineMetrics {

  hypothesisCount:
    number;

  evidenceCount:
    number;

  questionCount:
    number;

  averageScore:
    number;

  bestScore:
    number;

  informationGain:
    number;

}

export interface DecisionPipelineResult {

  rankedQuestions:
    ConfirmationV2Candidate[];

  bestQuestion:
    ConfirmationV2Candidate | null;

  metrics:
    DeveloperPipelineMetrics;

}

export class DecisionPipeline {

  private readonly planner =
    new QuestionPlanner();

  public execute(

    evidences:
      readonly Evidence[],

    questions:
      readonly Question[],

    probabilities:
      readonly ProbabilityResult[],

  ): DecisionPipelineResult {

    const hypotheses:
      readonly Hypothesis[] =

      probabilities.map(

        probability =>

          probability.hypothesis,

      );

    const rankedQuestions =

      this.planner.plan(

        evidences,

        hypotheses,

        questions,

        probabilities,

      );

    const bestQuestion =
      rankedQuestions.find(
        candidate =>
          candidate.informationGain >=
          0.01,
      ) ??
      null;

    const averageScore =

      rankedQuestions.length === 0

        ? 0

        : rankedQuestions.reduce(

            (

              total,

              candidate,

            ) =>

              total +

              candidate.score,

            0,

          ) /

          rankedQuestions.length;

    return {

      rankedQuestions,

      bestQuestion,

      metrics: {

        hypothesisCount:

          hypotheses.length,

        evidenceCount:

          evidences.length,

        questionCount:

          rankedQuestions.length,

        averageScore:

          Number(

            averageScore.toFixed(

              6,

            ),

          ),

        bestScore:

          Number(

            (

              bestQuestion?.score ??

              0

            ).toFixed(

              6,

            ),

          ),

        informationGain:

          Number(

            (

              bestQuestion?.informationGain ??

              0

            ).toFixed(

              6,

            ),

          ),

      },

    };

  }

}
