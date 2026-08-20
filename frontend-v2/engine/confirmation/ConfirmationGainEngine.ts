import {
  ProbabilityResult,
  Question,
} from "../model";

import {
  ConfirmationSimulator,
} from "./ConfirmationSimulator";

export interface ConfirmationGain {

  questionId: string;

  expectedGain: number;

  entropyBefore: number;

  entropyAfter: number;

  confidenceBefore: number;

  confidenceAfter: number;

}

export class ConfirmationGainEngine {

  private readonly simulator =
    new ConfirmationSimulator();

  public evaluate(

    question: Question,

    probabilities: readonly ProbabilityResult[],

  ): ConfirmationGain {

    const entropyBefore =
      this.computeEntropy(
        probabilities,
      );

    const confidenceBefore =
      probabilities[0]
        ?.probability ??
      0;

    const simulations =
      this.simulator.simulate(
        question,
        probabilities,
      );

    const confidenceAfter =
      simulations.reduce(
        (sum, simulation) =>
          sum +
          simulation.confidence,
        0,
      ) /
      Math.max(
        1,
        simulations.length,
      );

    const entropyAfter =
      Math.max(
        0,
        entropyBefore *
          (1 -
            (
              confidenceAfter -
              confidenceBefore
            )),
      );

    return {

      questionId:
        question.id,

      expectedGain:
        Number(
          (
            entropyBefore -
            entropyAfter
          ).toFixed(4),
        ),

      entropyBefore:
        Number(
          entropyBefore.toFixed(
            4,
          ),
        ),

      entropyAfter:
        Number(
          entropyAfter.toFixed(
            4,
          ),
        ),

      confidenceBefore:
        Number(
          (
            confidenceBefore *
            100
          ).toFixed(2),
        ),

      confidenceAfter:
        Number(
          (
            confidenceAfter *
            100
          ).toFixed(2),
        ),

    };

  }

  private computeEntropy(

    probabilities: readonly ProbabilityResult[],

  ): number {

    let entropy = 0;

    for (const probability of probabilities) {

      if (
        probability.probability <=
        0
      ) {
        continue;
      }

      entropy -=
        probability.probability *
        Math.log2(
          probability.probability,
        );

    }

    return entropy;

  }

}
