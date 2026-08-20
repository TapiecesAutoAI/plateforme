export interface AdaptiveQuestion {

  id:
    string;

  family?:
    string;

  diagnosticPower?:
    number;

  estimatedTimeSeconds?:
    number;

  difficulty?:
    1 | 2 | 3 | 4 | 5;

  requiresTool?:
    boolean;

  stopIfKnown?:
    boolean;

  discriminates?:
    string[];

}

export interface AdaptiveContext {

  answeredFamilies:
    string[];

  fatigue:
    number;

  audience:
    "particulier"
    | "professionnel"
    | "expert";

}

export class AdaptiveQuestionSelector {

  public select(

    questions:
      readonly AdaptiveQuestion[],

    context:
      AdaptiveContext,

  ): AdaptiveQuestion[] {

    return questions

      .filter(

        question => {

          if (

            question.stopIfKnown &&

            question.family &&

            context.answeredFamilies.includes(

              question.family,

            )

          ) {

            return false;

          }

          if (

            context.audience ===

            "particulier"

          ) {

            if (

              question.requiresTool

            ) {

              return false;

            }

            if (

              (

                question.difficulty ??

                1

              ) > 2

            ) {

              return false;

            }

          }

          return true;

        },

      )

      .sort(

        (

          left,

          right,

        ) => {

          const leftScore =

            (

              left.diagnosticPower ??

              60

            ) /

            Math.max(

              5,

              left.estimatedTimeSeconds ??

              15,

            );

          const rightScore =

            (

              right.diagnosticPower ??

              60

            ) /

            Math.max(

              5,

              right.estimatedTimeSeconds ??

              15,

            );

          return (

            rightScore -

            leftScore

          );

        },

      );

  }

}
