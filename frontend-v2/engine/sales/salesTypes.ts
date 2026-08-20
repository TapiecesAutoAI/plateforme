/*
 * ===========================================================
 * TYPES HISTORIQUES DU SALES ENGINE
 * ===========================================================
 */

export type PurchaseDecision =
  | "purchase-recommended"
  | "verification-required"
  | "purchase-not-recommended";

export type PurchaseRisk =
  | "low"
  | "medium"
  | "high";

export type PurchaseConfidence = {
  score: number;

  decision: PurchaseDecision;

  risk: PurchaseRisk;

  stars: number;

  label: string;
};

export type SalesRecommendation = {
  partName: string | null;

  headline: string;

  confidence: PurchaseConfidence;

  reasons: string[];

  alternativePart: string | null;

  verificationMessage: string | null;

  callToAction:
    | "identify-vehicle"
    | "continue-diagnostic"
    | "request-professional-check";
};

/*
 * ===========================================================
 * NOUVELLE COUCHE CANAL / FULFILLMENT
 * ===========================================================
 */

export type SalesChannel =
  | "online"
  | "showroom";

export type FulfillmentMode =
  | "home-delivery"
  | "pickup-point"
  | "locker"
  | "counter-pickup";

export type PaymentStatus =
  | "not-paid"
  | "payment-required"
  | "paid";

export type CounterHandoffStatus =
  | "none"
  | "requested"
  | "paid-ready-for-preparation"
  | "ready-for-pickup"
  | "collected";

export type SalesProfile =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

export interface SalesContext {
  profile: SalesProfile;

  channel: SalesChannel;

  fulfillment:
    FulfillmentMode | null;

  paymentStatus:
    PaymentStatus;

  counterHandoff:
    CounterHandoffStatus;

  storeId:
    string | null;

  terminalId:
    string | null;
}

export interface SalesOption {
  id: string;

  label: string;

  description: string;

  fulfillment:
    FulfillmentMode | null;

  requiresPayment:
    boolean;

  sendsToCounter:
    boolean;
}

export interface SalesDecision {
  context: SalesContext;

  options: SalesOption[];

  canPayOnline: boolean;

  canSendToCounter: boolean;

  canDeliver: boolean;

  message: string;
}

export interface CounterHandoff {
  id: string;

  createdAt: string;

  status:
    CounterHandoffStatus;

  profile:
    SalesProfile;

  storeId:
    string | null;

  terminalId:
    string | null;

  diagnosticId:
    string | null;

  genericPartName:
    string;

  reference:
    string;

  manufacturer:
    string;

  quantity:
    number;

  totalIncVat:
    number;

  paymentStatus:
    PaymentStatus;

  vehicleDescription:
    string | null;

  vin:
    string | null;
}
