import type {
  Evidence,
  Hypothesis,
  ProbabilityResult,
  Question,
} from "../model";

import {
  EvidenceAnalyzer,
} from "./EvidenceAnalyzer";

import {
  InformationGainEngine,
} from "./InformationGainEngine";

import {
  QuestionRanker,
} from "./QuestionRanker";

import {
  QuestionFilter,
} from "./QuestionFilter";

import type {
  ConfirmationV2Candidate,
} from "./ConfirmationEngineV2";

export class QuestionPlanner {

  private readonly evidenceAnalyzer =
    new EvidenceAnalyzer();

  private readonly informationGainEngine =
    new InformationGainEngine();

  private readonly questionRanker =
    new QuestionRanker();

  private readonly questionFilter =
    new QuestionFilter();

  public plan(

    evidences:
      readonly Evidence[],

    hypotheses:
      readonly Hypothesis[],

    questions:
      readonly Question[],

    probabilities:
      readonly ProbabilityResult[],

  ): ConfirmationV2Candidate[] {

    const filteredQuestions =
      this.questionFilter.filter(
        evidences,
        questions,
        probabilities,
      );

    const analyses =
      this.evidenceAnalyzer.analyze(

        evidences,

        hypotheses,

        filteredQuestions,

        probabilities,

      );

    const evidenceScore =
      new Map<string, number>();

    for (

      const analysis

      of analyses

    ) {

      evidenceScore.set(

        analysis.evidence.id,

        analysis.totalScore,

      );

    }

    const ranked =

      filteredQuestions.map(

        question => {

          const gain =

            this
              .informationGainEngine
              .evaluate(

                question,

                probabilities,

              );

          let score =

            gain.informationGain * 5;

          for (

            const evidenceId

            of question.targetEvidenceIds

          ) {

            score +=

              evidenceScore.get(

                evidenceId,

              ) ??

              0;

          }

          for (

            const option

            of question.options

          ) {

            if (

              option.evidenceId

            ) {

              score +=

                evidenceScore.get(

                  option.evidenceId,

                ) ??

                0;

            }

          }

          const top1 =
            probabilities[0];

          const top2 =
            probabilities[1];

          let hypothesisWeight = 0;

          for (

            const hypothesisId

            of question.targetHypothesisIds

          ) {

            const probability =

              probabilities.find(

                candidate =>

                  candidate.hypothesis.id ===

                  hypothesisId,

              );

            if (

              probability

            ) {

              hypothesisWeight +=

                probability.probability;

            }

          }

          let discriminationBonus = 0;

          if (

            top1 &&
            top2

          ) {

            const targetsTop1 =

              question.targetHypothesisIds.includes(
                top1.hypothesis.id,
              );

            const targetsTop2 =

              question.targetHypothesisIds.includes(
                top2.hypothesis.id,
              );

            if (
              targetsTop1 &&
              targetsTop2
            ) {

              discriminationBonus += 6;

            }
            else if (
              targetsTop1 ||
              targetsTop2
            ) {

              discriminationBonus += 3;

            }

          }

          score +=
            hypothesisWeight * 4;

          score +=
            discriminationBonus;

          score -=
            question.cost * 0.15;

          return {

            question,

            score:

              Number(

                score.toFixed(

                  6,

                ),

              ),

            informationGain:

              gain.informationGain,

            branchCompatible:

              true,

          };

        },

      );

    return this
      .questionRanker
      .rank(

        ranked,

      );

  }

}
