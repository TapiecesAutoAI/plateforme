import type {
  DiagnosticCase,
} from "../cases/CaseSimilarityEngine";

export interface ExperienceScore {

  hypothesisId:
    string;

  confirmedRepairs:
    number;

  failedRepairs:
    number;

  successRate:
    number;

  averageConfidence:
    number;

  experienceWeight:
    number;

}

export class ExperienceEngine {

  public build(

    cases:
      readonly DiagnosticCase[],

  ): ExperienceScore[] {

    const groups =
      new Map<
        string,
        DiagnosticCase[]
      >();

    for (

      const diagnosticCase

      of cases

    ) {

      const list =

        groups.get(

          diagnosticCase.hypothesisId,

        ) ?? [];

      list.push(

        diagnosticCase,

      );

      groups.set(

        diagnosticCase.hypothesisId,

        list,

      );

    }

    return [

      ...groups.entries(),

    ]

      .map(

        ([

          hypothesisId,

          list,

        ]) => {

          const confirmed =

            list.filter(

              item =>

                item.validated &&

                item.repaired,

            );

          const failed =

            list.filter(

              item =>

                item.validated &&

                !item.repaired,

            );

          const successRate =

            confirmed.length +

            failed.length === 0

              ? 0

              : confirmed.length /

                (

                  confirmed.length +

                  failed.length

                );

          const averageConfidence =

            list.reduce(

              (

                total,

                item,

              ) =>

                total +

                item.confidence,

              0,

            ) /

            list.length;

          const experienceWeight =

            Math.min(

              100,

              Math.round(

                successRate *

                Math.log10(

                  list.length + 1,

                ) *

                50,

              ),

            );

          return {

            hypothesisId,

            confirmedRepairs:
              confirmed.length,

            failedRepairs:
              failed.length,

            successRate:
              Number(

                successRate.toFixed(

                  3,

                ),

              ),

            averageConfidence:
              Number(

                averageConfidence.toFixed(

                  2,

                ),

              ),

            experienceWeight,

          };

        },

      )

      .sort(

        (

          left,

          right,

        ) =>

          right.experienceWeight -

          left.experienceWeight,

      );

  }

}
