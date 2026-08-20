import type {
  Evidence,
  ProbabilityResult,
} from "../model";

export interface RankedEvidence {
  evidence:
    Evidence;

  score:
    number;

  supportingHypotheses:
    number;

  contradictingHypotheses:
    number;

  requiredByHypotheses:
    number;

  affectedHypotheses:
    number;
}

export class EvidenceRanker {
  public rank(
    evidences:
      readonly Evidence[],

    probabilities:
      readonly ProbabilityResult[],
  ): RankedEvidence[] {
    const activeProbabilities =
      probabilities.filter(
        probability =>
          probability.probability >
          0.05,
      );

    return evidences
      .filter(
        evidence =>
          evidence.status ===
            "unknown" ||
          evidence.status ===
            "uncertain",
      )
      .map(
        evidence =>
          this.rankEvidence(
            evidence,
            activeProbabilities,
          ),
      )
      .filter(
        rankedEvidence =>
          rankedEvidence
            .affectedHypotheses >
          0,
      )
      .sort(
        (
          left,
          right,
        ) =>
          right.score -
          left.score,
      );
  }

  private rankEvidence(
    evidence:
      Evidence,

    probabilities:
      readonly ProbabilityResult[],
  ): RankedEvidence {
    let supportingHypotheses =
      0;

    let contradictingHypotheses =
      0;

    let requiredByHypotheses =
      0;

    let weightedImpact =
      0;

    for (
      const probability
      of probabilities
    ) {
      const hypothesis =
        probability.hypothesis;

      const isSupporting =
        hypothesis
          .supportingEvidenceIds
          .includes(
            evidence.id,
          );

      const isContradicting =
        hypothesis
          .contradictingEvidenceIds
          .includes(
            evidence.id,
          );

      const isRequired =
        hypothesis
          .requiredEvidenceIds
          .includes(
            evidence.id,
          );

      if (isSupporting) {
        supportingHypotheses +=
          1;

        weightedImpact +=
          probability.probability *
          1.25;
      }

      if (isContradicting) {
        contradictingHypotheses +=
          1;

        weightedImpact +=
          probability.probability *
          1.5;
      }

      if (isRequired) {
        requiredByHypotheses +=
          1;

        weightedImpact +=
          probability.probability *
          2;
      }
    }

    const affectedHypotheses =
      supportingHypotheses +
      contradictingHypotheses +
      requiredByHypotheses;

    const reliability =
      Math.min(
        1,
        Math.max(
          0,
          evidence.reliability,
        ),
      );

    const uncertaintyBonus =
      evidence.status ===
      "uncertain"
        ? 1.15
        : 1;

    const ambiguityBonus =
      Math.max(
        1,
        probabilities.length,
      );

    const score =
      weightedImpact *
      reliability *
      uncertaintyBonus *
      ambiguityBonus;

    return {
      evidence,

      score:
        Number(
          score.toFixed(
            6,
          ),
        ),

      supportingHypotheses,

      contradictingHypotheses,

      requiredByHypotheses,

      affectedHypotheses,
    };
  }
}
