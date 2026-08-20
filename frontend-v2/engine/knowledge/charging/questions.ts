import type {
  ChargingQuestion,
} from "./reasoningTypes";

const allAudiences = [
  "particulier",
  "bricoleur",
  "vendeur-pieces-auto",
  "mecanicien-garage",
  "depanneur",
] as const;

const technicalAudiences = [
  "bricoleur",
  "vendeur-pieces-auto",
  "mecanicien-garage",
  "depanneur",
] as const;

export const chargingQuestions:
  ChargingQuestion[] = [
  {
    id:
      "charging-question-warning-light",

    text:
      "Le voyant rouge de batterie reste-t-il allumé lorsque le moteur tourne ?",

    purpose:
      "Vérifier si le véhicule détecte une anomalie du circuit de charge.",

    audiences:
      [...allAudiences],

    difficulty:
      1,

    requiresMeasurement:
      false,

    estimatedSeconds:
      10,

    baseInformationGain:
      0.74,

    targetHypothesisIds: [
      "charging-alternator-not-charging",
      "charging-voltage-regulator-failure",
      "charging-main-fuse-failure",
    ],

    options: [
      {
        id:
          "yes",

        label:
          "Oui, il reste allumé",

        addsEvidenceIds: [
          "charging-battery-warning-engine-running",
        ],
      },

      {
        id:
          "no",

        label:
          "Non, il s’éteint normalement",

        addsEvidenceIds: [],

        rejectsEvidenceIds: [
          "charging-battery-warning-engine-running",
        ],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-driving-or-parked",

    text:
      "La batterie se décharge-t-elle surtout en roulant ou lorsque le véhicule reste à l’arrêt ?",

    purpose:
      "Distinguer une panne de charge d’une consommation électrique à l’arrêt.",

    audiences:
      [...allAudiences],

    difficulty:
      1,

    requiresMeasurement:
      false,

    estimatedSeconds:
      15,

    baseInformationGain:
      0.92,

    targetHypothesisIds: [
      "charging-alternator-not-charging",
      "charging-alternator-diode-failure",
      "charging-parasitic-drain-not-charging-failure",
    ],

    options: [
      {
        id:
          "driving",

        label:
          "Elle se décharge en roulant",

        addsEvidenceIds: [
          "charging-battery-drains-while-driving",
        ],

        rejectsEvidenceIds: [
          "charging-battery-only-drains-parked",
        ],
      },

      {
        id:
          "parked",

        label:
          "Elle se décharge surtout à l’arrêt",

        addsEvidenceIds: [
          "charging-battery-only-drains-parked",
        ],

        rejectsEvidenceIds: [
          "charging-battery-drains-while-driving",
        ],
      },

      {
        id:
          "both",

        label:
          "Dans les deux situations",

        addsEvidenceIds: [
          "charging-battery-drains-while-driving",
          "charging-battery-only-drains-parked",
        ],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-belt-visible",

    text:
      "La courroie d’accessoires est-elle bien présente et semble-t-elle intacte ?",

    purpose:
      "Écarter une cause mécanique visible avant de conseiller un alternateur.",

    audiences:
      [...allAudiences],

    difficulty:
      1,

    requiresMeasurement:
      false,

    estimatedSeconds:
      25,

    baseInformationGain:
      0.96,

    targetHypothesisIds: [
      "charging-accessory-belt-broken",
      "charging-accessory-belt-slipping",
      "charging-alternator-not-charging",
    ],

    options: [
      {
        id:
          "missing-or-broken",

        label:
          "Non, elle est cassée, absente ou très abîmée",

        addsEvidenceIds: [
          "charging-belt-missing-or-broken",
        ],
      },

      {
        id:
          "present",

        label:
          "Oui, elle est présente et semble intacte",

        addsEvidenceIds: [],

        rejectsEvidenceIds: [
          "charging-belt-missing-or-broken",
        ],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas où elle se trouve",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-belt-noise",

    text:
      "Entendez-vous un couinement, un sifflement ou un grondement du côté de la courroie ?",

    purpose:
      "Distinguer une courroie qui patine, un tendeur ou une poulie d’alternateur défectueuse.",

    audiences:
      [...allAudiences],

    difficulty:
      1,

    requiresMeasurement:
      false,

    estimatedSeconds:
      15,

    baseInformationGain:
      0.72,

    targetHypothesisIds: [
      "charging-accessory-belt-slipping",
      "charging-overrunning-pulley-failure",
      "charging-alternator-not-charging",
    ],

    options: [
      {
        id:
          "squeal",

        label:
          "Oui, un couinement ou un sifflement",

        addsEvidenceIds: [
          "charging-belt-squeals",
        ],
      },

      {
        id:
          "rumble",

        label:
          "Oui, un grondement ou bruit de roulement",

        addsEvidenceIds: [
          "charging-alternator-noise",
        ],
      },

      {
        id:
          "no-noise",

        label:
          "Non, aucun bruit particulier",

        addsEvidenceIds: [],

        rejectsEvidenceIds: [
          "charging-belt-squeals",
          "charging-alternator-noise",
        ],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-burning-smell",

    text:
      "Avez-vous remarqué une odeur de brûlé ou de caoutchouc chaud près du moteur ?",

    purpose:
      "Rechercher un patinage de courroie ou un élément d’accessoire bloqué.",

    audiences:
      [...allAudiences],

    difficulty:
      1,

    requiresMeasurement:
      false,

    estimatedSeconds:
      10,

    baseInformationGain:
      0.5,

    targetHypothesisIds: [
      "charging-accessory-belt-slipping",
      "charging-overrunning-pulley-failure",
    ],

    options: [
      {
        id:
          "yes",

        label:
          "Oui",

        addsEvidenceIds: [
          "charging-burning-smell",
        ],
      },

      {
        id:
          "no",

        label:
          "Non",

        addsEvidenceIds: [],

        rejectsEvidenceIds: [
          "charging-burning-smell",
        ],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-voltage",

    text:
      "Quelle tension mesurez-vous aux bornes de la batterie lorsque le moteur tourne ?",

    purpose:
      "Distinguer une absence de charge, une charge normale ou une surtension.",

    audiences:
      [...technicalAudiences],

    difficulty:
      3,

    requiresMeasurement:
      true,

    estimatedSeconds:
      60,

    baseInformationGain:
      0.99,

    targetHypothesisIds: [
      "charging-alternator-not-charging",
      "charging-voltage-regulator-failure",
      "charging-bplus-connection-failure",
      "charging-ground-connection-failure",
    ],

    options: [
      {
        id:
          "below-13",

        label:
          "Moins de 13 V",

        addsEvidenceIds: [
          "charging-voltage-below-13",
        ],
      },

      {
        id:
          "normal",

        label:
          "Entre 13,5 V et 14,8 V",

        addsEvidenceIds: [
          "charging-voltage-normal",
        ],
      },

      {
        id:
          "above-15",

        label:
          "Plus de 15 V",

        addsEvidenceIds: [
          "charging-voltage-above-15",
        ],
      },

      {
        id:
          "unstable",

        label:
          "La tension varie fortement",

        addsEvidenceIds: [
          "charging-voltage-unstable",
        ],
      },

      {
        id:
          "not-measured",

        label:
          "Je n’ai pas effectué la mesure",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-bplus",

    text:
      "La grosse connexion positive de l’alternateur semble-t-elle propre, serrée et non brûlée ?",

    purpose:
      "Éviter de vendre un alternateur alors que le courant est bloqué par une mauvaise connexion.",

    audiences:
      [...technicalAudiences],

    difficulty:
      3,

    requiresMeasurement:
      false,

    estimatedSeconds:
      60,

    baseInformationGain:
      0.82,

    targetHypothesisIds: [
      "charging-bplus-connection-failure",
      "charging-alternator-not-charging",
    ],

    options: [
      {
        id:
          "bad",

        label:
          "Non, elle est oxydée, desserrée ou abîmée",

        addsEvidenceIds: [
          "charging-bplus-connection-bad",
        ],
      },

      {
        id:
          "good",

        label:
          "Oui, elle semble correcte",

        addsEvidenceIds: [],

        rejectsEvidenceIds: [
          "charging-bplus-connection-bad",
        ],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-ground",

    text:
      "Les câbles de masse de la batterie et du moteur semblent-ils propres, serrés et non endommagés ?",

    purpose:
      "Écarter une chute de tension due à une mauvaise masse.",

    audiences:
      [...technicalAudiences],

    difficulty:
      3,

    requiresMeasurement:
      false,

    estimatedSeconds:
      60,

    baseInformationGain:
      0.78,

    targetHypothesisIds: [
      "charging-ground-connection-failure",
      "charging-alternator-not-charging",
    ],

    options: [
      {
        id:
          "bad",

        label:
          "Non, une masse est oxydée, desserrée ou abîmée",

        addsEvidenceIds: [
          "charging-ground-connection-bad",
        ],
      },

      {
        id:
          "good",

        label:
          "Oui, elles semblent correctes",

        addsEvidenceIds: [],

        rejectsEvidenceIds: [
          "charging-ground-connection-bad",
        ],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-main-fuse",

    text:
      "Le maxi-fusible ou fusible principal du circuit de charge est-il intact ?",

    purpose:
      "Vérifier que le courant de l’alternateur peut atteindre la batterie.",

    audiences:
      [...technicalAudiences],

    difficulty:
      4,

    requiresMeasurement:
      false,

    estimatedSeconds:
      90,

    baseInformationGain:
      0.84,

    targetHypothesisIds: [
      "charging-main-fuse-failure",
      "charging-alternator-not-charging",
    ],

    options: [
      {
        id:
          "blown",

        label:
          "Non, il est coupé ou brûlé",

        addsEvidenceIds: [
          "charging-main-fuse-blown",
        ],
      },

      {
        id:
          "good",

        label:
          "Oui, il est intact",

        addsEvidenceIds: [],

        rejectsEvidenceIds: [
          "charging-main-fuse-blown",
        ],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas",

        addsEvidenceIds: [],
      },
    ],
  },

  {
    id:
      "charging-question-new-battery",

    text:
      "La batterie a-t-elle été remplacée récemment sans résoudre le problème ?",

    purpose:
      "Réduire la probabilité que la batterie soit la cause principale et orienter vers le circuit de charge.",

    audiences:
      [...allAudiences],

    difficulty:
      1,

    requiresMeasurement:
      false,

    estimatedSeconds:
      10,

    baseInformationGain:
      0.66,

    targetHypothesisIds: [
      "charging-alternator-not-charging",
      "charging-alternator-diode-failure",
      "charging-parasitic-drain-not-charging-failure",
    ],

    options: [
      {
        id:
          "yes",

        label:
          "Oui, elle est récente et le problème continue",

        addsEvidenceIds: [
          "charging-new-battery-drains",
        ],
      },

      {
        id:
          "no",

        label:
          "Non",

        addsEvidenceIds: [],
      },

      {
        id:
          "unknown",

        label:
          "Je ne sais pas",

        addsEvidenceIds: [],
      },
    ],
  },
];
