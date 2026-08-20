import type {
  ChargingHypothesis,
} from "./types";

export const chargingHypotheses:
  ChargingHypothesis[] = [
  {
    id:
      "charging-alternator-not-charging",

    label:
      "Alternateur ne produisant plus suffisamment de courant",

    description:
      "L’alternateur ne recharge plus correctement la batterie lorsque le moteur tourne.",

    primaryPartId:
      "part-alternator",

    alternativePartIds: [
      "part-voltage-regulator",
    ],

    recommendedChecks: [
      "Contrôler la tension moteur tournant",
      "Vérifier la courroie d’accessoires",
      "Contrôler le câble positif B+",
    ],

    minimumEvidenceCount:
      2,
  },

  {
    id:
      "charging-voltage-regulator-failure",

    label:
      "Régulateur de tension défectueux",

    description:
      "Le régulateur ne stabilise plus correctement la tension produite par l’alternateur.",

    primaryPartId:
      "part-voltage-regulator",

    alternativePartIds: [
      "part-alternator",
    ],

    recommendedChecks: [
      "Mesurer la tension au ralenti",
      "Mesurer la tension en accélérant",
      "Vérifier si la tension dépasse 15 V",
    ],

    minimumEvidenceCount:
      2,
  },

  {
    id:
      "charging-alternator-diode-failure",

    label:
      "Diodes d’alternateur défectueuses",

    description:
      "Une ou plusieurs diodes internes peuvent provoquer une charge insuffisante, instable ou une décharge à l’arrêt.",

    primaryPartId:
      "part-alternator",

    alternativePartIds: [],

    recommendedChecks: [
      "Contrôler l’ondulation alternative",
      "Vérifier la décharge à l’arrêt",
      "Tester l’alternateur sur banc",
    ],

    minimumEvidenceCount:
      2,
  },

  {
    id:
      "charging-accessory-belt-broken",

    label:
      "Courroie d’accessoires cassée ou absente",

    description:
      "L’alternateur n’est plus entraîné mécaniquement par le moteur.",

    primaryPartId:
      "part-accessory-belt",

    alternativePartIds: [
      "part-belt-tensioner",
    ],

    recommendedChecks: [
      "Contrôler visuellement la présence de la courroie",
      "Vérifier les galets et poulies",
    ],

    minimumEvidenceCount:
      1,
  },

  {
    id:
      "charging-accessory-belt-slipping",

    label:
      "Courroie d’accessoires détendue ou glissante",

    description:
      "La courroie patine et n’entraîne pas correctement l’alternateur.",

    primaryPartId:
      "part-accessory-belt",

    alternativePartIds: [
      "part-belt-tensioner",
      "part-overrunning-pulley",
    ],

    recommendedChecks: [
      "Observer l’état de la courroie",
      "Contrôler la tension",
      "Écouter les couinements à l’accélération",
    ],

    minimumEvidenceCount:
      2,
  },

  {
    id:
      "charging-overrunning-pulley-failure",

    label:
      "Poulie débrayable d’alternateur défectueuse",

    description:
      "La poulie peut se bloquer, patiner ou provoquer des vibrations et des bruits côté accessoires.",

    primaryPartId:
      "part-overrunning-pulley",

    alternativePartIds: [
      "part-alternator",
      "part-belt-tensioner",
    ],

    recommendedChecks: [
      "Observer les vibrations du tendeur",
      "Contrôler la poulie débrayable",
      "Écouter les bruits lors de l’arrêt moteur",
    ],

    minimumEvidenceCount:
      2,
  },

  {
    id:
      "charging-bplus-connection-failure",

    label:
      "Connexion positive d’alternateur défectueuse",

    description:
      "Une mauvaise liaison B+ empêche le courant produit par l’alternateur d’atteindre correctement la batterie.",

    primaryPartId:
      "part-alternator-cable",

    alternativePartIds: [
      "part-battery-terminal",
    ],

    recommendedChecks: [
      "Contrôler le serrage de la borne B+",
      "Rechercher de l’oxydation",
      "Mesurer la chute de tension du câble positif",
    ],

    minimumEvidenceCount:
      2,
  },

  {
    id:
      "charging-ground-connection-failure",

    label:
      "Masse moteur ou batterie défectueuse",

    description:
      "Une mauvaise masse peut provoquer une charge insuffisante ou instable.",

    primaryPartId:
      "part-ground-cable",

    alternativePartIds: [
      "part-battery-terminal",
    ],

    recommendedChecks: [
      "Contrôler les câbles de masse",
      "Nettoyer et resserrer les connexions",
      "Mesurer la chute de tension côté masse",
    ],

    minimumEvidenceCount:
      2,
  },

  {
    id:
      "charging-main-fuse-failure",

    label:
      "Fusible principal du circuit de charge coupé",

    description:
      "Le courant de l’alternateur n’atteint plus la batterie à cause d’un maxi-fusible ou fusible principal défectueux.",

    primaryPartId:
      "part-main-charging-fuse",

    alternativePartIds: [],

    recommendedChecks: [
      "Contrôler le maxi-fusible",
      "Rechercher la cause de la coupure",
      "Vérifier le câblage avant remplacement",
    ],

    minimumEvidenceCount:
      1,
  },

  {
    id:
      "charging-parasitic-drain-not-charging-failure",

    label:
      "Décharge électrique à l’arrêt, sans panne directe du circuit de charge",

    description:
      "La batterie se vide véhicule stationné alors que la tension de charge peut être normale.",

    primaryPartId:
      null,

    alternativePartIds: [],

    recommendedChecks: [
      "Mesurer la consommation à l’arrêt",
      "Contrôler les équipements restant alimentés",
      "Vérifier l’alternateur pour une diode en fuite",
    ],

    minimumEvidenceCount:
      2,
  },
];
