import {
  Contradiction,
  ProbabilityResult,
  ReasoningContext,
} from "../model";

export interface DiagnosticStopThresholds {
  minimumProbability: number;
  recommendedProbability: number;
  minimumLead: number;
  minimumSupportingEvidence: number;
  maximumContradictionSeverity: number;
}

export interface DiagnosticStopDecision {
  available: boolean;
  recommended: boolean;
  reason: string;
  probability: number;
  confidencePercentage: number;
  lead: number;
  supportingEvidenceCount: number;
  contradictionSeverity: number;
}

const DEFAULT_THRESHOLDS: DiagnosticStopThresholds = {
  minimumProbability: 0.65,
  recommendedProbability: 0.78,
  minimumLead: 0.1,
  minimumSupportingEvidence: 2,
  maximumContradictionSeverity: 0.65,
};

export class DiagnosticStopPolicy {
  private readonly thresholds:
    DiagnosticStopThresholds;

  public constructor(
    thresholds:
      Partial<DiagnosticStopThresholds> = {},
  ) {
    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };

    this.validateThresholds(
      this.thresholds,
    );
  }

  public evaluate(
    context: ReasoningContext,
    probabilities: ProbabilityResult[],
    contradictions: Contradiction[],
  ): DiagnosticStopDecision {
    const top =
      probabilities[0] ?? null;

    const second =
      probabilities[1] ?? null;

    if (!top) {
      return this.createUnavailableDecision(
        "Aucune hypothèse principale n'est disponible.",
      );
    }

    const probability =
      this.clampUnit(
        top.probability,
      );

    const secondProbability =
      this.clampUnit(
        second?.probability ?? 0,
      );

    const lead =
      this.clampUnit(
        probability -
        secondProbability,
      );

    const supportingEvidenceCount =
      top.hypothesis.supportingEvidenceIds
        .filter(
          evidenceId =>
            context.confirmedEvidenceIds.has(
              evidenceId,
            ),
        )
        .length;

    const contradictionSeverity =
      this.getMaximumContradictionSeverity(
        contradictions,
      );

    const hasRequiredEvidenceRejected =
      top.hypothesis.requiredEvidenceIds
        .some(
          evidenceId =>
            context.rejectedEvidenceIds.has(
              evidenceId,
            ),
        );

    const available =
      probability >=
        this.thresholds.minimumProbability &&
      lead >=
        this.thresholds.minimumLead &&
      supportingEvidenceCount >=
        this.thresholds.minimumSupportingEvidence &&
      contradictionSeverity <
        this.thresholds
          .maximumContradictionSeverity &&
      !hasRequiredEvidenceRejected;

    const recommended =
      available &&
      probability >=
        this.thresholds
          .recommendedProbability;

    return {
      available,
      recommended,
      reason:
        this.createReason(
          available,
          recommended,
          probability,
          lead,
          supportingEvidenceCount,
          contradictionSeverity,
          hasRequiredEvidenceRejected,
        ),
      probability,
      confidencePercentage:
        Math.round(
          probability * 100,
        ),
      lead,
      supportingEvidenceCount,
      contradictionSeverity,
    };
  }

  private createReason(
    available: boolean,
    recommended: boolean,
    probability: number,
    lead: number,
    supportingEvidenceCount: number,
    contradictionSeverity: number,
    hasRequiredEvidenceRejected: boolean,
  ): string {
    if (hasRequiredEvidenceRejected) {
      return (
        "Une preuve obligatoire contredit " +
        "l'hypothèse principale."
      );
    }

    if (
      contradictionSeverity >=
      this.thresholds
        .maximumContradictionSeverity
    ) {
      return (
        "Une contradiction importante doit " +
        "être résolue avant l'arrêt."
      );
    }

    if (
      supportingEvidenceCount <
      this.thresholds
        .minimumSupportingEvidence
    ) {
      return (
        "Le diagnostic ne possède pas encore " +
        "assez de preuves positives."
      );
    }

    if (
      lead <
      this.thresholds.minimumLead
    ) {
      return (
        "Les deux premières hypothèses sont " +
        "encore trop proches."
      );
    }

    if (
      probability <
      this.thresholds.minimumProbability
    ) {
      return (
        "La confiance actuelle est encore " +
        "trop faible pour proposer l'arrêt."
      );
    }

    if (recommended) {
      return (
        "Le diagnostic principal est suffisamment " +
        "solide. Le particulier peut arrêter les " +
        "questions ou continuer pour une vérification."
      );
    }

    if (available) {
      return (
        "Un diagnostic probable est disponible. " +
        "Le particulier peut arrêter les questions " +
        "sans modifier la confiance calculée."
      );
    }

    return (
      "Le diagnostic doit continuer."
    );
  }

  private createUnavailableDecision(
    reason: string,
  ): DiagnosticStopDecision {
    return {
      available: false,
      recommended: false,
      reason,
      probability: 0,
      confidencePercentage: 0,
      lead: 0,
      supportingEvidenceCount: 0,
      contradictionSeverity: 0,
    };
  }

  private getMaximumContradictionSeverity(
    contradictions: Contradiction[],
  ): number {
    let maximum = 0;

    for (
      const contradiction
      of contradictions
    ) {
      maximum = Math.max(
        maximum,
        this.clampUnit(
          contradiction.severity,
        ),
      );
    }

    return maximum;
  }

  private clampUnit(
    value: number,
  ): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.min(
      1,
      Math.max(
        0,
        value,
      ),
    );
  }

  private validateThresholds(
    thresholds:
      DiagnosticStopThresholds,
  ): void {
    const unitValues: Array<
      [string, number]
    > = [
      [
        "minimumProbability",
        thresholds.minimumProbability,
      ],
      [
        "recommendedProbability",
        thresholds.recommendedProbability,
      ],
      [
        "minimumLead",
        thresholds.minimumLead,
      ],
      [
        "maximumContradictionSeverity",
        thresholds
          .maximumContradictionSeverity,
      ],
    ];

    for (
      const [name, value]
      of unitValues
    ) {
      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1
      ) {
        throw new RangeError(
          `${name} doit être compris entre 0 et 1.`,
        );
      }
    }

    if (
      thresholds.recommendedProbability <
      thresholds.minimumProbability
    ) {
      throw new RangeError(
        "recommendedProbability doit être supérieur ou égal à minimumProbability.",
      );
    }

    if (
      !Number.isInteger(
        thresholds
          .minimumSupportingEvidence,
      ) ||
      thresholds
        .minimumSupportingEvidence < 1
    ) {
      throw new RangeError(
        "minimumSupportingEvidence doit être un entier supérieur ou égal à 1.",
      );
    }
  }
}
