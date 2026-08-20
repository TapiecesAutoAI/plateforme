export interface DiagnosticMemoryRecord {

  sessionId:
    string;

  vin?:
    string;

  questionId:
    string;

  selectedOptionId?:
    string;

  confidence:
    number;

  roi:
    number;

  repaired:
    boolean;

  repairValidated:
    boolean;

  createdAt:
    string;

}

export interface QuestionMemoryStats {

  questionId:
    string;

  executions:
    number;

  successfulRepairs:
    number;

  failedRepairs:
    number;

  successRate:
    number;

  averageConfidence:
    number;

  averageROI:
    number;

}

export class DiagnosticMemoryEngine {

  private readonly records:
    DiagnosticMemoryRecord[] =
    [];

  public add(

    record:
      DiagnosticMemoryRecord,

  ): void {

    this.records.push(

      record,

    );

  }

  public getQuestionStatistics():

    QuestionMemoryStats[] {

    const map =
      new Map<
        string,
        DiagnosticMemoryRecord[]
      >();

    for (

      const record

      of this.records

    ) {

      const list =

        map.get(

          record.questionId,

        ) ?? [];

      list.push(

        record,

      );

      map.set(

        record.questionId,

        list,

      );

    }

    return [

      ...map.entries(),

    ].map(

      ([

        questionId,

        records,

      ]) => {

        const repaired =

          records.filter(

            record =>

              record.repaired &&

              record.repairValidated,

          );

        const failed =

          records.filter(

            record =>

              !record.repaired &&

              record.repairValidated,

          );

        return {

          questionId,

          executions:
            records.length,

          successfulRepairs:
            repaired.length,

          failedRepairs:
            failed.length,

          successRate:
            records.length === 0
              ? 0
              : Number(

                  (

                    repaired.length /

                    records.length

                  ).toFixed(

                    3,

                  ),

                ),

          averageConfidence:
            Number(

              (

                records.reduce(

                  (

                    total,

                    record,

                  ) =>

                    total +

                    record.confidence,

                  0,

                ) /

                records.length

              ).toFixed(

                2,

              ),

            ),

          averageROI:
            Number(

              (

                records.reduce(

                  (

                    total,

                    record,

                  ) =>

                    total +

                    record.roi,

                  0,

                ) /

                records.length

              ).toFixed(

                2,

              ),

            ),

        };

      },

    ).sort(

      (

        left,

        right,

      ) =>

        right.successRate -

        left.successRate,

    );

  }

}
