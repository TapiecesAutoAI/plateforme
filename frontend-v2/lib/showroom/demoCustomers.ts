export type DemoProfile =
  | "particulier"
  | "bricoleur"
  | "mecanicien-garage";

export type DemoCustomerRecord = {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    marketingEmail: boolean;
    marketingSms: boolean;
    profile?: DemoProfile;
  };

  vehicles: Array<{
    id: string;
    vin: string | null;
    brand: string;
    model: string;
    year: number | null;
    engine: string;
    label: string;
  }>;
};

export const DEMO_CUSTOMERS:
  DemoCustomerRecord[] = [

  {
    customer: {
      id: "C1",
      firstName: "Jean",
      lastName: "Dupont",
      phone: "0471000001",
      email: "jean.dupont@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0001",
        vin: "VF3LBBHZHKS000001",
        brand: "Peugeot",
        model: "308",
        year: 2019,
        engine: "1.5 BlueHDi 130",
        label: "Peugeot 308 2019 1.5 BlueHDi 130",
      },
    ],
  },

  {
    customer: {
      id: "C2",
      firstName: "Marc",
      lastName: "Lambert",
      phone: "0471000002",
      email: "marc.lambert@demo.be",
      marketingEmail: true,
      marketingSms: false,
      profile: "bricoleur",
    },
    vehicles: [
      {
        id: "VEH-0002",
        vin: "WVWZZZAUZKP000002",
        brand: "Volkswagen",
        model: "Golf",
        year: 2019,
        engine: "2.0 TDI 150",
        label: "Volkswagen Golf 2019 2.0 TDI 150",
      },
    ],
  },

  {
    customer: {
      id: "C3",
      firstName: "Sophie",
      lastName: "Martin",
      phone: "0471000003",
      email: "sophie.martin@demo.be",
      marketingEmail: false,
      marketingSms: false,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0003",
        vin: "VF1RFB00667000003",
        brand: "Renault",
        model: "Clio V",
        year: 2021,
        engine: "1.0 TCe 100",
        label: "Renault Clio V 2021 1.0 TCe 100",
      },
    ],
  },

  {
    customer: {
      id: "C4",
      firstName: "Philippe",
      lastName: "Dubois",
      phone: "0471000004",
      email: "philippe.dubois@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "mecanicien-garage",
    },
    vehicles: [
      {
        id: "VEH-0004",
        vin: "WBA8C51070A000004",
        brand: "BMW",
        model: "320d",
        year: 2018,
        engine: "2.0 Diesel 190",
        label: "BMW 320d 2018 2.0 Diesel 190",
      },
    ],
  },

  {
    customer: {
      id: "C5",
      firstName: "Nathalie",
      lastName: "Leroy",
      phone: "0471000005",
      email: "nathalie.leroy@demo.be",
      marketingEmail: true,
      marketingSms: false,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0005",
        vin: "UU1HSDADG67000005",
        brand: "Dacia",
        model: "Duster",
        year: 2020,
        engine: "1.3 TCe 130",
        label: "Dacia Duster 2020 1.3 TCe 130",
      },
    ],
  },

  {
    customer: {
      id: "C6",
      firstName: "Olivier",
      lastName: "Simon",
      phone: "0471000006",
      email: "olivier.simon@demo.be",
      marketingEmail: false,
      marketingSms: true,
      profile: "bricoleur",
    },
    vehicles: [
      {
        id: "VEH-0006",
        vin: "TMBJG7NE5L0000006",
        brand: "Skoda",
        model: "Octavia",
        year: 2020,
        engine: "1.5 TSI 150",
        label: "Skoda Octavia 2020 1.5 TSI 150",
      },
    ],
  },

  {
    customer: {
      id: "C7",
      firstName: "Karim",
      lastName: "Benali",
      phone: "0471000007",
      email: "karim.benali@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0007",
        vin: "NLHBA51BADZ000007",
        brand: "Hyundai",
        model: "i30",
        year: 2017,
        engine: "1.6 CRDi 110",
        label: "Hyundai i30 2017 1.6 CRDi 110",
      },
    ],
  },

  {
    customer: {
      id: "C8",
      firstName: "Isabelle",
      lastName: "Leclercq",
      phone: "0471000008",
      email: "isabelle.leclercq@demo.be",
      marketingEmail: true,
      marketingSms: false,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0008",
        vin: "VSSZZZ5FZJR000008",
        brand: "Seat",
        model: "Leon",
        year: 2018,
        engine: "1.4 TSI 125",
        label: "Seat Leon 2018 1.4 TSI 125",
      },
    ],
  },

  {
    customer: {
      id: "C9",
      firstName: "Michel",
      lastName: "Renard",
      phone: "0471000009",
      email: "michel.renard@demo.be",
      marketingEmail: false,
      marketingSms: false,
      profile: "mecanicien-garage",
    },
    vehicles: [
      {
        id: "VEH-0009",
        vin: "WF0FXXWPCFJ000009",
        brand: "Ford",
        model: "Focus",
        year: 2018,
        engine: "1.5 EcoBlue 120",
        label: "Ford Focus 2018 1.5 EcoBlue 120",
      },
    ],
  },

  {
    customer: {
      id: "C10",
      firstName: "Julie",
      lastName: "Gerard",
      phone: "0471000010",
      email: "julie.gerard@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0010",
        vin: "ZFA3120000J000010",
        brand: "Fiat",
        model: "500",
        year: 2020,
        engine: "1.0 Hybrid 70",
        label: "Fiat 500 2020 1.0 Hybrid 70",
      },
    ],
  },

  {
    customer: {
      id: "C11",
      firstName: "Patrick",
      lastName: "Henry",
      phone: "0471000011",
      email: "patrick.henry@demo.be",
      marketingEmail: true,
      marketingSms: false,
      profile: "bricoleur",
    },
    vehicles: [
      {
        id: "VEH-0011",
        vin: "SB1EB76L90E000011",
        brand: "Toyota",
        model: "Corolla",
        year: 2021,
        engine: "1.8 Hybrid 122",
        label: "Toyota Corolla 2021 1.8 Hybrid 122",
      },
    ],
  },

  {
    customer: {
      id: "C12",
      firstName: "Fatima",
      lastName: "Aydin",
      phone: "0471000012",
      email: "fatima.aydin@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0012",
        vin: "NMTKZ3BX20R000012",
        brand: "Toyota",
        model: "C-HR",
        year: 2022,
        engine: "2.0 Hybrid 184",
        label: "Toyota C-HR 2022 2.0 Hybrid 184",
      },
    ],
  },

  {
    customer: {
      id: "C13",
      firstName: "Alain",
      lastName: "Masson",
      phone: "0471000013",
      email: "alain.masson@demo.be",
      marketingEmail: false,
      marketingSms: false,
      profile: "mecanicien-garage",
    },
    vehicles: [
      {
        id: "VEH-0013",
        vin: "WDD2050041F000013",
        brand: "Mercedes-Benz",
        model: "C220d",
        year: 2019,
        engine: "2.0 Diesel 194",
        label: "Mercedes C220d 2019 2.0 Diesel 194",
      },
    ],
  },

  {
    customer: {
      id: "C14",
      firstName: "Celine",
      lastName: "Jacobs",
      phone: "0471000014",
      email: "celine.jacobs@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0014",
        vin: "WAUZZZF41KA000014",
        brand: "Audi",
        model: "A4",
        year: 2019,
        engine: "2.0 TDI 150",
        label: "Audi A4 2019 2.0 TDI 150",
      },
    ],
  },

  {
    customer: {
      id: "C15",
      firstName: "Mustafa",
      lastName: "Demir",
      phone: "0471000015",
      email: "mustafa.demir@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "bricoleur",
    },
    vehicles: [
      {
        id: "VEH-0015",
        vin: "VF7NC9HP0GY000015",
        brand: "Citroen",
        model: "C4",
        year: 2017,
        engine: "1.6 BlueHDi 100",
        label: "Citroen C4 2017 1.6 BlueHDi 100",
      },
    ],
  },

  {
    customer: {
      id: "C16",
      firstName: "Anne",
      lastName: "Fontaine",
      phone: "0471000016",
      email: "anne.fontaine@demo.be",
      marketingEmail: false,
      marketingSms: false,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0016",
        vin: "KNAFZ413BG5000016",
        brand: "Kia",
        model: "Sportage",
        year: 2020,
        engine: "1.6 CRDi 136",
        label: "Kia Sportage 2020 1.6 CRDi 136",
      },
    ],
  },

  {
    customer: {
      id: "C17",
      firstName: "Luc",
      lastName: "Robert",
      phone: "0471000017",
      email: "luc.robert@demo.be",
      marketingEmail: true,
      marketingSms: false,
      profile: "mecanicien-garage",
    },
    vehicles: [
      {
        id: "VEH-0017",
        vin: "YS3FD79Y6J1000017",
        brand: "Volvo",
        model: "V60",
        year: 2018,
        engine: "D4 190",
        label: "Volvo V60 2018 D4 190",
      },
    ],
  },

  {
    customer: {
      id: "C18",
      firstName: "Emilie",
      lastName: "Meunier",
      phone: "0471000018",
      email: "emilie.meunier@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0018",
        vin: "JTDKN3DU0A0000018",
        brand: "Toyota",
        model: "Yaris",
        year: 2022,
        engine: "1.5 Hybrid 116",
        label: "Toyota Yaris 2022 1.5 Hybrid 116",
      },
    ],
  },

  {
    customer: {
      id: "C19",
      firstName: "David",
      lastName: "Petit",
      phone: "0471000019",
      email: "david.petit@demo.be",
      marketingEmail: false,
      marketingSms: true,
      profile: "bricoleur",
    },
    vehicles: [
      {
        id: "VEH-0019",
        vin: "VF1R9800667000019",
        brand: "Renault",
        model: "Megane",
        year: 2020,
        engine: "1.3 TCe 140",
        label: "Renault Megane 2020 1.3 TCe 140",
      },
    ],
  },

  {
    customer: {
      id: "C20",
      firstName: "Sarah",
      lastName: "Vermeulen",
      phone: "0471000020",
      email: "sarah.vermeulen@demo.be",
      marketingEmail: true,
      marketingSms: true,
      profile: "particulier",
    },
    vehicles: [
      {
        id: "VEH-0020",
        vin: "W0L0XCE7584000020",
        brand: "Opel",
        model: "Astra",
        year: 2019,
        engine: "1.4 Turbo 150",
        label: "Opel Astra 2019 1.4 Turbo 150",
      },
      {
        id: "VEH-0020-B",
        vin: "WVWZZZ1KZJW000020",
        brand: "Volkswagen",
        model: "Polo",
        year: 2018,
        engine: "1.0 TSI 95",
        label: "Volkswagen Polo 2018 1.0 TSI 95",
      },
    ],
  },
];

