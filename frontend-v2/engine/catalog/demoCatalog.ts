import type {
  CatalogPartOffer,
} from "./catalogTypes";

export const demoCatalog:
  CatalogPartOffer[] = [
  {
    id: "offer-alternator-demo-001",

    genericPartId:
      "part-alternator",

    genericPartName:
      "Alternateur",

    reference:
      "ALT-DEMO-001",

    manufacturer:
      "Bosch",

    supplierId:
      "local-demo",

    supplierReference:
      "SUP-ALT-001",

    oemReferences: [],

    tecdocReferences: [],

    purchasePriceExVat:
      145,

    salePriceExVat:
      219,

    vatRate:
      0.21,

    currency:
      "EUR",

    stockStatus:
      "in-stock",

    stockQuantity:
      3,

    deliveryDays:
      0,

    compatibility: [],

    active:
      true,
  },

  {
    id: "offer-alternator-demo-002",

    genericPartId:
      "part-alternator",

    genericPartName:
      "Alternateur",

    reference:
      "ALT-DEMO-002",

    manufacturer:
      "Valeo",

    supplierId:
      "local-demo",

    supplierReference:
      "SUP-ALT-002",

    oemReferences: [],

    tecdocReferences: [],

    purchasePriceExVat:
      132,

    salePriceExVat:
      205,

    vatRate:
      0.21,

    currency:
      "EUR",

    stockStatus:
      "order",

    stockQuantity:
      0,

    deliveryDays:
      1,

    compatibility: [],

    active:
      true,
  },

  {
    id: "offer-belt-demo-001",

    genericPartId:
      "part-accessory-belt",

    genericPartName:
      "Courroie d’accessoires",

    reference:
      "BELT-DEMO-001",

    manufacturer:
      "Gates",

    supplierId:
      "local-demo",

    supplierReference:
      "SUP-BELT-001",

    oemReferences: [],

    tecdocReferences: [],

    purchasePriceExVat:
      18,

    salePriceExVat:
      32,

    vatRate:
      0.21,

    currency:
      "EUR",

    stockStatus:
      "in-stock",

    stockQuantity:
      8,

    deliveryDays:
      0,

    compatibility: [],

    active:
      true,
  },
];
