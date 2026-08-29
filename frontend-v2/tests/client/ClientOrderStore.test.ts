import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  CLIENT_ORDER_STORAGE_KEY,
  getClientOrder,
  getClientOrders,
  saveClientOrder,
} from "../../lib/client/ClientOrderStore";


const storage =
  new Map<
    string,
    string
  >();


const localStorageMock = {

  getItem:
    vi.fn(
      (
        key:
          string,
      ) =>
        storage.get(
          key,
        ) ??
        null,
    ),

  setItem:
    vi.fn(
      (
        key:
          string,

        value:
          string,
      ) => {
        storage.set(
          key,
          value,
        );
      },
    ),

  removeItem:
    vi.fn(),

  clear:
    vi.fn(
      () => {
        storage.clear();
      },
    ),
};


Object.defineProperty(
  globalThis,
  "window",
  {
    value: {
      localStorage:
        localStorageMock,
    },

    configurable:
      true,
  },
);


describe(
  "ClientOrderStore",
  () => {

    beforeEach(
      () => {
        storage.clear();
      },
    );


    it(
      "stores order for customer C2",
      () => {

        saveClientOrder({
          id:
            "ORDER-TEST-001",

          customerId:
            "C2",

          vehicleId:
            "VEH-0002",

          createdAt:
            "2026-08-24T18:00:00",

          status:
            "confirmed",

          items: [
            {
              reference:
                "ALT-DEMO-001",

              brand:
                "Bosch",

              label:
                "Alternateur Bosch",

              quantity:
                1,

              unitPriceIncVat:
                264.99,

              totalIncVat:
                264.99,
            },
          ],

          totalIncVat:
            264.99,

          invoiceNumber:
            null,
        });

        expect(
          getClientOrders(
            "C2",
          ),
        ).toHaveLength(
          1,
        );
      },
    );


    it(
      "never exposes another customer order",
      () => {

        saveClientOrder({
          id:
            "ORDER-C1",

          customerId:
            "C1",

          createdAt:
            "2026-08-24T17:00:00",

          status:
            "confirmed",

          items:
            [],

          totalIncVat:
            10,
        });

        expect(
          getClientOrders(
            "C2",
          ),
        ).toHaveLength(
          0,
        );
      },
    );


    it(
      "loads one order by customer and id",
      () => {

        saveClientOrder({
          id:
            "ORDER-C2",

          customerId:
            "C2",

          createdAt:
            "2026-08-24T17:00:00",

          status:
            "confirmed",

          items:
            [],

          totalIncVat:
            50,
        });

        expect(
          getClientOrder(
            "C2",
            "ORDER-C2",
          )?.id,
        ).toBe(
          "ORDER-C2",
        );

        expect(
          getClientOrder(
            "C1",
            "ORDER-C2",
          ),
        ).toBeNull();
      },
    );


    it(
      "uses dedicated storage key",
      () => {

        expect(
          CLIENT_ORDER_STORAGE_KEY,
        ).toBe(
          "tapiecesauto-client-orders",
        );
      },
    );

  },
);