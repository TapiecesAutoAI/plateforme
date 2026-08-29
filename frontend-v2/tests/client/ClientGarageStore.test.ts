import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  addClientGarageVehicle,
  CLIENT_GARAGE_STORAGE_KEY,
  getClientGarageRecord,
  getClientGarageVehicles,
  removeClientGarageVehicle,
  updateClientGarageVehicle,
} from "../../lib/client/ClientGarageStore";


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
    vi.fn(
      (
        key:
          string,
      ) => {
        storage.delete(
          key,
        );
      },
    ),

  clear:
    vi.fn(
      () => {
        storage.clear();
      },
    ),

  key:
    vi.fn(
      (
        index:
          number,
      ) =>
        Array.from(
          storage.keys(),
        )[index] ??
        null,
    ),

  get length() {
    return storage.size;
  },
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


const C2 = {
  customer: {
    id:
      "C2",

    firstName:
      "Marc",

    lastName:
      "Lambert",
  },

  vehicles: [
    {
      id:
        "VEH-0002",

      brand:
        "Volkswagen",

      model:
        "Golf",

      year:
        2019,

      engine:
        "2.0 TDI 150",
    },
  ],
};


describe(
  "ClientGarageStore",
  () => {

    beforeEach(
      () => {
        storage.clear();

        localStorageMock.setItem(
          CLIENT_GARAGE_STORAGE_KEY,
          JSON.stringify([
            C2,
          ]),
        );
      },
    );


    it(
      "loads garage by customerId",
      () => {

        const garage =
          getClientGarageRecord(
            "C2",
          );

        expect(
          garage?.customer.id,
        ).toBe(
          "C2",
        );

        expect(
          garage?.vehicles,
        ).toHaveLength(
          1,
        );
      },
    );


    it(
      "returns vehicles for C2",
      () => {

        const vehicles =
          getClientGarageVehicles(
            "C2",
          );

        expect(
          vehicles[0]?.id,
        ).toBe(
          "VEH-0002",
        );
      },
    );


    it(
      "adds vehicle without losing existing vehicle",
      () => {

        addClientGarageVehicle(
          "C2",
          {
            id:
              "VEH-NEW",

            brand:
              "BMW",

            model:
              "320d",
          },
        );

        const vehicles =
          getClientGarageVehicles(
            "C2",
          );

        expect(
          vehicles,
        ).toHaveLength(
          2,
        );

        expect(
          vehicles.some(
            vehicle =>
              vehicle.id ===
              "VEH-0002",
          ),
        ).toBe(
          true,
        );

        expect(
          vehicles.some(
            vehicle =>
              vehicle.id ===
              "VEH-NEW",
          ),
        ).toBe(
          true,
        );
      },
    );


    it(
      "updates vehicle",
      () => {

        updateClientGarageVehicle(
          "C2",
          "VEH-0002",
          {
            model:
              "Golf VIII",
          },
        );

        expect(
          getClientGarageVehicles(
            "C2",
          )[0]?.model,
        ).toBe(
          "Golf VIII",
        );
      },
    );


    it(
      "never changes vehicle id during update",
      () => {

        updateClientGarageVehicle(
          "C2",
          "VEH-0002",
          {
            id:
              "HACKED",
          },
        );

        expect(
          getClientGarageVehicles(
            "C2",
          )[0]?.id,
        ).toBe(
          "VEH-0002",
        );
      },
    );


    it(
      "removes only selected vehicle",
      () => {

        addClientGarageVehicle(
          "C2",
          {
            id:
              "VEH-NEW",
          },
        );

        removeClientGarageVehicle(
          "C2",
          "VEH-NEW",
        );

        const vehicles =
          getClientGarageVehicles(
            "C2",
          );

        expect(
          vehicles,
        ).toHaveLength(
          1,
        );

        expect(
          vehicles[0]?.id,
        ).toBe(
          "VEH-0002",
        );
      },
    );


    it(
      "does not expose another customer garage",
      () => {

        expect(
          getClientGarageRecord(
            "C99",
          ),
        ).toBeNull();
      },
    );

  },
);