import {
  HypothesisId,
  EvidenceId,
  PartId,
  TestId,
} from "./identifiers";

import {
  Severity,
  Score,
  Confidence,
} from "./values";

export interface Hypothesis {

  id: HypothesisId;

  domainId: string;

  name: string;

  description: string;

  severity: Severity;

  baseScore: Score;

  confidence: Confidence;

  supportingEvidenceIds: EvidenceId[];

  supportingEvidenceWeights?: Record<string, number>;

  contradictingEvidenceIds: EvidenceId[];

  contradictingEvidenceWeights?: Record<string, number>;

  requiredEvidenceIds: EvidenceId[];

  possiblePartIds: PartId[];

  recommendedTestIds: TestId[];

}
