import type {
  ChargingRule,
} from "./reasoningTypes";

export const chargingRules:
  ChargingRule[] = [
  {
    id:
      "rule-warning-light-support-alternator",

    evidenceId:
      "charging-battery-warning-engine-running",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "support",

    weight:
      0.72,

    explanation:
      "Un voyant batterie allumé moteur tournant indique fréquemment une production de charge insuffisante.",
  },

  {
    id:
      "rule-warning-light-support-regulator",

    evidenceId:
      "charging-battery-warning-engine-running",

    hypothesisId:
      "charging-voltage-regulator-failure",

    effect:
      "support",

    weight:
      0.38,

    explanation:
      "Un régulateur défectueux peut maintenir le voyant batterie allumé.",
  },

  {
    id:
      "rule-driving-drain-support-alternator",

    evidenceId:
      "charging-battery-drains-while-driving",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "support",

    weight:
      0.88,

    explanation:
      "Une batterie qui se vide en roulant indique que les consommateurs utilisent la batterie sans recharge suffisante.",
  },

  {
    id:
      "rule-new-battery-support-alternator",

    evidenceId:
      "charging-new-battery-drains",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "support",

    weight:
      0.7,

    explanation:
      "Une batterie récente qui se décharge oriente vers le circuit de charge plutôt que vers la batterie elle-même.",
  },

  {
    id:
      "rule-rpm-lights-support-regulator",

    evidenceId:
      "charging-lights-vary-with-rpm",

    hypothesisId:
      "charging-voltage-regulator-failure",

    effect:
      "support",

    weight:
      0.78,

    explanation:
      "Une intensité lumineuse variant avec le régime moteur est compatible avec une régulation instable.",
  },

  {
    id:
      "rule-rpm-lights-support-alternator",

    evidenceId:
      "charging-lights-vary-with-rpm",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "support",

    weight:
      0.42,

    explanation:
      "Une production d’alternateur irrégulière peut modifier l’intensité des phares.",
  },

  {
    id:
      "rule-functions-weaken-support-alternator",

    evidenceId:
      "charging-electrical-functions-weaken",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "support",

    weight:
      0.76,

    explanation:
      "Des équipements électriques qui faiblissent en roulant indiquent une tension disponible insuffisante.",
  },

  {
    id:
      "rule-belt-broken-support-belt",

    evidenceId:
      "charging-belt-missing-or-broken",

    hypothesisId:
      "charging-accessory-belt-broken",

    effect:
      "support",

    weight:
      0.99,

    explanation:
      "Une courroie absente ou cassée empêche directement l’entraînement de l’alternateur.",
  },

  {
    id:
      "rule-belt-broken-contradict-internal-alternator",

    evidenceId:
      "charging-belt-missing-or-broken",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "contradict",

    weight:
      0.62,

    explanation:
      "La cause visible est d’abord mécanique avant d’incriminer l’alternateur lui-même.",
  },

  {
    id:
      "rule-belt-squeal-support-slipping",

    evidenceId:
      "charging-belt-squeals",

    hypothesisId:
      "charging-accessory-belt-slipping",

    effect:
      "support",

    weight:
      0.9,

    explanation:
      "Un couinement à l’accélération est typique d’une courroie qui patine ou d’un tendeur insuffisant.",
  },

  {
    id:
      "rule-belt-squeal-support-pulley",

    evidenceId:
      "charging-belt-squeals",

    hypothesisId:
      "charging-overrunning-pulley-failure",

    effect:
      "support",

    weight:
      0.42,

    explanation:
      "Une poulie d’alternateur défectueuse peut perturber la courroie et générer des bruits.",
  },

  {
    id:
      "rule-burning-smell-support-belt",

    evidenceId:
      "charging-burning-smell",

    hypothesisId:
      "charging-accessory-belt-slipping",

    effect:
      "support",

    weight:
      0.68,

    explanation:
      "Une courroie qui patine peut chauffer et produire une odeur de caoutchouc brûlé.",
  },

  {
    id:
      "rule-burning-smell-support-pulley",

    evidenceId:
      "charging-burning-smell",

    hypothesisId:
      "charging-overrunning-pulley-failure",

    effect:
      "support",

    weight:
      0.46,

    explanation:
      "Une poulie ou un roulement bloqué peut faire chauffer la courroie.",
  },

  {
    id:
      "rule-alternator-noise-support-alternator",

    evidenceId:
      "charging-alternator-noise",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "support",

    weight:
      0.54,

    explanation:
      "Un bruit interne peut indiquer un roulement ou un défaut mécanique de l’alternateur.",
  },

  {
    id:
      "rule-alternator-noise-support-pulley",

    evidenceId:
      "charging-alternator-noise",

    hypothesisId:
      "charging-overrunning-pulley-failure",

    effect:
      "support",

    weight:
      0.74,

    explanation:
      "Un bruit côté alternateur peut provenir de la poulie débrayable.",
  },

  {
    id:
      "rule-low-voltage-support-alternator",

    evidenceId:
      "charging-voltage-below-13",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "support",

    weight:
      0.96,

    explanation:
      "Une tension inférieure à 13 V moteur tournant confirme pratiquement une charge insuffisante.",
  },

  {
    id:
      "rule-low-voltage-support-bplus",

    evidenceId:
      "charging-voltage-below-13",

    hypothesisId:
      "charging-bplus-connection-failure",

    effect:
      "support",

    weight:
      0.4,

    explanation:
      "Une mauvaise connexion positive peut empêcher la tension produite d’atteindre la batterie.",
  },

  {
    id:
      "rule-low-voltage-support-ground",

    evidenceId:
      "charging-voltage-below-13",

    hypothesisId:
      "charging-ground-connection-failure",

    effect:
      "support",

    weight:
      0.34,

    explanation:
      "Une mauvaise masse peut provoquer une chute de tension importante.",
  },

  {
    id:
      "rule-normal-voltage-contradict-alternator",

    evidenceId:
      "charging-voltage-normal",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "contradict",

    weight:
      0.9,

    explanation:
      "Une tension normale moteur tournant réduit fortement la probabilité d’un alternateur qui ne charge pas.",
  },

  {
    id:
      "rule-normal-voltage-support-parasitic",

    evidenceId:
      "charging-voltage-normal",

    hypothesisId:
      "charging-parasitic-drain-not-charging-failure",

    effect:
      "support",

    weight:
      0.48,

    explanation:
      "Si la charge est normale mais que la batterie se vide à l’arrêt, une consommation parasite devient plausible.",
  },

  {
    id:
      "rule-high-voltage-support-regulator",

    evidenceId:
      "charging-voltage-above-15",

    hypothesisId:
      "charging-voltage-regulator-failure",

    effect:
      "support",

    weight:
      0.99,

    explanation:
      "Une tension supérieure à 15 V oriente fortement vers un régulateur défectueux.",
  },

  {
    id:
      "rule-high-voltage-contradict-no-charge",

    evidenceId:
      "charging-voltage-above-15",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "contradict",

    weight:
      0.8,

    explanation:
      "Une surtension signifie que l’alternateur produit du courant, mais que sa régulation est incorrecte.",
  },

  {
    id:
      "rule-unstable-voltage-support-regulator",

    evidenceId:
      "charging-voltage-unstable",

    hypothesisId:
      "charging-voltage-regulator-failure",

    effect:
      "support",

    weight:
      0.88,

    explanation:
      "Une tension instable est fortement compatible avec une régulation défectueuse.",
  },

  {
    id:
      "rule-unstable-voltage-support-diode",

    evidenceId:
      "charging-voltage-unstable",

    hypothesisId:
      "charging-alternator-diode-failure",

    effect:
      "support",

    weight:
      0.62,

    explanation:
      "Des diodes internes défectueuses peuvent provoquer une charge irrégulière.",
  },

  {
    id:
      "rule-bplus-bad-support-bplus",

    evidenceId:
      "charging-bplus-connection-bad",

    hypothesisId:
      "charging-bplus-connection-failure",

    effect:
      "support",

    weight:
      0.98,

    explanation:
      "Une borne B+ visiblement oxydée ou desserrée constitue une preuve directe.",
  },

  {
    id:
      "rule-bplus-bad-contradict-alternator",

    evidenceId:
      "charging-bplus-connection-bad",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "contradict",

    weight:
      0.5,

    explanation:
      "Une mauvaise connexion doit être corrigée avant de condamner l’alternateur.",
  },

  {
    id:
      "rule-ground-bad-support-ground",

    evidenceId:
      "charging-ground-connection-bad",

    hypothesisId:
      "charging-ground-connection-failure",

    effect:
      "support",

    weight:
      0.98,

    explanation:
      "Une masse détériorée est une cause directe de chute de tension.",
  },

  {
    id:
      "rule-main-fuse-support-fuse",

    evidenceId:
      "charging-main-fuse-blown",

    hypothesisId:
      "charging-main-fuse-failure",

    effect:
      "support",

    weight:
      0.99,

    explanation:
      "Un fusible principal coupé interrompt directement le circuit de charge.",
  },

  {
    id:
      "rule-main-fuse-contradict-alternator",

    evidenceId:
      "charging-main-fuse-blown",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "contradict",

    weight:
      0.58,

    explanation:
      "Le courant peut être produit par l’alternateur mais bloqué par le fusible principal.",
  },

  {
    id:
      "rule-after-belt-work-support-belt",

    evidenceId:
      "charging-problem-after-belt-work",

    hypothesisId:
      "charging-accessory-belt-slipping",

    effect:
      "support",

    weight:
      0.52,

    explanation:
      "Un problème apparu après une intervention sur la courroie peut provenir d’un montage ou d’une tension incorrecte.",
  },

  {
    id:
      "rule-after-belt-work-support-pulley",

    evidenceId:
      "charging-problem-after-belt-work",

    hypothesisId:
      "charging-overrunning-pulley-failure",

    effect:
      "support",

    weight:
      0.32,

    explanation:
      "Une poulie ou un tendeur peut avoir été mal remonté ou révéler un défaut après intervention.",
  },

  {
    id:
      "rule-parked-drain-support-parasitic",

    evidenceId:
      "charging-battery-only-drains-parked",

    hypothesisId:
      "charging-parasitic-drain-not-charging-failure",

    effect:
      "support",

    weight:
      0.9,

    explanation:
      "Une décharge uniquement à l’arrêt oriente d’abord vers une consommation parasite.",
  },

  {
    id:
      "rule-parked-drain-support-diode",

    evidenceId:
      "charging-battery-only-drains-parked",

    hypothesisId:
      "charging-alternator-diode-failure",

    effect:
      "support",

    weight:
      0.38,

    explanation:
      "Une diode d’alternateur en fuite peut décharger la batterie lorsque le véhicule est arrêté.",
  },

  {
    id:
      "rule-parked-drain-contradict-no-charge",

    evidenceId:
      "charging-battery-only-drains-parked",

    hypothesisId:
      "charging-alternator-not-charging",

    effect:
      "contradict",

    weight:
      0.52,

    explanation:
      "Une batterie qui se vide uniquement à l’arrêt ne désigne pas directement un alternateur qui ne charge pas.",
  },
];
