import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  prepareClientDiagnostic,
  prepareClientKnownPart,
} from "../../lib/client/ClientFlowBridge";


const customer = {
  id: "C2",
  firstName: "Marc",
  lastName: "Lambert",
  phone: "0470000000",
  email: "client@tpa.be",
  marketingEmail: false,
  marketingSms: false,
  profile: "particulier" as const,
};


const vehicle = {
  id: "V-C2-1",
  vin: null,
  plate: "1-TPA-001",
  brand: "Volkswagen",
  model: "Golf",
  year: 2019,
  engine: "1.5 TSI",
  fuel: "Essence",
  powerHp: 150,
  powerKw: 110,
  label:
    "Volkswagen Golf 2019 1.5 TSI",
};


describe(
  "ClientFlowBridge",
  () => {

    const storage =
      new Map<string, string>();

    beforeEach(
      () => {

        storage.clear();

        vi.stubGlobal(
          "window",
          {
            sessionStorage: {
              setItem(
                key: string,
                value: string,
              ) {
                storage.set(
                  key,
                  value,
                );
              },

              getItem(
                key: string,
              ) {
                return (
                  storage.get(
                    key,
                  ) ??
                  null
                );
              },

              removeItem(
                key: string,
              ) {
                storage.delete(
                  key,
                );
              },
            },
          },
        );
      },
    );


    afterEach(
      () => {
        vi.unstubAllGlobals();
      },
    );


    it(
      "prepares diagnostic context",
      () => {

        const context =
          prepareClientDiagnostic(
            customer,
            vehicle,
          );

        expect(
          context.customer.id,
        ).toBe(
          "C2",
        );

        expect(
          context.vehicle.id,
        ).toBe(
          "V-C2-1",
        );

        expect(
          context.profile,
        ).toBe(
          "particulier",
        );

        expect(
          storage.get(
            "tapiecesauto-showroom-customer",
          ),
        ).toContain(
          '"id":"C2"',
        );

        expect(
          storage.get(
            "tapiecesauto-showroom-vehicle",
          ),
        ).toContain(
          '"id":"V-C2-1"',
        );

        expect(
          storage.get(
            "tapiecesauto-showroom-profile",
          ),
        ).toBe(
          "particulier",
        );

        expect(
          storage.has(
            "tapiecesauto-piece-flow",
          ),
        ).toBe(
          false,
        );
      },
    );


    it(
      "prepares known part context",
      () => {

        prepareClientKnownPart(
          customer,
          vehicle,
        );

        expect(
          storage.get(
            "tapiecesauto-piece-flow",
          ),
        ).toBe(
          "known-part",
        );

        expect(
          storage.get(
            "tapiecesauto-showroom-context",
          ),
        ).toContain(
          '"customer"',
        );
      },
    );
  },
);