export type DataSource =
  | "customer"
  | "vin-decoder"
  | "diagnostic"
  | "seller"
  | "mechanic"
  | "catalog"
  | "order"
  | "payment"
  | "fulfillment"
  | "after-sales"
  | "survey"
  | "system"
  | "import"
  | "unknown";

export type DataReliability =
  | "verified"
  | "high"
  | "medium"
  | "declared"
  | "estimated"
  | "unknown";

export type CustomerProfile =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

export type SalesChannel =
  | "showroom"
  | "counter"
  | "mobile-app"
  | "web"
  | "phone"
  | "other";

export type InstallationResult =
  | "resolved"
  | "partially-resolved"
  | "not-resolved"
  | "not-installed"
  | "unknown";

export type DataValue<T> = {
  value: T;
  source: DataSource;
  reliability: DataReliability;
  collectedAt: string;
  updatedAt?: string;
  version?: number;
};

export type MarketingConsent = {
  email: boolean;
  sms: boolean;
  push: boolean;
  emailUpdatedAt?: string;
  smsUpdatedAt?: string;
  pushUpdatedAt?: string;
};

export type CustomerRecord = {
  id: string;

  firstName?: DataValue<string>;
  lastName?: DataValue<string>;
  phone?: DataValue<string>;
  email?: DataValue<string>;

  profile?: DataValue<CustomerProfile>;

  createdAt: string;
  updatedAt: string;

  marketingConsent: MarketingConsent;

  preferredStoreId?: string;
  preferredLanguage?: string;

  customerSince?: string;
  lastVisitAt?: string;

  visitCount: number;
  orderCount: number;

  totalSpentGross?: number;
  averageBasketGross?: number;

  tags: string[];

  vehicleIds: string[];
};

export type VehicleRecord = {
  id: string;
  customerId?: string;

  vin?: DataValue<string>;
  registration?: DataValue<string>;

  brand?: DataValue<string>;
  model?: DataValue<string>;
  generation?: DataValue<string>;
  productionYear?: DataValue<number>;

  engineCode?: DataValue<string>;
  engineDescription?: DataValue<string>;
  displacementCc?: DataValue<number>;
  powerKw?: DataValue<number>;

  fuel?: DataValue<string>;
  transmission?: DataValue<string>;

  mileageKm?: DataValue<number>;
  annualMileageKm?: DataValue<number>;

  firstRegistrationDate?: DataValue<string>;

  createdAt: string;
  updatedAt: string;

  diagnosticIds: string[];
  orderIds: string[];

  tags: string[];
};

export type DiagnosticAnswerRecord = {
  actionId: string;
  optionId?: string;
  value?: string;

  evidenceAdded: string[];

  answeredAt: string;
};

export type DiagnosticHypothesisSnapshot = {
  hypothesisId: string;
  label?: string;

  probability?: number;
  confidence?: number;

  supportingEvidenceIds: string[];
};

export type DiagnosticRecord = {
  id: string;

  customerId?: string;
  vehicleId?: string;

  profile: CustomerProfile;
  channel: SalesChannel;

  workflowId: string;

  initialProblem?: string;

  startedAt: string;
  completedAt?: string;

  answers: DiagnosticAnswerRecord[];

  evidenceIds: string[];

  hypothesisHistory: DiagnosticHypothesisSnapshot[];

  finalHypothesisId?: string;
  finalHypothesisLabel?: string;

  finalConfidence?: number;

  recommendedPartNames: string[];
  recommendedPartIds: string[];

  verificationPerformed?: boolean;
  verificationResult?: string;

  convertedToOrder: boolean;
  orderId?: string;

  storeId?: string;
  terminalId?: string;
  sellerId?: string;

  durationSeconds?: number;

  complexCase?: boolean;
  manualReviewRequired?: boolean;
};

export type CommercialPartRecord = {
  id: string;

  genericPartName: string;

  catalogReference?: string;
  manufacturer?: string;
  manufacturerReference?: string;

  supplierId?: string;

  purchasePriceNet?: number;
  salePriceNet?: number;
  salePriceGross?: number;

  vatRate?: number;

  grossMargin?: number;
  grossMarginPercentage?: number;

  stockStatus?: string;
  stockQuantity?: number;

  compatibleVehicleIds?: string[];

  createdAt: string;
  updatedAt: string;
};

export type OrderLineRecord = {
  id: string;

  partId: string;

  quantity: number;

  unitPriceNet: number;
  unitPriceGross: number;

  vatRate: number;

  discountAmount?: number;

  purchasePriceNet?: number;

  marginAmount?: number;

  compatibilityConfirmed?: boolean;
};

export type OrderRecord = {
  id: string;

  customerId?: string;
  vehicleId?: string;
  diagnosticId?: string;

  channel: SalesChannel;

  storeId?: string;
  terminalId?: string;
  sellerId?: string;

  createdAt: string;
  confirmedAt?: string;

  status:
    | "draft"
    | "requested"
    | "confirmed"
    | "paid"
    | "preparing"
    | "ready"
    | "collected"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";

  lines: OrderLineRecord[];

  totalNet: number;
  vatTotal: number;
  totalGross: number;

  paymentId?: string;
  fulfillmentId?: string;

  counterTicketId?: string;
};

export type PaymentRecord = {
  id: string;
  orderId: string;

  method?:
    | "card"
    | "cash"
    | "bank-transfer"
    | "online"
    | "account"
    | "other";

  status:
    | "pending"
    | "authorized"
    | "paid"
    | "failed"
    | "refunded"
    | "partially-refunded";

  amount: number;
  currency: string;

  createdAt: string;
  paidAt?: string;

  providerReference?: string;
};

export type FulfillmentRecord = {
  id: string;
  orderId: string;

  mode:
    | "counter"
    | "home-delivery"
    | "pickup-point"
    | "locker"
    | "garage-delivery";

  status:
    | "requested"
    | "preparing"
    | "ready"
    | "shipped"
    | "delivered"
    | "collected"
    | "failed";

  requestedAt: string;
  readyAt?: string;
  completedAt?: string;

  destinationLabel?: string;
};

export type CounterTicketRecord = {
  id: string;

  ticketNumber: string;

  customerId?: string;
  vehicleId?: string;
  diagnosticId?: string;
  orderId?: string;

  storeId?: string;
  terminalId?: string;

  createdAt: string;
  calledAt?: string;
  takenAt?: string;
  completedAt?: string;

  sellerId?: string;

  status:
    | "waiting"
    | "called"
    | "in-progress"
    | "completed"
    | "cancelled";
};

export type InstallationFeedbackRecord = {
  id: string;

  customerId?: string;
  vehicleId: string;
  orderId: string;
  partId: string;
  diagnosticId?: string;

  requestedAt: string;
  answeredAt?: string;

  installed?: boolean;

  installedBy?:
    | "customer"
    | "friend"
    | "independent-garage"
    | "professional-garage"
    | "store-workshop"
    | "unknown";

  installedAt?: string;

  mileageAtInstallationKm?: number;

  result: InstallationResult;

  problemDisappearedImmediately?: boolean;

  additionalPartRequired?: boolean;
  additionalPartName?: string;

  installationDifficulty?:
    | "easy"
    | "normal"
    | "difficult"
    | "professional-required";

  satisfactionScore?: number;

  returned?: boolean;
  warrantyClaim?: boolean;

  recurrence?: boolean;
  recurrenceAt?: string;
  recurrenceMileageKm?: number;

  comment?: string;
};

export type CampaignInteractionRecord = {
  id: string;

  customerId: string;

  campaignId: string;

  channel:
    | "email"
    | "sms"
    | "push";

  sentAt: string;

  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  repliedAt?: string;

  convertedToOrderId?: string;

  unsubscribed?: boolean;
};

export type DataEventRecord = {
  id: string;

  eventType: string;

  customerId?: string;
  vehicleId?: string;
  diagnosticId?: string;
  orderId?: string;

  channel?: SalesChannel;

  storeId?: string;
  terminalId?: string;
  sellerId?: string;

  createdAt: string;

  metadata: Record<
    string,
    string | number | boolean | null
  >;
};
