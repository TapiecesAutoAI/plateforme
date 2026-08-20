import {
  ProbabilityResult,
  Question,
} from "../model";

export interface SimulationResult {

  optionId: string;

  confidence: number;

  eliminatedHypotheses: number;

}

export class ConfirmationSimulator {

  public simulate(

    question: Question,

    probabilities: readonly ProbabilityResult[],

  ): SimulationResult[] {

    return question.options.map(

      option => {

        const base =
          probabilities[0]?.probability ??
          0;

        const bonus =
          option.evidenceId
            ? 0.08
            : 0.03;

        return {

          optionId:
            option.id,

          confidence:
            Math.min(
              0.99,
              base + bonus,
            ),

          eliminatedHypotheses:
            Math.max(
              0,
              probabilities.length - 1,
            ),

        };

      },

    );

  }

}
