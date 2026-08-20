import type {
  RankedHypothesis,
} from "../ranking/HypothesisRankingEngine";

export interface PredictionResult {

  hypothesisId:
    string;

  probability:
    number;

  confidence:
    number;

  recommendation:
    "sell"
    | "verify"
    | "continue";

}

export interface PredictionSummary {

  best:
    PredictionResult;

  alternatives:
    PredictionResult[];

}

export class PredictionEngine {

  public predict(

    hypotheses:
      readonly RankedHypothesis[],

  ): PredictionSummary {

    const totalScore =
      Math.max(
        1,
        hypotheses.reduce(
          (
            total,
            hypothesis,
          ) =>
            total +
            hypothesis.finalScore,
          0,
        ),
      );

    const predictions =
      hypotheses.map(

        hypothesis => {

          const probability =
            Number(
              (
                hypothesis.finalScore /
                totalScore *
                100
              ).toFixed(
                2,
              ),
            );

          let recommendation:
            "sell"
            | "verify"
            | "continue";

          if (
            probability >= 90
          ) {

            recommendation =
              "sell";

          }
          else if (
            probability >= 70
          ) {

            recommendation =
              "verify";

          }
          else {

            recommendation =
              "continue";

          }

          return {

            hypothesisId:
              hypothesis.hypothesisId,

            probability,

            confidence:
              hypothesis.finalScore,

            recommendation,

          };

        },

      );

    return {

      best:
        predictions[0],

      alternatives:
        predictions.slice(
          1,
        ),

    };

  }

}
