export type RepairOutcome =

  | "resolved"

  | "partially-resolved"

  | "not-resolved"

  | "not-installed";

export interface DiagnosticFeedback {

  sessionId:
    string;

  vin?:
    string;

  hypothesisId:
    string;

  partReference?:
    string;

  outcome:
    RepairOutcome;

  customerRating?:
    1 | 2 | 3 | 4 | 5;

  garageValidated:
    boolean;

  comment?:
    string;

  actualFailureId?:
    string;

  createdAt:
    string;

}

export interface FeedbackStatistics {

  total:
    number;

  resolved:
    number;

  partial:
    number;

  failed:
    number;

  pending:
    number;

  satisfaction:
    number;

}

export class FeedbackEngine {

  private readonly feedbacks:
    DiagnosticFeedback[] =
    [];

  public add(

    feedback:
      DiagnosticFeedback,

  ): void {

    this.feedbacks.push(

      feedback,

    );

  }

  public statistics():

    FeedbackStatistics {

    const total =
      this.feedbacks.length;

    const resolved =
      this.feedbacks.filter(

        item =>

          item.outcome ===

          "resolved",

      ).length;

    const partial =
      this.feedbacks.filter(

        item =>

          item.outcome ===

          "partially-resolved",

      ).length;

    const failed =
      this.feedbacks.filter(

        item =>

          item.outcome ===

          "not-resolved",

      ).length;

    const pending =
      this.feedbacks.filter(

        item =>

          item.outcome ===

          "not-installed",

      ).length;

    return {

      total,

      resolved,

      partial,

      failed,

      pending,

      satisfaction:

        total === 0

          ? 0

          : Number(

              (

                (

                  resolved +

                  partial * 0.5

                ) /

                total

              ).toFixed(

                3,

              ),

            ),

    };

  }

  public validatedFailures():

    Map<string, number> {

    const result =
      new Map<
        string,
        number
      >();

    for (

      const feedback

      of this.feedbacks

    ) {

      if (

        !feedback.garageValidated ||

        !feedback.actualFailureId

      ) {

        continue;

      }

      result.set(

        feedback.actualFailureId,

        (

          result.get(

            feedback.actualFailureId,

          ) ?? 0

        ) + 1,

      );

    }

    return result;

  }

}
