export type CatalogSupplierId =
  | "local-demo"
  | "doyen"
  | "salto"
  | "tecdoc";

export type CatalogStockStatus =
  | "in-stock"
  | "limited"
  | "order"
  | "unavailable"
  | "unknown";

export interface CatalogVehicleCompatibility {
  vin?: string;
  make?: string;
  model?: string;
  engine?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface CatalogPartOffer {
  id: string;

  genericPartId: string;

  genericPartName: string;

  reference: string;

  manufacturer: string;

  supplierId: CatalogSupplierId;

  supplierReference?: string;

  oemReferences: string[];

  tecdocReferences: string[];

  purchasePriceExVat: number | null;

  salePriceExVat: number | null;

  vatRate: number;

  currency: "EUR";

  stockStatus: CatalogStockStatus;

  stockQuantity: number | null;

  deliveryDays: number | null;

  compatibility: CatalogVehicleCompatibility[];

  active: boolean;
}

export interface CatalogSearchInput {
  genericPartId?: string;

  genericPartName?: string;

  vin?: string;

  make?: string;

  model?: string;

  engine?: string;

  year?: number;
}

export interface CatalogSearchResult {
  offers: CatalogPartOffer[];

  exactVehicleMatch: boolean;

  requiresCompatibilityCheck: boolean;

  message: string;
}
