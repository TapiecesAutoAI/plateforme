const fs = require("fs");

const file =
  "./knowledge/battery/actions.json";

const audiences = [
  "particulier",
  "bricoleur",
  "vendeur-pieces-auto",
  "mecanicien-garage",
  "depanneur",
];

const actions = [

  // ============================================================
  // 1. ENTREE
  // ============================================================

  {
    id: "battery-main-symptom",
    workflowId: "battery",
    type: "ask-question",
    text: "Quel est le principal problème lié à la batterie ?",
    audiences,
    complexity: "simple",
    priority: 1,
    options: [
      {
        id: "flat",
        label: "La batterie est complètement à plat",
        value: "La batterie semble complètement déchargée.",
        addsEvidence: [
          "symptom-battery-flat",
        ],
        nextActionId:
          "battery-age",
      },
      {
        id: "weak",
        label: "La batterie semble faible",
        value: "La batterie semble faible.",
        addsEvidence: [
          "symptom-battery-weak",
        ],
        nextActionId:
          "battery-dashboard-behaviour",
      },
      {
        id: "drains",
        label: "La batterie se décharge toute seule",
        value: "La batterie se décharge anormalement.",
        addsEvidence: [
          "symptom-battery-drains",
        ],
        nextActionId:
          "battery-discharge-speed",
      },
      {
        id: "warning-light",
        label: "Le voyant batterie est allumé",
        value: "Le voyant batterie présente un comportement anormal.",
        addsEvidence: [
          "symptom-battery-warning-light",
        ],
        nextActionId:
          "battery-light-behaviour",
      },
      {
        id: "replacement-check",
        label: "Je veux vérifier si la batterie montée est correcte",
        value: "La compatibilité de la batterie doit être contrôlée.",
        addsEvidence: [
          "symptom-battery-replacement-check",
        ],
        nextActionId:
          "battery-specification-check",
      },
    ],
  },

  // ============================================================
  // 2. ETAT GENERAL / AGE
  // ============================================================

  {
    id: "battery-dashboard-behaviour",
    workflowId: "battery",
    type: "ask-question",
    text: "Comment réagissent les voyants et équipements électriques ?",
    audiences,
    complexity: "simple",
    priority: 2,
    options: [
      {
        id: "dim",
        label: "Les voyants faiblissent",
        value: "Les voyants sont faibles.",
        addsEvidence: [
          "observation-dashboard-lights-dim",
        ],
        nextActionId:
          "battery-age",
      },
      {
        id: "normal",
        label: "Les voyants restent normaux",
        value: "Les voyants restent normaux.",
        addsEvidence: [
          "observation-dashboard-lights-normal",
        ],
        nextActionId:
          "battery-age",
      },
      {
        id: "unstable",
        label: "Les voyants sont instables",
        value: "Les voyants présentent des variations.",
        addsEvidence: [
          "observation-dashboard-lights-unstable",
        ],
        nextActionId:
          "battery-age",
      },
      {
        id: "none",
        label: "Aucun voyant ne s'allume",
        value: "Aucun voyant ne s'allume.",
        addsEvidence: [
          "observation-dashboard-no-lights",
        ],
        nextActionId:
          "battery-terminals-check",
      },
    ],
  },

  {
    id: "battery-age",
    workflowId: "battery",
    type: "ask-question",
    text: "Quel est l'âge approximatif de la batterie ?",
    audiences,
    complexity: "simple",
    priority: 3,
    options: [
      {
        id: "under-two",
        label: "Moins de 2 ans",
        value: "La batterie a moins de deux ans.",
        addsEvidence: [
          "observation-battery-age-under-two",
        ],
        nextActionId:
          "battery-case-check",
      },
      {
        id: "two-to-four",
        label: "Entre 2 et 4 ans",
        value: "La batterie a entre deux et quatre ans.",
        addsEvidence: [
          "observation-battery-age-two-to-four",
        ],
        nextActionId:
          "battery-case-check",
      },
      {
        id: "over-four",
        label: "Plus de 4 ans",
        value: "La batterie a plus de quatre ans.",
        addsEvidence: [
          "observation-battery-age-over-four",
        ],
        nextActionId:
          "battery-case-check",
      },
      {
        id: "unknown",
        label: "Je ne sais pas",
        value: "L'âge de la batterie est inconnu.",
        nextActionId:
          "battery-case-check",
      },
    ],
  },

  {
    id: "battery-case-check",
    workflowId: "battery",
    type: "request-observation",
    text: "Quel est l'état physique de la batterie ?",
    audiences,
    complexity: "simple",
    priority: 4,
    options: [
      {
        id: "normal",
        label: "Aspect normal",
        value: "Le boîtier de batterie semble normal.",
        addsEvidence: [
          "observation-battery-case-normal",
        ],
        nextActionId:
          "battery-rest-voltage-known",
      },
      {
        id: "swollen",
        label: "Batterie gonflée",
        value: "Le boîtier de batterie est gonflé.",
        addsEvidence: [
          "observation-battery-case-swollen",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "leaking",
        label: "Fuite visible",
        value: "Une fuite est visible sur la batterie.",
        addsEvidence: [
          "observation-battery-case-leaking",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "hot",
        label: "Batterie anormalement chaude",
        value: "La batterie est anormalement chaude.",
        addsEvidence: [
          "observation-battery-case-hot",
        ],
        nextActionId:
          "battery-charging-voltage-known",
      },
    ],
  },

  // ============================================================
  // 3. TENSION AU REPOS
  // ============================================================

  {
    id: "battery-rest-voltage-known",
    workflowId: "battery",
    type: "ask-question",
    text: "La tension de la batterie au repos est-elle connue ?",
    audiences,
    complexity: "simple",
    priority: 5,
    options: [
      {
        id: "yes",
        label: "Oui",
        value: "La tension au repos est connue.",
        nextActionId:
          "battery-rest-voltage-value",
      },
      {
        id: "no",
        label: "Non",
        value: "La tension au repos n'est pas connue.",
        nextActionId:
          "battery-terminals-check",
      },
      {
        id: "no-meter",
        label: "Je n'ai pas de multimètre",
        value: "Aucun multimètre n'est disponible.",
        nextActionId:
          "battery-terminals-check",
      },
    ],
  },

  {
    id: "battery-rest-voltage-value",
    workflowId: "battery",
    type: "request-measurement",
    text: "Quelle est la tension de la batterie au repos ?",
    audiences,
    complexity: "intermediate",
    priority: 6,
    options: [
      {
        id: "below-11-8",
        label: "Moins de 11,8 V",
        value: "La tension au repos est inférieure à 11,8 V.",
        addsEvidence: [
          "measurement-rest-voltage-below-11-8",
        ],
        nextActionId:
          "battery-terminals-check",
      },
      {
        id: "11-8-to-12-2",
        label: "Entre 11,8 V et 12,2 V",
        value: "La tension au repos est comprise entre 11,8 V et 12,2 V.",
        addsEvidence: [
          "measurement-rest-voltage-11-8-to-12-2",
        ],
        nextActionId:
          "battery-terminals-check",
      },
      {
        id: "12-2-to-12-5",
        label: "Entre 12,2 V et 12,5 V",
        value: "La tension au repos est comprise entre 12,2 V et 12,5 V.",
        addsEvidence: [
          "measurement-rest-voltage-12-2-to-12-5",
        ],
        nextActionId:
          "battery-terminals-check",
      },
      {
        id: "above-12-5",
        label: "12,5 V ou plus",
        value: "La tension au repos est égale ou supérieure à 12,5 V.",
        addsEvidence: [
          "measurement-rest-voltage-above-12-5",
        ],
        nextActionId:
          "battery-terminals-check",
      },
    ],
  },

  // ============================================================
  // 4. BORNES / MASSES
  // ============================================================

  {
    id: "battery-terminals-check",
    workflowId: "battery",
    type: "request-observation",
    text: "Les bornes et cosses de batterie sont-elles propres et correctement serrées ?",
    audiences,
    complexity: "simple",
    priority: 7,
    options: [
      {
        id: "bad",
        label: "Non, elles sont mauvaises",
        value: "Les bornes ou cosses présentent un défaut.",
        addsEvidence: [
          "observation-battery-terminals-bad",
        ],
        nextActionId:
          "battery-terminal-correction",
      },
      {
        id: "good",
        label: "Oui, elles sont correctes",
        value: "Les bornes et cosses sont correctes.",
        addsEvidence: [
          "observation-battery-terminals-good",
        ],
        nextActionId:
          "battery-ground-check",
      },
      {
        id: "unknown",
        label: "Je ne sais pas",
        value: "L'état des bornes n'est pas connu.",
        nextActionId:
          "battery-ground-check",
      },
    ],
  },

  {
    id: "battery-terminal-correction",
    workflowId: "battery",
    type: "request-observation",
    text: "Après nettoyage et serrage des bornes, le problème a-t-il disparu ?",
    audiences,
    complexity: "simple",
    priority: 8,
    options: [
      {
        id: "success",
        label: "Oui",
        value: "Le problème disparaît après correction des bornes.",
        addsEvidence: [
          "observation-terminal-correction-success",
        ],
        supportsHypotheses: [
          "problem-battery-connections",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "improved",
        label: "C'est mieux mais pas totalement",
        value: "La correction des bornes améliore le comportement.",
        addsEvidence: [
          "observation-terminal-correction-improved",
        ],
        nextActionId:
          "battery-ground-check",
      },
      {
        id: "failed",
        label: "Aucun changement",
        value: "La correction des bornes ne résout pas le problème.",
        addsEvidence: [
          "observation-terminal-correction-failed",
        ],
        nextActionId:
          "battery-ground-check",
      },
    ],
  },

  {
    id: "battery-ground-check",
    workflowId: "battery",
    type: "request-observation",
    text: "La liaison de masse batterie/moteur semble-t-elle correcte ?",
    audiences,
    complexity: "intermediate",
    priority: 9,
    options: [
      {
        id: "bad",
        label: "Non",
        value: "Une liaison de masse semble défectueuse.",
        addsEvidence: [
          "observation-battery-ground-bad",
        ],
        nextActionId:
          "battery-ground-correction",
      },
      {
        id: "good",
        label: "Oui",
        value: "Les liaisons de masse semblent correctes.",
        addsEvidence: [
          "observation-battery-ground-good",
        ],
        nextActionId:
          "battery-jump-start-test",
      },
      {
        id: "unknown",
        label: "Je ne sais pas",
        value: "L'état de la masse n'est pas connu.",
        nextActionId:
          "battery-jump-start-test",
      },
    ],
  },

  {
    id: "battery-ground-correction",
    workflowId: "battery",
    type: "request-observation",
    text: "Après correction de la masse, le problème est-il résolu ?",
    audiences,
    complexity: "intermediate",
    priority: 10,
    options: [
      {
        id: "success",
        label: "Oui",
        value: "La correction de la masse résout le problème.",
        addsEvidence: [
          "observation-ground-correction-success",
        ],
        supportsHypotheses: [
          "problem-ground-connection",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "failed",
        label: "Non",
        value: "La correction de la masse ne résout pas le problème.",
        addsEvidence: [
          "observation-ground-correction-failed",
        ],
        nextActionId:
          "battery-jump-start-test",
      },
    ],
  },

  // ============================================================
  // 5. BOOSTER / REDEMARRAGE
  // ============================================================

  {
    id: "battery-jump-start-test",
    workflowId: "battery",
    type: "request-observation",
    text: "Le véhicule démarre-t-il avec un booster ou des câbles ?",
    audiences,
    complexity: "simple",
    priority: 11,
    options: [
      {
        id: "success",
        label: "Oui",
        value: "Le démarrage avec assistance réussit.",
        addsEvidence: [
          "observation-jump-start-success",
        ],
        nextActionId:
          "battery-restart-after-jump",
      },
      {
        id: "fails",
        label: "Non",
        value: "Le démarrage avec assistance échoue.",
        addsEvidence: [
          "observation-jump-start-fails",
        ],
        nextActionId:
          "battery-cranking-voltage-known",
      },
      {
        id: "not-tested",
        label: "Test non effectué",
        value: "Le test avec booster n'a pas été effectué.",
        nextActionId:
          "battery-cranking-voltage-known",
      },
    ],
  },

  {
    id: "battery-restart-after-jump",
    workflowId: "battery",
    type: "request-observation",
    text: "Après avoir roulé ou chargé la batterie, le véhicule redémarre-t-il seul ?",
    audiences,
    complexity: "simple",
    priority: 12,
    options: [
      {
        id: "success",
        label: "Oui",
        value: "Le véhicule redémarre normalement.",
        addsEvidence: [
          "observation-restart-after-jump-success",
        ],
        nextActionId:
          "battery-post-charge-voltage-known",
      },
      {
        id: "fails",
        label: "Non",
        value: "Le véhicule ne redémarre pas correctement.",
        addsEvidence: [
          "observation-restart-after-jump-fails",
        ],
        nextActionId:
          "battery-post-charge-voltage-known",
      },
    ],
  },

  // ============================================================
  // 6. TENSION APRES CHARGE
  // ============================================================

  {
    id: "battery-post-charge-voltage-known",
    workflowId: "battery",
    type: "ask-question",
    text: "La tension après recharge complète est-elle connue ?",
    audiences,
    complexity: "intermediate",
    priority: 13,
    options: [
      {
        id: "yes",
        label: "Oui",
        value: "La tension après charge est connue.",
        addsEvidence: [
          "observation-battery-fully-charged",
        ],
        nextActionId:
          "battery-post-charge-voltage-value",
      },
      {
        id: "no",
        label: "Non",
        value: "La recharge complète n'a pas été confirmée.",
        addsEvidence: [
          "observation-battery-charge-incomplete",
        ],
        nextActionId:
          "battery-test-known",
      },
    ],
  },

  {
    id: "battery-post-charge-voltage-value",
    workflowId: "battery",
    type: "request-measurement",
    text: "Quelle tension reste présente après recharge et repos ?",
    audiences,
    complexity: "intermediate",
    priority: 14,
    options: [
      {
        id: "below-12-2",
        label: "Moins de 12,2 V",
        value: "La tension après charge reste inférieure à 12,2 V.",
        addsEvidence: [
          "measurement-post-charge-below-12-2",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "12-2-to-12-5",
        label: "Entre 12,2 V et 12,5 V",
        value: "La tension après charge est comprise entre 12,2 V et 12,5 V.",
        addsEvidence: [
          "measurement-post-charge-12-2-to-12-5",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "above-12-5",
        label: "Plus de 12,5 V",
        value: "La tension après charge est supérieure à 12,5 V.",
        addsEvidence: [
          "measurement-post-charge-above-12-5",
        ],
        nextActionId:
          "battery-test-known",
      },
    ],
  },

  // ============================================================
  // 7. TEST BATTERIE
  // ============================================================

  {
    id: "battery-test-known",
    workflowId: "battery",
    type: "ask-question",
    text: "Un testeur de batterie a-t-il été utilisé ?",
    audiences,
    complexity: "intermediate",
    priority: 15,
    options: [
      {
        id: "yes",
        label: "Oui",
        value: "Un test batterie a été effectué.",
        nextActionId:
          "battery-test-result",
      },
      {
        id: "no",
        label: "Non",
        value: "Aucun testeur de batterie n'a été utilisé.",
        nextActionId:
          "battery-charging-voltage-known",
      },
    ],
  },

  {
    id: "battery-test-result",
    workflowId: "battery",
    type: "request-measurement",
    text: "Quel est le résultat du test de batterie ?",
    audiences,
    complexity: "intermediate",
    priority: 16,
    options: [
      {
        id: "good",
        label: "Batterie bonne",
        value: "Le test indique que la batterie est bonne.",
        addsEvidence: [
          "measurement-battery-test-good",
        ],
        nextActionId:
          "battery-charging-voltage-known",
      },
      {
        id: "bad-cell",
        label: "Élément interne défectueux",
        value: "Le test détecte un élément interne défectueux.",
        addsEvidence: [
          "measurement-battery-test-bad-cell",
        ],
        supportsHypotheses: [
          "problem-internal-battery-failure",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "replace",
        label: "Batterie à remplacer",
        value: "Le test recommande le remplacement de la batterie.",
        addsEvidence: [
          "measurement-battery-test-replace",
        ],
        supportsHypotheses: [
          "problem-internal-battery-failure",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "recharge-retest",
        label: "Recharger puis retester",
        value: "Le test demande une recharge puis un nouveau contrôle.",
        addsEvidence: [
          "measurement-battery-test-recharge-retest",
        ],
        nextActionId:
          "battery-charging-voltage-known",
      },
    ],
  },

  // ============================================================
  // 8. TENSION AU DEMARRAGE
  // ============================================================

  {
    id: "battery-cranking-voltage-known",
    workflowId: "battery",
    type: "ask-question",
    text: "La tension pendant le démarrage est-elle connue ?",
    audiences,
    complexity: "intermediate",
    priority: 17,
    options: [
      {
        id: "yes",
        label: "Oui",
        value: "La tension pendant le démarrage est connue.",
        nextActionId:
          "battery-cranking-voltage-value",
      },
      {
        id: "no",
        label: "Non",
        value: "La tension pendant le démarrage n'est pas connue.",
        nextActionId:
          "battery-test-known",
      },
    ],
  },

  {
    id: "battery-cranking-voltage-value",
    workflowId: "battery",
    type: "request-measurement",
    text: "Quelle est la tension minimale pendant l'action du démarreur ?",
    audiences,
    complexity: "intermediate",
    priority: 18,
    options: [
      {
        id: "below-8",
        label: "Moins de 8 V",
        value: "La tension descend sous 8 V.",
        addsEvidence: [
          "measurement-cranking-voltage-below-8",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "8-to-9-6",
        label: "Entre 8 V et 9,6 V",
        value: "La tension est comprise entre 8 V et 9,6 V.",
        addsEvidence: [
          "measurement-cranking-voltage-8-to-9-6",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "9-6-to-10-5",
        label: "Entre 9,6 V et 10,5 V",
        value: "La tension est comprise entre 9,6 V et 10,5 V.",
        addsEvidence: [
          "measurement-cranking-voltage-9-6-to-10-5",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "above-10-5",
        label: "Plus de 10,5 V",
        value: "La tension reste supérieure à 10,5 V.",
        addsEvidence: [
          "measurement-cranking-voltage-above-10-5",
        ],
        nextActionId:
          "battery-charging-voltage-known",
      },
    ],
  },

  // ============================================================
  // 9. CIRCUIT DE CHARGE
  // ============================================================

  {
    id: "battery-light-behaviour",
    workflowId: "battery",
    type: "ask-question",
    text: "Quand le voyant batterie est-il allumé ?",
    audiences,
    complexity: "simple",
    priority: 19,
    options: [
      {
        id: "engine-running",
        label: "Il reste allumé moteur tournant",
        value: "Le voyant batterie reste allumé moteur tournant.",
        addsEvidence: [
          "observation-battery-light-engine-running",
        ],
        nextActionId:
          "battery-charging-voltage-known",
      },
      {
        id: "intermittent",
        label: "Il s'allume par intermittence",
        value: "Le voyant batterie est intermittent.",
        addsEvidence: [
          "observation-battery-light-intermittent",
        ],
        nextActionId:
          "battery-charging-voltage-known",
      },
      {
        id: "off-running",
        label: "Il s'éteint moteur tournant",
        value: "Le voyant batterie s'éteint moteur tournant.",
        addsEvidence: [
          "observation-battery-light-off-running",
        ],
        nextActionId:
          "battery-charging-voltage-known",
      },
      {
        id: "engine-off-only",
        label: "Seulement moteur arrêté",
        value: "Le voyant batterie est visible uniquement moteur arrêté.",
        addsEvidence: [
          "observation-battery-light-engine-off-only",
        ],
        nextActionId:
          "battery-charging-voltage-known",
      },
    ],
  },

  {
    id: "battery-charging-voltage-known",
    workflowId: "battery",
    type: "ask-question",
    text: "La tension moteur tournant est-elle connue ?",
    audiences,
    complexity: "intermediate",
    priority: 20,
    options: [
      {
        id: "yes",
        label: "Oui",
        value: "La tension de charge est connue.",
        nextActionId:
          "battery-charging-voltage-value",
      },
      {
        id: "no",
        label: "Non",
        value: "La tension de charge n'est pas connue.",
        nextActionId:
          "battery-belt-check",
      },
    ],
  },

  {
    id: "battery-charging-voltage-value",
    workflowId: "battery",
    type: "request-measurement",
    text: "Quelle tension mesurez-vous moteur tournant ?",
    audiences,
    complexity: "intermediate",
    priority: 21,
    options: [
      {
        id: "below-12-8",
        label: "Moins de 12,8 V",
        value: "La tension de charge est inférieure à 12,8 V.",
        addsEvidence: [
          "measurement-charging-voltage-below-12-8",
        ],
        nextActionId:
          "battery-belt-check",
      },
      {
        id: "12-8-to-13-5",
        label: "Entre 12,8 V et 13,5 V",
        value: "La tension de charge est comprise entre 12,8 V et 13,5 V.",
        addsEvidence: [
          "measurement-charging-voltage-12-8-to-13-5",
        ],
        nextActionId:
          "battery-charging-load-known",
      },
      {
        id: "13-5-to-14-8",
        label: "Entre 13,5 V et 14,8 V",
        value: "La tension de charge est comprise entre 13,5 V et 14,8 V.",
        addsEvidence: [
          "measurement-charging-voltage-13-5-to-14-8",
        ],
        nextActionId:
          "battery-charging-load-known",
      },
      {
        id: "above-14-8",
        label: "Plus de 14,8 V",
        value: "La tension de charge dépasse 14,8 V.",
        addsEvidence: [
          "measurement-charging-voltage-above-14-8",
        ],
        supportsHypotheses: [
          "problem-voltage-regulator",
        ],
        nextActionId:
          "battery-conclude",
      },
    ],
  },

  {
    id: "battery-belt-check",
    workflowId: "battery",
    type: "request-observation",
    text: "Quel est l'état de la courroie d'accessoires ?",
    audiences,
    complexity: "intermediate",
    priority: 22,
    options: [
      {
        id: "missing",
        label: "Absente ou cassée",
        value: "La courroie est absente ou cassée.",
        addsEvidence: [
          "observation-accessory-belt-missing",
        ],
        supportsHypotheses: [
          "problem-accessory-belt",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "loose",
        label: "Détendue ou patine",
        value: "La courroie est détendue ou patine.",
        addsEvidence: [
          "observation-accessory-belt-loose",
        ],
        supportsHypotheses: [
          "problem-accessory-belt",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "normal",
        label: "Normale",
        value: "La courroie semble normale.",
        addsEvidence: [
          "observation-accessory-belt-normal",
        ],
        nextActionId:
          "battery-alternator-connection-check",
      },
    ],
  },

  {
    id: "battery-alternator-connection-check",
    workflowId: "battery",
    type: "request-observation",
    text: "Les connexions de l'alternateur semblent-elles correctes ?",
    audiences,
    complexity: "intermediate",
    priority: 23,
    options: [
      {
        id: "bad",
        label: "Non",
        value: "Une connexion d'alternateur semble mauvaise.",
        addsEvidence: [
          "observation-alternator-connection-bad",
        ],
        nextActionId:
          "battery-alternator-connection-correction",
      },
      {
        id: "good",
        label: "Oui",
        value: "Les connexions de l'alternateur semblent correctes.",
        addsEvidence: [
          "observation-alternator-connection-good",
        ],
        nextActionId:
          "battery-charging-load-known",
      },
    ],
  },

  {
    id: "battery-alternator-connection-correction",
    workflowId: "battery",
    type: "request-observation",
    text: "Après correction de la connexion, la charge est-elle redevenue normale ?",
    audiences,
    complexity: "intermediate",
    priority: 24,
    options: [
      {
        id: "success",
        label: "Oui",
        value: "La correction rétablit le fonctionnement.",
        addsEvidence: [
          "observation-alternator-connection-correction-success",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "failed",
        label: "Non",
        value: "La correction ne résout pas le problème.",
        addsEvidence: [
          "observation-alternator-connection-correction-failed",
        ],
        nextActionId:
          "battery-charging-load-known",
      },
    ],
  },

  {
    id: "battery-charging-load-known",
    workflowId: "battery",
    type: "ask-question",
    text: "Une mesure de charge avec consommateurs électriques a-t-elle été réalisée ?",
    audiences,
    complexity: "intermediate",
    priority: 25,
    options: [
      {
        id: "yes",
        label: "Oui",
        value: "Une mesure sous charge a été réalisée.",
        nextActionId:
          "battery-charging-load-value",
      },
      {
        id: "no",
        label: "Non",
        value: "Aucune mesure sous charge n'a été réalisée.",
        nextActionId:
          "battery-conclude",
      },
    ],
  },

  {
    id: "battery-charging-load-value",
    workflowId: "battery",
    type: "request-measurement",
    text: "Quelle est la tension avec les consommateurs électriques activés ?",
    audiences,
    complexity: "technical",
    priority: 26,
    options: [
      {
        id: "below-12-8",
        label: "Moins de 12,8 V",
        value: "La tension sous charge descend sous 12,8 V.",
        addsEvidence: [
          "measurement-charging-under-load-below-12-8",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "12-8-to-13-5",
        label: "Entre 12,8 V et 13,5 V",
        value: "La tension sous charge est comprise entre 12,8 V et 13,5 V.",
        addsEvidence: [
          "measurement-charging-under-load-12-8-to-13-5",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "above-13-5",
        label: "Plus de 13,5 V",
        value: "La tension sous charge reste supérieure à 13,5 V.",
        addsEvidence: [
          "measurement-charging-under-load-above-13-5",
        ],
        nextActionId:
          "battery-conclude",
      },
    ],
  },

  // ============================================================
  // 10. DECHARGE PARASITE
  // ============================================================

  {
    id: "battery-discharge-speed",
    workflowId: "battery",
    type: "ask-question",
    text: "En combien de temps la batterie se décharge-t-elle ?",
    audiences,
    complexity: "simple",
    priority: 27,
    options: [
      {
        id: "hours",
        label: "En quelques heures",
        value: "La batterie se décharge en quelques heures.",
        addsEvidence: [
          "observation-discharge-within-hours",
        ],
        nextActionId:
          "battery-parasitic-consumer",
      },
      {
        id: "overnight",
        label: "Pendant la nuit",
        value: "La batterie se décharge pendant la nuit.",
        addsEvidence: [
          "observation-discharge-overnight",
        ],
        nextActionId:
          "battery-parasitic-consumer",
      },
      {
        id: "days",
        label: "En quelques jours",
        value: "La batterie se décharge en quelques jours.",
        addsEvidence: [
          "observation-discharge-after-days",
        ],
        nextActionId:
          "battery-usage-pattern",
      },
      {
        id: "weeks",
        label: "Après plusieurs semaines",
        value: "La batterie se décharge après plusieurs semaines.",
        addsEvidence: [
          "observation-discharge-after-weeks",
        ],
        nextActionId:
          "battery-usage-pattern",
      },
    ],
  },

  {
    id: "battery-usage-pattern",
    workflowId: "battery",
    type: "ask-question",
    text: "Quel type d'utilisation le véhicule a-t-il principalement ?",
    audiences,
    complexity: "simple",
    priority: 28,
    options: [
      {
        id: "short-trips",
        label: "Beaucoup de petits trajets",
        value: "Le véhicule effectue fréquemment de courts trajets.",
        addsEvidence: [
          "observation-frequent-short-trips",
        ],
        nextActionId:
          "battery-parasitic-current-known",
      },
      {
        id: "storage",
        label: "Longues périodes sans rouler",
        value: "Le véhicule reste longtemps immobilisé.",
        addsEvidence: [
          "observation-long-storage",
        ],
        nextActionId:
          "battery-parasitic-current-known",
      },
      {
        id: "normal",
        label: "Utilisation normale",
        value: "Le véhicule est utilisé normalement.",
        addsEvidence: [
          "observation-normal-use",
        ],
        nextActionId:
          "battery-parasitic-current-known",
      },
    ],
  },

  {
    id: "battery-parasitic-consumer",
    workflowId: "battery",
    type: "ask-question",
    text: "Un consommateur électrique restant actif est-il suspecté ?",
    audiences,
    complexity: "simple",
    priority: 29,
    options: [
      {
        id: "known",
        label: "Oui, un consommateur est identifié",
        value: "Un consommateur parasite est connu.",
        addsEvidence: [
          "observation-parasitic-consumer-known",
        ],
        nextActionId:
          "battery-parasitic-current-known",
      },
      {
        id: "possible",
        label: "C'est possible",
        value: "Un consommateur parasite est possible.",
        addsEvidence: [
          "observation-parasitic-consumer-possible",
        ],
        nextActionId:
          "battery-parasitic-current-known",
      },
      {
        id: "none",
        label: "Rien d'évident",
        value: "Aucun consommateur parasite évident n'est identifié.",
        addsEvidence: [
          "observation-no-obvious-parasitic-consumer",
        ],
        nextActionId:
          "battery-parasitic-current-known",
      },
    ],
  },

  {
    id: "battery-parasitic-current-known",
    workflowId: "battery",
    type: "ask-question",
    text: "Le courant de fuite véhicule au repos a-t-il été mesuré ?",
    audiences,
    complexity: "technical",
    priority: 30,
    options: [
      {
        id: "yes",
        label: "Oui",
        value: "Le courant parasite a été mesuré.",
        nextActionId:
          "battery-parasitic-current-value",
      },
      {
        id: "no",
        label: "Non",
        value: "Le courant parasite n'a pas été mesuré.",
        nextActionId:
          "battery-conclude",
      },
    ],
  },

  {
    id: "battery-parasitic-current-value",
    workflowId: "battery",
    type: "request-measurement",
    text: "Quel courant parasite est mesuré après mise en veille du véhicule ?",
    audiences,
    complexity: "technical",
    priority: 31,
    options: [
      {
        id: "below-30",
        label: "Moins de 30 mA",
        value: "Le courant parasite est inférieur à 30 mA.",
        addsEvidence: [
          "measurement-parasitic-current-below-30ma",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "30-to-80",
        label: "Entre 30 et 80 mA",
        value: "Le courant parasite est compris entre 30 et 80 mA.",
        addsEvidence: [
          "measurement-parasitic-current-30-to-80ma",
        ],
        nextActionId:
          "battery-parasitic-circuit-check",
      },
      {
        id: "above-80",
        label: "Plus de 80 mA",
        value: "Le courant parasite dépasse 80 mA.",
        addsEvidence: [
          "measurement-parasitic-current-above-80ma",
        ],
        supportsHypotheses: [
          "problem-parasitic-drain",
        ],
        nextActionId:
          "battery-parasitic-circuit-check",
      },
    ],
  },

  {
    id: "battery-parasitic-circuit-check",
    workflowId: "battery",
    type: "request-observation",
    text: "Le circuit responsable de la consommation parasite a-t-il été identifié ?",
    audiences,
    complexity: "technical",
    priority: 32,
    options: [
      {
        id: "identified",
        label: "Oui",
        value: "Le circuit parasite a été identifié.",
        addsEvidence: [
          "observation-parasitic-circuit-identified",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "not-identified",
        label: "Non",
        value: "Le circuit parasite n'est pas encore identifié.",
        addsEvidence: [
          "observation-parasitic-circuit-not-identified",
        ],
        nextActionId:
          "battery-conclude",
      },
    ],
  },

  // ============================================================
  // 11. COMPATIBILITE BATTERIE
  // ============================================================

  {
    id: "battery-specification-check",
    workflowId: "battery",
    type: "request-observation",
    text: "La capacité, le courant de démarrage et les dimensions correspondent-ils aux spécifications du véhicule ?",
    audiences,
    complexity: "intermediate",
    priority: 33,
    options: [
      {
        id: "correct",
        label: "Oui",
        value: "La batterie correspond aux spécifications.",
        addsEvidence: [
          "observation-battery-specification-correct",
        ],
        nextActionId:
          "battery-start-stop-type",
      },
      {
        id: "incorrect",
        label: "Non",
        value: "La batterie ne correspond pas aux spécifications.",
        addsEvidence: [
          "observation-battery-specification-incorrect",
        ],
        nextActionId:
          "battery-start-stop-type",
      },
      {
        id: "unknown",
        label: "Je ne sais pas",
        value: "La conformité de la batterie n'est pas connue.",
        nextActionId:
          "battery-start-stop-type",
      },
    ],
  },

  {
    id: "battery-start-stop-type",
    workflowId: "battery",
    type: "ask-question",
    text: "Pour un véhicule Start & Stop, quel type de batterie est monté ?",
    audiences,
    complexity: "intermediate",
    priority: 34,
    options: [
      {
        id: "agm",
        label: "AGM",
        value: "Une batterie AGM est installée.",
        addsEvidence: [
          "observation-start-stop-agm",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "efb",
        label: "EFB",
        value: "Une batterie EFB est installée.",
        addsEvidence: [
          "observation-start-stop-efb",
        ],
        nextActionId:
          "battery-test-known",
      },
      {
        id: "wrong",
        label: "Type incompatible ou batterie standard",
        value: "Le type de batterie est incompatible avec le système Start & Stop.",
        addsEvidence: [
          "observation-start-stop-wrong-battery-type",
        ],
        supportsHypotheses: [
          "problem-wrong-battery",
        ],
        nextActionId:
          "battery-conclude",
      },
      {
        id: "not-applicable",
        label: "Le véhicule n'est pas Start & Stop",
        value: "Le véhicule n'utilise pas de système Start & Stop.",
        nextActionId:
          "battery-test-known",
      },
    ],
  },

  // ============================================================
  // 12. CONCLUSION
  // ============================================================

  {
    id: "battery-conclude",
    workflowId: "battery",
    type: "complete-diagnosis",
    text: "Calcul du diagnostic de batterie.",
    audiences,
    complexity: "simple",
    priority: 100,
    diagnosisId:
      "battery-diagnosis",
  },
];

fs.writeFileSync(
  file,
  JSON.stringify(actions, null, 2) + "\n",
  "utf8",
);

console.log(
  "Battery V1 actions rebuilt.",
);

console.log(
  "Actions:",
  actions.length,
);

const badIds =
  actions
    .map(action => action.id)
    .filter(id =>
      id.startsWith("starting-"),
    );

console.log(
  "starting-* actions:",
  badIds.length,
);

const badLinks = [];

for (const action of actions) {
  for (const option of action.options ?? []) {
    if (
      option.nextActionId?.startsWith(
        "starting-",
      )
    ) {
      badLinks.push(
        `${action.id}/${option.id} -> ${option.nextActionId}`,
      );
    }
  }
}

console.log(
  "starting-* links:",
  badLinks.length,
);
