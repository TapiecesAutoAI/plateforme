export type ChargingAudience =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

export type ChargingEvidenceKind =
  | "symptom"
  | "observation"
  | "measurement"
  | "history";

export type ChargingEvidence = {
  id: string;

  label: string;

  kind: ChargingEvidenceKind;

  customerPhrases: string[];

  audiences: ChargingAudience[];

  reliability: number;
};

export type ChargingHypothesis = {
  id: string;

  label: string;

  description: string;

  primaryPartId: string | null;

  alternativePartIds: string[];

  recommendedChecks: string[];

  minimumEvidenceCount: number;
};

export type ChargingPart = {
  id: string;

  name: string;

  category: string;

  saleLabel: string;

  requiresVehicleIdentification: boolean;

  purchaseWarning: string | null;
};
