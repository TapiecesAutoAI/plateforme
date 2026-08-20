import type {
  ConfirmationV2Candidate,
} from "./ConfirmationEngineV2";

export class QuestionRanker {

  public rank(

    candidates:
      readonly ConfirmationV2Candidate[],

  ): ConfirmationV2Candidate[] {

    return [...candidates]

      .map(

        candidate => {

          const normalizedGain =

            Math.min(
              1,
              candidate.informationGain,
            );

          const confidenceBonus =

            Math.min(
              1,
              candidate.score / 20,
            );

          const branchBonus =

            candidate.branchCompatible
              ? 1
              : 0;

          const finalScore =

            normalizedGain * 40 +

            confidenceBonus * 50 +

            branchBonus * 10;

          return {

            ...candidate,

            score:

              Number(

                finalScore.toFixed(
                  6,
                ),

              ),

          };

        },

      )

      .sort(

        (

          left,

          right,

        ) => {

          const gainDifference =

            right.informationGain -

            left.informationGain;

          if (

            gainDifference !==

            0

          ) {

            return gainDifference;

          }

          return (

            right.score -

            left.score

          );

        },

      );

  }

  public best(

    candidates:
      readonly ConfirmationV2Candidate[],

  ): ConfirmationV2Candidate | null {

    const ranked =

      this.rank(

        candidates,

      );

    return ranked[0] ?? null;

  }

}
