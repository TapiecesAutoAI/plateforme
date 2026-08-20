export type OrderStatus =
  | "draft"
  | "confirmed"
  | "cancelled";

export interface OrderLine {
  offerId: string;
  reference: string;
  manufacturer: string;
  description: string;

  quantity: number;

  unitPriceExVat: number;
  vatRate: number;

  lineTotalExVat: number;
  lineVatAmount: number;
  lineTotalIncVat: number;
}

export interface OrderTotals {
  totalExVat: number;
  vatAmount: number;
  totalIncVat: number;
  currency: "EUR";
}

export interface CommercialOrder {
  id: string;
  status: OrderStatus;

  createdAt: string;

  lines: OrderLine[];

  totals: OrderTotals;

  vehicleCompatibilityConfirmed: boolean;
}

export interface CreateOrderInput {
  quantity?: number;
  compatibilityConfirmed: boolean;
}
