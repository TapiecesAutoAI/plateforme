import type {
  ExperienceScore,
} from "../experience/ExperienceEngine";

import type {
  SimilarCase,
} from "../cases/CaseSimilarityEngine";

export interface HypothesisCandidate {

  hypothesisId:
    string;

  confidence:
    number;

}

export interface RankedHypothesis {

  hypothesisId:
    string;

  finalScore:
    number;

  confidence:
    number;

  experience:
    number;

  similarCases:
    number;

}

export class HypothesisRankingEngine {

  public rank(

    hypotheses:
      readonly HypothesisCandidate[],

    experience:
      readonly ExperienceScore[],

    similarCases:
      readonly SimilarCase[],

  ): RankedHypothesis[] {

    const experienceMap =
      new Map(

        experience.map(

          item => [

            item.hypothesisId,

            item,

          ],

        ),

      );

    return hypotheses

      .map(

        hypothesis => {

          const exp =

            experienceMap.get(

              hypothesis.hypothesisId,

            );

          const similar =

            similarCases.filter(

              item =>

                item.confidence >=

                hypothesis.confidence,

            );

          const similarityBonus =

            similar.length === 0

              ? 0

              : similar.reduce(

                  (

                    total,

                    item,

                  ) =>

                    total +

                    item.similarity,

                  0,

                ) /

                similar.length;

          const experienceBonus =

            exp?.experienceWeight ??

            0;

          const finalScore =

            Math.round(

              hypothesis.confidence *

              0.60 +

              experienceBonus *

              0.25 +

              similarityBonus *

              0.15,

            );

          return {

            hypothesisId:
              hypothesis.hypothesisId,

            finalScore,

            confidence:
              hypothesis.confidence,

            experience:
              experienceBonus,

            similarCases:
              similar.length,

          };

        },

      )

      .sort(

        (

          left,

          right,

        ) =>

          right.finalScore -

          left.finalScore,

      );

  }

}
