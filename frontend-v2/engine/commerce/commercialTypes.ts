import type { CatalogPartOffer } from "../catalog";

export type CommercialOfferStatus =
  | "offer-ready"
  | "compatibility-required"
  | "no-commercial-reference"
  | "diagnostic-not-ready";

export interface CommercialOfferResult {
  status: CommercialOfferStatus;
  diagnosticPartName: string | null;
  offer: CatalogPartOffer | null;
  salePriceIncVat: number | null;
  compatibilityConfirmed: boolean;
  canOrder: boolean;
  message: string;
}
