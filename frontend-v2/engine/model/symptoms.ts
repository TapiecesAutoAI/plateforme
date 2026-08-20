import { SymptomId, EvidenceId } from "./identifiers";
import { Severity } from "./values";

export interface Symptom {

  id: SymptomId;

  domainId: string;

  name: string;

  description: string;

  synonyms: string[];

  severity: Severity;

  relatedEvidenceIds: EvidenceId[];

}
