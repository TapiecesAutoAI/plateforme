import type {
  DiagnosticBrainV1,
} from "../brain/DiagnosticBrainV1";

export interface BrainMetrics {

  sessions:
    number;

  averageConfidence:
    number;

  averageTrust:
    number;

  averageQuestions:
    number;

  sellRate:
    number;

  manualReviewRate:
    number;

}

interface SessionMetric {

  confidence:
    number;

  trust:
    number;

  questions:
    number;

  sell:
    boolean;

  manual:
    boolean;

}

export class BrainMetricsEngine {

  private readonly history:
    SessionMetric[] =
    [];

  public record(

    result:
      ReturnType<
        DiagnosticBrainV1["think"]
      >,

    questionCount:
      number,

  ): void {

    this.history.push({

      confidence:
        result.confidence ?? 0,

      trust:
        result.trust
          ?.trustScore ?? 0,

      questions:
        questionCount,

      sell:
        result.guard
          ?.allowSell ?? false,

      manual:
        result.guard
          ?.requireHumanReview ??
        false,

    });

  }

  public getMetrics():

    BrainMetrics {

    if (

      this.history.length ===
      0

    ) {

      return {

        sessions: 0,

        averageConfidence: 0,

        averageTrust: 0,

        averageQuestions: 0,

        sellRate: 0,

        manualReviewRate: 0,

      };

    }

    const sessions =
      this.history.length;

    return {

      sessions,

      averageConfidence:
        Number(

          (

            this.history.reduce(

              (

                total,

                session,

              ) =>

                total +

                session.confidence,

              0,

            ) /

            sessions

          ).toFixed(

            2,

          ),

        ),

      averageTrust:
        Number(

          (

            this.history.reduce(

              (

                total,

                session,

              ) =>

                total +

                session.trust,

              0,

            ) /

            sessions

          ).toFixed(

            2,

          ),

        ),

      averageQuestions:
        Number(

          (

            this.history.reduce(

              (

                total,

                session,

              ) =>

                total +

                session.questions,

              0,

            ) /

            sessions

          ).toFixed(

            2,

          ),

        ),

      sellRate:
        Number(

          (

            this.history.filter(

              session =>

                session.sell,

            ).length /

            sessions

          ).toFixed(

            3,

          ),

        ),

      manualReviewRate:
        Number(

          (

            this.history.filter(

              session =>

                session.manual,

            ).length /

            sessions

          ).toFixed(

            3,

          ),

        ),

    };

  }

}
