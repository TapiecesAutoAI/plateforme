export type FluidCategory =
  | "engine-oil"
  | "transmission"
  | "coolant"
  | "brake-steering"
  | "other";

export type FluidVehicleRequirement =
  | "universal"
  | "vehicle-required";

export type FluidKnowledgeRecord = {
  id: string;
  category: FluidCategory;
  title: string;
  vehicleRequirement: FluidVehicleRequirement;
  specificationRequired: boolean;
  quantityVehicleDependent: boolean;
  examples: string[];
};

export const FLUID_KNOWLEDGE_BASE:
  FluidKnowledgeRecord[] = [

    {
      id: "engine-oil",
      category: "engine-oil",
      title: "Huile moteur",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "huile moteur",
        "huile pour le moteur",
        "vidange moteur",
      ],
    },

    {
      id: "manual-transmission-fluid",
      category: "transmission",
      title: "Huile de boite manuelle",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "huile de boite manuelle",
        "huile boite manuelle",
        "huile transmission manuelle",
      ],
    },

    {
      id: "automatic-transmission-fluid",
      category: "transmission",
      title: "Huile de boite automatique / ATF",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "huile de boite automatique",
        "huile boite automatique",
        "huile atf",
        "fluide atf",
        "atf",
      ],
    },

    {
      id: "dct-fluid",
      category: "transmission",
      title: "Huile DSG / DCT",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "huile dsg",
        "huile dct",
        "fluide dsg",
        "fluide dct",
        "double embrayage",
      ],
    },

    {
      id: "cvt-fluid",
      category: "transmission",
      title: "Huile CVT",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "huile cvt",
        "fluide cvt",
        "boite cvt",
      ],
    },

    {
      id: "differential-fluid",
      category: "transmission",
      title: "Huile de pont / differentiel",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "huile de pont",
        "huile pont",
        "huile differentiel",
        "huile de differentiel",
      ],
    },

    {
      id: "power-steering-fluid",
      category: "brake-steering",
      title: "Huile / fluide de direction assistee",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "huile de direction",
        "huile direction",
        "fluide direction",
        "direction assistee",
      ],
    },

    {
      id: "brake-fluid",
      category: "brake-steering",
      title: "Liquide de frein",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "liquide de frein",
        "huile de frein",
        "fluide de frein",
      ],
    },

    {
      id: "coolant",
      category: "coolant",
      title: "Liquide de refroidissement",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "liquide de refroidissement",
        "antigel",
        "ldr",
      ],
    },

    {
      id: "screenwash",
      category: "other",
      title: "Lave-glace",
      vehicleRequirement: "universal",
      specificationRequired: false,
      quantityVehicleDependent: false,
      examples: [
        "lave glace",
        "lave-glace",
        "liquide lave glace",
      ],
    },

    {
      id: "adblue",
      category: "other",
      title: "AdBlue",
      vehicleRequirement: "vehicle-required",
      specificationRequired: true,
      quantityVehicleDependent: true,
      examples: [
        "adblue",
        "ad blue",
      ],
    },
  ];