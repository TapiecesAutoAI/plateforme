import type {
  ComplaintEvidenceSupport,
} from "./ComplaintEvidenceSupportPolicy";
export type SemanticComplaintProviderRequest = {
  originalText:
    string;
};

export type SemanticComplaintProviderEvidence = {
  id:
    string;

  confidence:
    number;

  support:
    ComplaintEvidenceSupport;
};

export type SemanticComplaintProviderResponse = {
  evidences:
    SemanticComplaintProviderEvidence[];
};

export interface SemanticComplaintProvider {
  interpretComplaint(
    request:
      SemanticComplaintProviderRequest,
  ): Promise<unknown>;
}

export class DisabledSemanticComplaintProvider
  implements SemanticComplaintProvider {

  public async interpretComplaint(
    _request:
      SemanticComplaintProviderRequest,
  ): Promise<SemanticComplaintProviderResponse> {

    return {
      evidences: [],
    };
  }
}