export interface InformationGainBreakdown {

  hypothesisId:
    string;

  before:
    number;

  after:
    number;

  gain:
    number;

}

export interface InformationGainResult {

  questionId:
    string;

  totalGain:
    number;

  normalizedGain:
    number;

  affectedHypotheses:
    InformationGainBreakdown[];

}

export interface InformationGainQuestion {

  id:
    string;

  discriminates?:
    string[];

  diagnosticPower?:
    number;

}

export interface InformationGainHypothesis {

  id:
    string;

  confidence:
    number;

}

export class InformationGainCalculator {

  public calculate(

    question:
      InformationGainQuestion,

    hypotheses:
      readonly InformationGainHypothesis[],

  ): InformationGainResult {

    const affected =
      new Set(
        question.discriminates ??
        [],
      );

    const diagnosticPower =
      Math.min(
        100,
        Math.max(
          0,
          question.diagnosticPower ??
          60,
        ),
      );

    const affectedHypotheses:
      InformationGainBreakdown[] =
      [];

    let totalGain =
      0;

    for (
      const hypothesis
      of hypotheses
    ) {

      const before =
        hypothesis.confidence;

      let after =
        before;

      if (
        affected.has(
          hypothesis.id,
        )
      ) {

        after =
          Math.min(
            100,
            before +
            diagnosticPower *
            0.35,
          );

      }
      else {

        after =
          Math.max(
            0,
            before -
            diagnosticPower *
            0.15,
          );

      }

      const gain =
        Math.abs(
          after -
          before,
        );

      totalGain +=
        gain;

      affectedHypotheses.push({

        hypothesisId:
          hypothesis.id,

        before,

        after,

        gain,

      });

    }

    const normalizedGain =
      hypotheses.length ===
      0
        ? 0
        : Number(
            (
              totalGain /
              hypotheses.length
            ).toFixed(
              2,
            ),
          );

    return {

      questionId:
        question.id,

      totalGain:
        Number(
          totalGain.toFixed(
            2,
          ),
        ),

      normalizedGain,

      affectedHypotheses,

    };

  }

}
