import type {
  ChargingEvidence,
} from "./types";

const allAudiences = [
  "particulier",
  "bricoleur",
  "vendeur-pieces-auto",
  "mecanicien-garage",
  "depanneur",
] as const;

export const chargingEvidences:
  ChargingEvidence[] = [
  {
    id:
      "charging-battery-warning-engine-running",

    label:
      "Le voyant rouge de batterie reste allumé moteur tournant",

    kind:
      "symptom",

    customerPhrases: [
      "Le voyant batterie reste allumé",
      "Le témoin rouge de batterie ne s’éteint pas",
      "Le voyant de charge reste affiché en roulant",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.94,
  },

  {
    id:
      "charging-battery-drains-while-driving",

    label:
      "La batterie se décharge pendant que le véhicule roule",

    kind:
      "symptom",

    customerPhrases: [
      "La batterie se vide en roulant",
      "La voiture perd progressivement son électricité",
      "Le véhicule finit par caler après quelques kilomètres",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.92,
  },

  {
    id:
      "charging-new-battery-drains",

    label:
      "Une batterie récente se décharge encore",

    kind:
      "history",

    customerPhrases: [
      "La batterie est neuve mais elle se vide",
      "J’ai remplacé la batterie et le problème continue",
      "Même avec une nouvelle batterie elle se décharge",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.9,
  },

  {
    id:
      "charging-lights-vary-with-rpm",

    label:
      "L’intensité des phares varie avec le régime moteur",

    kind:
      "symptom",

    customerPhrases: [
      "Les phares deviennent plus forts quand j’accélère",
      "Les lumières changent avec le régime moteur",
      "Les phares clignotent légèrement quand j’accélère",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.86,
  },

  {
    id:
      "charging-electrical-functions-weaken",

    label:
      "Les équipements électriques faiblissent progressivement",

    kind:
      "symptom",

    customerPhrases: [
      "Les essuie-glaces ralentissent",
      "La ventilation devient moins forte",
      "Le tableau de bord faiblit en roulant",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.84,
  },

  {
    id:
      "charging-belt-missing-or-broken",

    label:
      "La courroie d’accessoires est absente ou cassée",

    kind:
      "observation",

    customerPhrases: [
      "La courroie est cassée",
      "Il manque la courroie",
      "La courroie d’accessoires n’est plus en place",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.98,
  },

  {
    id:
      "charging-belt-squeals",

    label:
      "Un couinement provient de la courroie d’accessoires",

    kind:
      "symptom",

    customerPhrases: [
      "La courroie couine",
      "J’entends un sifflement côté courroie",
      "Ça couine quand j’accélère",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.78,
  },

  {
    id:
      "charging-burning-smell",

    label:
      "Une odeur de brûlé apparaît près de l’alternateur ou de la courroie",

    kind:
      "symptom",

    customerPhrases: [
      "Ça sent le brûlé près du moteur",
      "Une odeur de caoutchouc brûlé apparaît",
      "Je sens une odeur chaude côté alternateur",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.8,
  },

  {
    id:
      "charging-alternator-noise",

    label:
      "Un grondement ou sifflement provient de l’alternateur",

    kind:
      "symptom",

    customerPhrases: [
      "L’alternateur fait du bruit",
      "J’entends un roulement côté alternateur",
      "Ça gronde près de la courroie",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.82,
  },

  {
    id:
      "charging-voltage-below-13",

    label:
      "La tension moteur tournant reste inférieure à 13 V",

    kind:
      "measurement",

    customerPhrases: [
      "J’ai environ 12 volts moteur tournant",
      "La tension ne monte pas au-dessus de 12,5 volts",
      "L’alternateur ne charge pas à 13 volts",
    ],

    audiences: [
      "bricoleur",
      "vendeur-pieces-auto",
      "mecanicien-garage",
      "depanneur",
    ],

    reliability:
      0.97,
  },

  {
    id:
      "charging-voltage-normal",

    label:
      "La tension moteur tournant se situe entre 13,5 V et 14,8 V",

    kind:
      "measurement",

    customerPhrases: [
      "La charge est à 14 volts",
      "Je mesure 14,2 volts moteur tournant",
      "La tension de charge est normale",
    ],

    audiences: [
      "bricoleur",
      "vendeur-pieces-auto",
      "mecanicien-garage",
      "depanneur",
    ],

    reliability:
      0.97,
  },

  {
    id:
      "charging-voltage-above-15",

    label:
      "La tension moteur tournant dépasse 15 V",

    kind:
      "measurement",

    customerPhrases: [
      "Je mesure plus de 15 volts",
      "La batterie monte à 15,5 volts",
      "La tension de charge est trop élevée",
    ],

    audiences: [
      "bricoleur",
      "vendeur-pieces-auto",
      "mecanicien-garage",
      "depanneur",
    ],

    reliability:
      0.98,
  },

  {
    id:
      "charging-voltage-unstable",

    label:
      "La tension de charge varie fortement",

    kind:
      "measurement",

    customerPhrases: [
      "La tension monte et descend",
      "La charge n’est pas stable",
      "La valeur change sans arrêt au multimètre",
    ],

    audiences: [
      "bricoleur",
      "vendeur-pieces-auto",
      "mecanicien-garage",
      "depanneur",
    ],

    reliability:
      0.93,
  },

  {
    id:
      "charging-bplus-connection-bad",

    label:
      "La connexion positive de l’alternateur est oxydée, desserrée ou endommagée",

    kind:
      "observation",

    customerPhrases: [
      "Le gros câble de l’alternateur est abîmé",
      "La connexion B+ est oxydée",
      "La borne positive de l’alternateur est desserrée",
    ],

    audiences: [
      "bricoleur",
      "vendeur-pieces-auto",
      "mecanicien-garage",
      "depanneur",
    ],

    reliability:
      0.94,
  },

  {
    id:
      "charging-ground-connection-bad",

    label:
      "Une masse moteur ou batterie est oxydée, desserrée ou endommagée",

    kind:
      "observation",

    customerPhrases: [
      "La masse moteur est abîmée",
      "Le câble de masse est oxydé",
      "La connexion négative est mauvaise",
    ],

    audiences: [
      "bricoleur",
      "vendeur-pieces-auto",
      "mecanicien-garage",
      "depanneur",
    ],

    reliability:
      0.92,
  },

  {
    id:
      "charging-main-fuse-blown",

    label:
      "Le fusible principal du circuit de charge est coupé",

    kind:
      "observation",

    customerPhrases: [
      "Le maxi-fusible est grillé",
      "Le fusible de l’alternateur est coupé",
      "Le fusible principal de charge est brûlé",
    ],

    audiences: [
      "bricoleur",
      "vendeur-pieces-auto",
      "mecanicien-garage",
      "depanneur",
    ],

    reliability:
      0.97,
  },

  {
    id:
      "charging-problem-after-belt-work",

    label:
      "Le problème est apparu après une intervention sur la courroie d’accessoires",

    kind:
      "history",

    customerPhrases: [
      "Le problème a commencé après le remplacement de la courroie",
      "Depuis l’intervention sur les accessoires le voyant est allumé",
      "La panne est apparue après avoir travaillé sur la courroie",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.76,
  },

  {
    id:
      "charging-battery-only-drains-parked",

    label:
      "La batterie se vide uniquement lorsque le véhicule est stationné",

    kind:
      "history",

    customerPhrases: [
      "La batterie se vide seulement à l’arrêt",
      "Après une nuit la batterie est vide",
      "Elle se décharge quand la voiture ne roule pas",
    ],

    audiences:
      [...allAudiences],

    reliability:
      0.9,
  },
];
