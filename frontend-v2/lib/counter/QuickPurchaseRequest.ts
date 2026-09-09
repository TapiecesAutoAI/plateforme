export type QuickPurchaseRequestType =
  | "order"
  | "advice";

export type QuickPurchaseRequestItem = {
  productId: string;
  supplierCode: string;
  name: string;
  unitPrice: number | null;
  quantity: number;
};

export type QuickPurchaseRequest = {
  id: string;
  type: QuickPurchaseRequestType;
  customerId: string;
  organizationId?: string;
  items: QuickPurchaseRequestItem[];
  total: number;
  status: "waiting";
  createdAt: string;
};