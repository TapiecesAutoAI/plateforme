import type {
  ToolOperationId,
} from "./ToolOperationResolver";

export type ToolPriority =
  | "required"
  | "recommended"
  | "optional"
  | "special";

export type ToolTechnicalSpecification = {
  label: string;
  value: string;
};

export type ToolKnowledgeItem = {
  name: string;
  priority: ToolPriority;

  specification?: string;

  specifications?: ToolTechnicalSpecification[];

  reason?: string;

  manufacturerReference?: string;
};

export type VehicleMatcher = {
  make?: string;
  model?: string;
  generation?: string;
  engineFamily?: string;
  engineCode?: string;
  transmission?: string;
  fromYear?: number;
  toYear?: number;
};

export type ToolKnowledgeUsage =
  | "demo-only"
  | "advisory"
  | "sellable";

export type RequiredTechnicalVehicleField =
  | "make"
  | "model"
  | "generation"
  | "year"
  | "engineName"
  | "engineCode"
  | "transmission";

export type ToolKnowledgeRecord = {
  id: string;

  operation: ToolOperationId;

  vehicleRequired: boolean;

  vehicle?: VehicleMatcher;

  requiredVehicleFields?:
    RequiredTechnicalVehicleField[];

  title: string;

  tools: ToolKnowledgeItem[];

  technicalNotes?: string[];

  source: {
    kind:
      | "local-demo"
      | "tecrmi"
      | "manufacturer"
      | "verified-web";

    reference?: string;
  };

  confidence:
    | "demo"
    | "verified"
    | "authoritative";

  usage?: ToolKnowledgeUsage;
};

export const TOOL_KNOWLEDGE_BASE: ToolKnowledgeRecord[] = [

  {
    id: "oil-filter-removal-universal",

    operation:
      "oil-filter-removal",

    vehicleRequired:
      false,

    title:
      "Demonter un filtre a huile",

    tools: [
      {
        name:
          "Cle a filtre type cloche",

        priority:
          "recommended",

        specification:
          "Diametre et nombre de pans selon filtre",

        reason:
          "Tres efficace lorsque le filtre est connu et accessible.",
      },
      {
        name:
          "Cle a filtre universelle 3 griffes",

        priority:
          "required",

        specification:
          "Plage de diametre compatible avec le filtre",

        reason:
          "Solution polyvalente pour de nombreux filtres.",
      },
      {
        name:
          "Cle a sangle",

        priority:
          "recommended",

        specification:
          "Modele compatible avec le diametre du filtre",
      },
      {
        name:
          "Cle a chaine",

        priority:
          "optional",

        specification:
          "Pour filtres fortement serres et accessibles",
      },
      {
        name:
          "Pince a filtre",

        priority:
          "optional",

        specification:
          "Ouverture compatible avec le diametre du filtre",
      },
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

  {
    id: "wheel-removal-universal",

    operation:
      "wheel-removal",

    vehicleRequired:
      false,

    title:
      "Demonter et remonter une roue",

    tools: [
      {
        name:
          "Jeu de douilles longues",

        priority:
          "required",

        specification:
          "17 / 19 / 21 mm - carre 1/2 pouce",

        specifications: [
          {
            label:
              "Tailles",
            value:
              "17 / 19 / 21 mm",
          },
          {
            label:
              "Carre",
            value:
              "1/2 pouce",
          },
        ],

        reason:
          "Couvre les dimensions courantes de boulons et ecrous de roues.",
      },
      {
        name:
          "Barre de force",

        priority:
          "required",

        specification:
          "Carre 1/2 pouce",

        specifications: [
          {
            label:
              "Carre",
            value:
              "1/2 pouce",
          },
        ],
      },
      {
        name:
          "Rallonge",

        priority:
          "recommended",

        specification:
          "Carre 1/2 pouce",

        specifications: [
          {
            label:
              "Carre",
            value:
              "1/2 pouce",
          },
        ],
      },
      {
        name:
          "Cle dynamometrique",

        priority:
          "required",

        specification:
          "Plage de couple couvrant les valeurs automobiles courantes",

        reason:
          "Pour le serrage final au couple constructeur.",
      },
      {
        name:
          "Cric et chandelles",

        priority:
          "required",

        specification:
          "Capacite adaptee au vehicule",
      },
    ],

    technicalNotes: [
      "Le couple de serrage doit etre obtenu selon le vehicule.",
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

  {
    id: "oil-change-universal",

    operation:
      "oil-change",

    vehicleRequired:
      false,

    title:
      "Faire une vidange moteur",

    tools: [
      {
        name:
          "Bac recuperateur",

        priority:
          "required",

        specification:
          "Capacite suffisante pour le volume d'huile moteur",
      },
      {
        name:
          "Jeu de douilles ou cles",

        priority:
          "required",

        specification:
          "Dimension du bouchon a verifier",
      },
      {
        name:
          "Outil pour filtre a huile",

        priority:
          "recommended",

        specification:
          "Selon type de filtre et accessibilite",
      },
      {
        name:
          "Entonnoir",

        priority:
          "recommended",
      },
      {
        name:
          "Cle dynamometrique",

        priority:
          "recommended",

        specification:
          "Plage adaptee au couple du bouchon de vidange",
      },
    ],

    technicalNotes: [
      "La dimension du bouchon et son couple de serrage peuvent dependre du vehicule.",
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

  {
    id: "battery-test-universal",

    operation:
      "battery-test",

    vehicleRequired:
      false,

    title:
      "Tester une batterie",

    tools: [
      {
        name:
          "Multimetre numerique",

        priority:
          "required",

        specification:
          "Mesure tension continue 12 V automobile",

        specifications: [
          {
            label:
              "Usage",
            value:
              "Automobile 12 V",
          },
          {
            label:
              "Mesure",
            value:
              "Tension continue",
          },
        ],
      },
      {
        name:
          "Testeur de batterie",

        priority:
          "recommended",

        specification:
          "Compatible batteries automobiles courantes",
      },
      {
        name:
          "Chargeur intelligent",

        priority:
          "optional",

        specification:
          "12 V - technologie adaptee au type de batterie",
      },
      {
        name:
          "Brosse pour bornes",

        priority:
          "optional",
      },
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

  {
    id: "alternator-test-universal",

    operation:
      "alternator-test",

    vehicleRequired:
      false,

    title:
      "Controler un alternateur",

    tools: [
      {
        name:
          "Multimetre numerique",

        priority:
          "required",

        specification:
          "Mesure tension continue - circuit automobile 12 V",

        reason:
          "Permet de controler la tension batterie moteur arrete et moteur tournant.",
      },
      {
        name:
          "Testeur batterie / alternateur",

        priority:
          "recommended",

        specification:
          "Compatible systemes de charge automobile 12 V",

        reason:
          "Permet un controle rapide du circuit de charge.",
      },
      {
        name:
          "Pinces de mesure",

        priority:
          "optional",

        specification:
          "Accessoires compatibles multimetre",

        reason:
          "Facilitent les mesures lorsque l'acces aux bornes est difficile.",
      },
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

  {
    id: "fuse-test-universal",

    operation:
      "fuse-test",

    vehicleRequired:
      false,

    title:
      "Controler des fusibles",

    tools: [
      {
        name:
          "Multimetre",

        priority:
          "required",

        specification:
          "Mesure continuite et tension continue",

        reason:
          "Permet de verifier la continuite et la presence de tension.",
      },
      {
        name:
          "Testeur de fusibles",

        priority:
          "recommended",

        specification:
          "Compatible circuits automobiles 12 V",

        reason:
          "Permet un controle rapide sans retirer chaque fusible.",
      },
      {
        name:
          "Pince extracteur de fusibles",

        priority:
          "optional",

        specification:
          "Pour fusibles automobiles mini et standard",

        reason:
          "Facilite le retrait des petits fusibles.",
      },
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

  {
    id: "electrical-diagnosis-universal",

    operation:
      "electrical-diagnosis",

    vehicleRequired:
      false,

    title:
      "Rechercher une panne electrique",

    tools: [
      {
        name:
          "Multimetre numerique",

        priority:
          "required",

        specification:
          "Mesure tension, continuite et resistance",

        reason:
          "Outil principal pour les controles electriques de base.",
      },
      {
        name:
          "Lampe temoin 12 V",

        priority:
          "recommended",

        specification:
          "Circuit automobile 12 V",

        reason:
          "Pratique pour verifier rapidement la presence d'alimentation.",
      },
      {
        name:
          "Jeu de pointes de mesure",

        priority:
          "recommended",

        specification:
          "Pointes fines pour connecteurs et faisceaux automobiles",

        reason:
          "Facilite les controles sur connecteurs et faisceaux.",
      },
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

  {
    id: "golf4-driveshaft-placeholder",

    operation:
      "driveshaft-removal",

    vehicleRequired:
      true,

    vehicle: {
      make:
        "Volkswagen",

      model:
        "Golf",

      generation:
        "IV",
    },

    requiredVehicleFields: [
      "make",
      "model",
      "generation",
      "engineName",
      "transmission",
    ],

    title:
      "Depose cardan Volkswagen Golf IV",

    tools: [],

    technicalNotes: [
      "Donnees techniques exactes a fournir depuis TecRMI, constructeur ou source verifiee.",
      "Ne pas proposer de dimension XZN ou de douille sans validation de la variante exacte.",
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

  {
    id: "opel-13-multijet-timing-placeholder",

    operation:
      "timing-service",

    vehicleRequired:
      true,

    vehicle: {
      make:
        "Opel",

      engineFamily:
        "1.3 Multijet",
    },

    requiredVehicleFields: [
      "make",
      "model",
      "year",
      "engineName",
      "engineCode",
    ],

    title:
      "Distribution Opel 1.3 Multijet",

    tools: [],

    technicalNotes: [
      "Kit de calage exact a determiner selon modele, annee, code moteur et variante.",
      "Aucune reference de kit ne doit etre proposee sans source technique verifiee.",
    ],

    source: {
      kind:
        "local-demo",
    },

    confidence:
      "demo",

    usage:
      "demo-only",
  },

];

export function getUniversalToolKnowledge(
  operation: ToolOperationId,
): ToolKnowledgeRecord | undefined {

  return TOOL_KNOWLEDGE_BASE.find(
    item =>
      item.operation === operation &&
      item.vehicleRequired === false,
  );
}