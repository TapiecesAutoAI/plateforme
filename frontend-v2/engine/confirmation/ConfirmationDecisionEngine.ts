import {
  ProbabilityResult,
  Question,
} from "../model";

import {
  ConfirmationCandidate,
} from "./ConfirmationPlanner";

import {
  ConfirmationSimulator,
} from "./ConfirmationSimulator";

export class ConfirmationDecisionEngine {

  private readonly simulator =
    new ConfirmationSimulator();

  public choose(

    questions: readonly Question[],

    probabilities: readonly ProbabilityResult[],

  ): ConfirmationCandidate | null {

    let best: ConfirmationCandidate | null =
      null;

    for (const question of questions) {

      const simulations =
        this.simulator.simulate(
          question,
          probabilities,
        );

      const averageConfidence =
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

      const expectedGain =
        averageConfidence -
        (probabilities[0]?.probability ??
          0);

      const candidate: ConfirmationCandidate = {

        question,

        expectedGain,

        expectedConfidence:
          averageConfidence,

        remainingHypotheses:
          Math.max(
            1,
            probabilities.length -
              (
                simulations[0]
                  ?.eliminatedHypotheses ??
                0
              ),
          ),

      };

      if (
        best === null ||
        candidate.expectedGain >
          best.expectedGain
      ) {
        best =
          candidate;
      }

    }

    return best;

  }

}
