import type {
  ProbabilityResult,
  Question,
} from "../model";

export interface InformationGainResult {
  entropyBefore:
    number;

  entropyAfter:
    number;

  informationGain:
    number;

  normalizedGain:
    number;

  discriminationScore:
    number;

  evidenceCoverage:
    number;

  hypothesisCoverage:
    number;

  optionCoverage:
    number;

  costPenalty:
    number;

  finalScore:
    number;
}

export class InformationGainEngine {
  public evaluate(
    question:
      Question,

    probabilities:
      readonly ProbabilityResult[],
  ): InformationGainResult {
    const activeProbabilities =
      probabilities.filter(
        probability =>
          probability.probability >
          0,
      );

    const entropyBefore =
      this.computeEntropy(
        activeProbabilities.map(
          probability =>
            probability.probability,
        ),
      );

    const evidenceCoverage =
      this.computeEvidenceCoverage(
        question,
      );

    const hypothesisCoverage =
      this.computeHypothesisCoverage(
        question,
        activeProbabilities,
      );

    const optionCoverage =
      this.computeOptionCoverage(
        question,
      );

    const discriminationScore =
      this.computeDiscriminationScore(
        question,
        activeProbabilities,
      );

    const expectedReduction =
      this.computeExpectedReduction(
        entropyBefore,
        evidenceCoverage,
        hypothesisCoverage,
        optionCoverage,
        discriminationScore,
      );

    const entropyAfter =
      Math.max(
        0,
        entropyBefore -
          expectedReduction,
      );

    const informationGain =
      Math.max(
        0,
        entropyBefore -
          entropyAfter,
      );

    const normalizedGain =
      entropyBefore >
      0
        ? informationGain /
          entropyBefore
        : 0;

    const costPenalty =
      Math.max(
        0,
        question.cost,
      ) *
      0.025;

    const finalScore =
      Math.max(
        0,
        normalizedGain *
          5 +
          discriminationScore *
            3 +
          evidenceCoverage *
            0.5 +
          hypothesisCoverage *
            2 +
          optionCoverage *
            0.25 -
          costPenalty,
      );

    return {
      entropyBefore:
        this.round(
          entropyBefore,
        ),

      entropyAfter:
        this.round(
          entropyAfter,
        ),

      informationGain:
        this.round(
          informationGain,
        ),

      normalizedGain:
        this.round(
          normalizedGain,
        ),

      discriminationScore:
        this.round(
          discriminationScore,
        ),

      evidenceCoverage:
        this.round(
          evidenceCoverage,
        ),

      hypothesisCoverage:
        this.round(
          hypothesisCoverage,
        ),

      optionCoverage:
        this.round(
          optionCoverage,
        ),

      costPenalty:
        this.round(
          costPenalty,
        ),

      finalScore:
        this.round(
          finalScore,
        ),
    };
  }

  private computeEvidenceCoverage(
    question:
      Question,
  ): number {
    const evidenceIds =
      new Set<string>();

    for (
      const evidenceId
      of question.targetEvidenceIds
    ) {
      evidenceIds.add(
        evidenceId,
      );
    }

    for (
      const option
      of question.options
    ) {
      if (
        option.evidenceId
      ) {
        evidenceIds.add(
          option.evidenceId,
        );
      }
    }

    return evidenceIds.size;
  }

  private computeHypothesisCoverage(
    question:
      Question,

    probabilities:
      readonly ProbabilityResult[],
  ): number {
    if (
      probabilities.length ===
      0
    ) {
      return 0;
    }

    const targetedIds =
      new Set(
        question.targetHypothesisIds,
      );

    let coveredProbability =
      0;

    for (
      const probability
      of probabilities
    ) {
      if (
        targetedIds.has(
          probability.hypothesis.id,
        )
      ) {
        coveredProbability +=
          probability.probability;
      }
    }

    return this.clamp01(
      coveredProbability,
    );
  }

  private computeOptionCoverage(
    question:
      Question,
  ): number {
    if (
      question.options.length ===
      0
    ) {
      return 0;
    }

    const informativeOptions =
      question.options.filter(
        option =>
          option.evidenceId !==
          undefined ||
          option.value !==
          undefined,
      ).length;

    return informativeOptions /
      question.options.length;
  }

  private computeDiscriminationScore(
    question:
      Question,

    probabilities:
      readonly ProbabilityResult[],
  ): number {
    if (
      probabilities.length <
      2
    ) {
      return 0;
    }

    const targetedIds =
      new Set(
        question.targetHypothesisIds,
      );

    let targetedProbability =
      0;

    let untargetedProbability =
      0;

    for (
      const probability
      of probabilities
    ) {
      if (
        targetedIds.has(
          probability.hypothesis.id,
        )
      ) {
        targetedProbability +=
          probability.probability;
      } else {
        untargetedProbability +=
          probability.probability;
      }
    }

    if (
      targetedIds.size ===
      0
    ) {
      return this.computeEvidenceDiscrimination(
        question,
        probabilities,
      );
    }

    const balance =
      1 -
      Math.abs(
        targetedProbability -
          untargetedProbability,
      );

    return this.clamp01(
      balance,
    );
  }

  private computeEvidenceDiscrimination(
    question:
      Question,

    probabilities:
      readonly ProbabilityResult[],
  ): number {
    const evidenceIds =
      new Set<string>([
        ...question.targetEvidenceIds,

        ...question.options
          .map(
            option =>
              option.evidenceId,
          )
          .filter(
            (
              evidenceId,
            ): evidenceId is string =>
              evidenceId !==
              undefined,
          ),
      ]);

    if (
      evidenceIds.size ===
      0
    ) {
      return 0;
    }

    let affectedProbability =
      0;

    let unaffectedProbability =
      0;

    for (
      const probability
      of probabilities
    ) {
      const hypothesis =
        probability.hypothesis;

      const affected =
        hypothesis
          .supportingEvidenceIds
          .some(
            evidenceId =>
              evidenceIds.has(
                evidenceId,
              ),
          ) ||
        hypothesis
          .contradictingEvidenceIds
          .some(
            evidenceId =>
              evidenceIds.has(
                evidenceId,
              ),
          ) ||
        hypothesis
          .requiredEvidenceIds
          .some(
            evidenceId =>
              evidenceIds.has(
                evidenceId,
              ),
          );

      if (
        affected
      ) {
        affectedProbability +=
          probability.probability;
      } else {
        unaffectedProbability +=
          probability.probability;
      }
    }

    return this.clamp01(
      1 -
        Math.abs(
          affectedProbability -
            unaffectedProbability,
        ),
    );
  }

  private computeExpectedReduction(
    entropyBefore:
      number,

    evidenceCoverage:
      number,

    hypothesisCoverage:
      number,

    optionCoverage:
      number,

    discriminationScore:
      number,
  ): number {
    if (
      entropyBefore <=
      0
    ) {
      return 0;
    }

    const evidenceFactor =
      Math.min(
        1,
        evidenceCoverage *
          0.12,
      );

    const combinedFactor =
      evidenceFactor *
        0.2 +
      hypothesisCoverage *
        0.2 +
      optionCoverage *
        0.15 +
      discriminationScore *
        0.45;

    return entropyBefore *
      this.clamp(
        combinedFactor,
        0,
        0.9,
      );
  }

  private computeEntropy(
    values:
      readonly number[],
  ): number {
    let entropy =
      0;

    const total =
      values.reduce(
        (
          sum,
          value,
        ) =>
          sum +
          Math.max(
            0,
            value,
          ),
        0,
      );

    if (
      total <=
      0
    ) {
      return 0;
    }

    for (
      const value
      of values
    ) {
      const probability =
        Math.max(
          0,
          value,
        ) /
        total;

      if (
        probability <=
        0
      ) {
        continue;
      }

      entropy -=
        probability *
        Math.log2(
          probability,
        );
    }

    return entropy;
  }

  private clamp01(
    value:
      number,
  ): number {
    return this.clamp(
      value,
      0,
      1,
    );
  }

  private clamp(
    value:
      number,

    minimum:
      number,

    maximum:
      number,
  ): number {
    return Math.min(
      maximum,
      Math.max(
        minimum,
        value,
      ),
    );
  }

  private round(
    value:
      number,
  ): number {
    return Number(
      value.toFixed(
        6,
      ),
    );
  }
}
