import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS — BATTERIE ET ALIMENTATION PRINCIPALE
 * ============================================================
 *
 * Positionnement TPA :
 * - orienter le particulier ;
 * - aider le vendeur de pièces à éviter un remplacement inutile ;
 * - préparer les contrôles du professionnel ;
 * - ne pas fournir de tutoriel de réparation au particulier.
 */

export const batteryEntities: KnowledgeEntity[] = [
  {
    id: "problem-weak-battery",
    type: "problem",
    name: "Batterie faible ou déchargée",
    description:
      "La batterie ne fournit plus suffisamment d’énergie pour alimenter correctement le démarreur et les équipements électriques. Une batterie déchargée n’est pas nécessairement défectueuse.",
    category: "demarrage",
    severity: "medium",
    aliases: [
      "batterie vide",
      "batterie faible",
      "batterie dechargee",
      "batterie a plat",
      "plus assez de batterie",
      "plus de jus",
    ],
  },

  {
    id: "problem-battery-internal-failure",
    type: "problem",
    name: "Batterie défectueuse ou en fin de vie",
    description:
      "La batterie ne conserve plus correctement sa charge ou présente une défaillance interne. Elle peut sembler chargée au repos mais s’effondrer lors de la tentative de démarrage.",
    category: "demarrage",
    severity: "medium",
    aliases: [
      "batterie morte",
      "batterie hs",
      "batterie defectueuse",
      "batterie en fin de vie",
      "batterie ne tient plus la charge",
    ],
  },

  {
    id: "problem-battery-connection",
    type: "problem",
    name: "Connexion de batterie défectueuse",
    description:
      "Une cosse desserrée, oxydée, un câble endommagé ou une mauvaise liaison électrique limite le passage du courant.",
    category: "demarrage",
    severity: "medium",
    aliases: [
      "cosse de batterie oxydee",
      "cosse desserree",
      "cable de batterie endommage",
      "mauvais contact batterie",
      "borne batterie oxydee",
    ],
  },

  {
    id: "problem-battery-parasitic-drain",
    type: "problem",
    name: "Décharge anormale de la batterie à l’arrêt",
    description:
      "Un équipement ou un circuit continue à consommer du courant lorsque le véhicule est arrêté, ce qui décharge progressivement la batterie.",
    category: "electricite",
    severity: "medium",
    aliases: [
      "consommation parasite",
      "fuite de courant",
      "batterie se vide toute seule",
      "batterie vide chaque matin",
      "batterie se decharge a l arret",
    ],
  },

  {
    id: "problem-battery-unsuitable",
    type: "problem",
    name: "Batterie inadaptée ou mal configurée",
    description:
      "La batterie installée peut présenter une capacité, une technologie ou une configuration électronique inadaptée au véhicule.",
    category: "electricite",
    severity: "low",
    aliases: [
      "mauvaise batterie",
      "batterie pas adaptee",
      "batterie mal codee",
      "batterie non compatible start stop",
    ],
  },

  {
    id: "symptom-slow-cranking",
    type: "symptom",
    name: "Le moteur est entraîné très lentement au démarrage",
    description:
      "Le démarreur tourne, mais nettement plus lentement que d’habitude.",
    category: "demarrage",
    aliases: [
      "le moteur tourne lentement",
      "le demarreur tourne lentement",
      "ca tourne doucement",
      "ca rame au demarrage",
      "elle peine a demarrer",
      "demarrage tres lent",
    ],
  },

  {
    id: "symptom-rapid-clicking-start",
    type: "symptom",
    name: "Plusieurs clics rapides pendant la tentative de démarrage",
    description:
      "Un claquement rapide et répété peut apparaître lorsque la tension chute fortement pendant la commande du démarreur.",
    category: "demarrage",
    aliases: [
      "plusieurs clics",
      "clic clic clic",
      "ca fait clic clic",
      "ca claque rapidement",
      "plusieurs claquements",
      "tac tac tac au demarrage",
    ],
  },

  {
    id: "symptom-electrical-power-loss",
    type: "symptom",
    name: "Les équipements électriques manquent de puissance",
    description:
      "Les accessoires électriques fonctionnent lentement, faiblement ou de manière instable.",
    category: "electricite",
    aliases: [
      "vitres lentes",
      "centralisation lente",
      "ventilation faible",
      "plus assez de courant",
      "equipements electriques faibles",
      "tout fonctionne au ralenti",
    ],
  },

  {
    id: "symptom-battery-repeatedly-flat",
    type: "symptom",
    name: "La batterie se décharge régulièrement",
    description:
      "La batterie est retrouvée faible ou vide après une nuit, quelques jours d’arrêt ou de manière répétée.",
    category: "electricite",
    aliases: [
      "batterie vide chaque matin",
      "batterie a plat tous les jours",
      "elle se decharge toute seule",
      "je dois souvent recharger la batterie",
      "batterie vide apres une nuit",
    ],
  },

  {
    id: "observation-lights-dim-strongly",
    type: "observation",
    name: "Les voyants ou les phares faiblissent fortement",
    aliases: [
      "les lumieres diminuent fortement",
      "les phares diminuent fortement",
      "les voyants diminuent fortement",
      "les phares faiblissent fortement",
      "les voyants faiblissent fortement",
      "les phares baissent fortement",
      "les lumieres baissent fortement",
    ],
    category: "electricite",
  },

  {
    id: "observation-dim-lights",
    type: "observation",
    name: "Les voyants ou les phares faiblissent",
    aliases: [
      "voyants faibles",
      "phares faibles",
      "les lumieres diminuent",
      "les lumieres diminuent fortement",
      "les phares baissent",
      "le tableau de bord faiblit",
      "tout s eteint quand je demarre",
    ],
    category: "electricite",
  },

  {
    id: "observation-jump-start-success",
    type: "observation",
    name: "Le véhicule démarre avec des câbles ou un booster",
    aliases: [
      "demarre avec des cables",
      "demarre avec un booster",
      "elle part avec les pinces",
      "avec une autre batterie elle demarre",
      "elle demarre quand on la booste",
    ],
    category: "demarrage",
  },

  {
    id: "observation-jump-start-fails",
    type: "observation",
    name: "Le véhicule ne démarre pas avec des câbles ou un booster",
    aliases: [
      "ne demarre pas avec des cables",
      "ne demarre pas avec un booster",
      "meme avec les pinces elle ne demarre pas",
      "le booster ne change rien",
    ],
    category: "demarrage",
  },

  {
    id: "observation-electronics-reset",
    type: "observation",
    name: "L’horloge, l’écran ou les équipements se réinitialisent",
    aliases: [
      "horloge remise a zero",
      "radio remise a zero",
      "ecran redemarre",
      "tableau de bord redemarre",
      "tout se reinitialise",
    ],
    category: "electricite",
  },

  {
    id: "observation-starts-after-charge",
    type: "observation",
    name: "Le véhicule démarre après recharge de la batterie",
    aliases: [
      "demarre apres recharge",
      "apres avoir recharge la batterie elle demarre",
      "elle repart apres une nuit de charge",
    ],
    category: "demarrage",
  },

  {
    id: "observation-problem-after-long-parking",
    type: "observation",
    name: "Le problème apparaît après une immobilisation",
    aliases: [
      "apres une longue immobilisation",
      "apres plusieurs jours sans rouler",
      "la voiture n a pas roule depuis longtemps",
      "apres une semaine sans rouler",
    ],
    category: "electricite",
  },

  {
    id: "observation-problem-after-short-trips",
    type: "observation",
    name: "Le véhicule effectue principalement de courts trajets",
    aliases: [
      "je fais que des petits trajets",
      "uniquement des courts trajets",
      "je roule tres peu",
      "petits trajets tous les jours",
    ],
    category: "electricite",
  },

  {
    id: "observation-battery-terminal-corrosion",
    type: "observation",
    name: "Les bornes ou les cosses de batterie sont oxydées",
    aliases: [
      "cosse oxydee",
      "borne oxydee",
      "depot blanc sur la batterie",
      "vert de gris sur les cosses",
      "corrosion batterie",
    ],
    category: "electricite",
  },

  {
    id: "observation-battery-terminal-loose",
    type: "observation",
    name: "Une cosse de batterie est desserrée",
    aliases: [
      "cosse desserree",
      "borne desserree",
      "cosse qui bouge",
      "cable batterie mal serre",
    ],
    category: "electricite",
  },

  {
    id: "observation-battery-old",
    type: "observation",
    name: "La batterie est ancienne",
    aliases: [
      "batterie ancienne",
      "batterie a plus de cinq ans",
      "batterie agee",
      "vieille batterie",
    ],
    category: "electricite",
  },

  {
    id: "observation-battery-does-not-hold-charge",
    type: "observation",
    name: "La batterie ne conserve pas sa charge",
    aliases: [
      "la batterie ne tient pas la charge",
      "elle se vide apres recharge",
      "batterie chargee puis vide",
      "la tension retombe rapidement",
    ],
    category: "electricite",
  },

  {
    id: "observation-battery-swollen-or-odor",
    type: "observation",
    name: "La batterie est gonflée, fuit ou dégage une odeur anormale",
    description:
      "Une batterie déformée, qui fuit, chauffe fortement ou dégage une odeur anormale doit être contrôlée sans délai par un professionnel.",
    aliases: [
      "batterie gonflee",
      "batterie qui fuit",
      "odeur d oeuf pourri",
      "batterie tres chaude",
      "odeur de soufre",
    ],
    category: "electricite",
    severity: "critical",
  },

  {
    id: "observation-start-stop-battery",
    type: "observation",
    name: "Le véhicule est équipé du système Start-Stop",
    aliases: [
      "voiture start stop",
      "vehicule start stop",
      "systeme start stop",
      "batterie agm",
      "batterie efb",
    ],
    category: "electricite",
  },

  {
    id: "part-battery",
    type: "part",
    name: "Batterie",
    category: "electricite",
    aliases: [
      "batterie 12v",
      "accumulateur",
      "batterie de demarrage",
      "batterie agm",
      "batterie efb",
    ],
  },

  {
    id: "part-battery-terminal",
    type: "part",
    name: "Cosse ou câble de batterie",
    category: "electricite",
    aliases: [
      "cosse batterie",
      "cable batterie",
      "borne batterie",
      "cable positif batterie",
      "cable negatif batterie",
    ],
  },

  {
    id: "part-battery-monitoring-sensor",
    type: "part",
    name: "Capteur de surveillance de batterie",
    category: "electricite",
    aliases: [
      "capteur batterie",
      "capteur ibs",
      "sonde batterie",
      "gestionnaire batterie",
    ],
  },

  {
    id: "test-battery-voltage",
    type: "test",
    name: "Mesure de la tension de batterie",
    description:
      "Mesurer la tension de la batterie au repos puis pendant une tentative de démarrage afin d’observer une éventuelle chute excessive.",
    category: "electricite",
    metadata: {
      unit: "volt",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-battery-capacity",
    type: "test",
    name: "Test de capacité et de courant de démarrage de la batterie",
    description:
      "Faire contrôler la capacité réelle de la batterie et son aptitude à fournir le courant nécessaire au démarrage.",
    category: "electricite",
    metadata: {
      recommendedTool: "testeur-de-batterie",
    },
  },

  {
    id: "test-jump-start",
    type: "test",
    name: "Essai avec câbles ou booster",
    description:
      "Utiliser une source électrique externe adaptée afin de déterminer si le manque d’énergie est la cause principale du non-démarrage.",
    category: "demarrage",
  },

  {
    id: "test-battery-connections",
    type: "test",
    name: "Contrôle des bornes, cosses et câbles de batterie",
    description:
      "Faire vérifier le serrage, l’état, l’oxydation et la résistance électrique des connexions principales.",
    category: "electricite",
  },

  {
    id: "test-battery-voltage-drop",
    type: "test",
    name: "Contrôle de chute de tension du circuit de puissance",
    description:
      "Mesurer les pertes de tension entre la batterie, les câbles, les masses et le démarreur pendant la tentative de démarrage.",
    category: "electricite",
    metadata: {
      unit: "volt",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-battery-parasitic-draw",
    type: "test",
    name: "Recherche d’une consommation électrique anormale à l’arrêt",
    description:
      "Mesurer le courant consommé lorsque le véhicule est à l’arrêt et que les calculateurs sont normalement en veille.",
    category: "electricite",
    metadata: {
      unit: "ampere",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-charging-system",
    type: "test",
    name: "Contrôle du circuit de charge",
    description:
      "Faire vérifier que l’alternateur et la gestion de charge rechargent correctement la batterie lorsque le moteur fonctionne.",
    category: "electricite",
    metadata: {
      unit: "volt",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-battery-compatibility",
    type: "test",
    name: "Vérification de la compatibilité et de la configuration de la batterie",
    description:
      "Contrôler la technologie, la capacité, le courant de démarrage et, si nécessaire, l’enregistrement électronique de la batterie.",
    category: "electricite",
  },

  {
    id: "procedure-replace-battery",
    type: "procedure",
    name: "Remplacement professionnel de la batterie",
    description:
      "Remplacement de la batterie par un modèle compatible, avec maintien éventuel des mémoires et enregistrement électronique lorsque le véhicule l’exige.",
    category: "electricite",
    metadata: {
      estimatedMinutes: 30,
      difficulty: 2,
    },
  },

  {
    id: "procedure-service-battery-connections",
    type: "procedure",
    name: "Remise en état professionnelle des connexions de batterie",
    category: "electricite",
    metadata: {
      estimatedMinutes: 30,
      difficulty: 2,
    },
  },

  {
    id: "procedure-diagnose-parasitic-drain",
    type: "procedure",
    name: "Diagnostic professionnel d’une décharge anormale",
    category: "electricite",
    metadata: {
      estimatedMinutes: 90,
      difficulty: 4,
    },
  },

  {
    id: "tool-multimeter",
    type: "tool",
    name: "Multimètre",
    category: "diagnostic",
  },

  {
    id: "tool-battery-tester",
    type: "tool",
    name: "Testeur de batterie",
    category: "diagnostic",
  },
];

export const batteryRelations: KnowledgeRelation[] = [
  {
    id: "rel-weak-battery-no-start",
    from: "problem-weak-battery",
    to: "symptom-no-start",
    type: "produces",
    weight: 0.78,
  },
  {
    id: "rel-weak-battery-click",
    from: "problem-weak-battery",
    to: "symptom-click-start",
    type: "produces",
    weight: 0.72,
  },
  {
    id: "rel-weak-battery-rapid-clicking",
    from: "problem-weak-battery",
    to: "symptom-rapid-clicking-start",
    type: "produces",
    weight: 0.96,
  },
  {
    id: "rel-weak-battery-slow-cranking",
    from: "problem-weak-battery",
    to: "symptom-slow-cranking",
    type: "produces",
    weight: 0.92,
  },
  {
    id: "rel-weak-battery-electrical-loss",
    from: "problem-weak-battery",
    to: "symptom-electrical-power-loss",
    type: "produces",
    weight: 0.82,
  },
  {
    id: "rel-weak-battery-dim-lights",
    from: "problem-weak-battery",
    to: "observation-dim-lights",
    type: "produces",
    weight: 0.95,
  },
  {
    id: "rel-weak-battery-jump-start",
    from: "problem-weak-battery",
    to: "observation-jump-start-success",
    type: "supports",
    weight: 0.98,
  },
  {
    id: "rel-weak-battery-electronics-reset",
    from: "problem-weak-battery",
    to: "observation-electronics-reset",
    type: "produces",
    weight: 0.86,
  },
  {
    id: "rel-weak-battery-starts-after-charge",
    from: "problem-weak-battery",
    to: "observation-starts-after-charge",
    type: "supports",
    weight: 0.96,
  },
  {
    id: "rel-weak-battery-long-parking",
    from: "problem-weak-battery",
    to: "observation-problem-after-long-parking",
    type: "supports",
    weight: 0.78,
  },
  {
    id: "rel-weak-battery-short-trips",
    from: "problem-weak-battery",
    to: "observation-problem-after-short-trips",
    type: "supports",
    weight: 0.68,
  },
  {
    id: "rel-weak-battery-voltage-test",
    from: "problem-weak-battery",
    to: "test-battery-voltage",
    type: "verified-by",
    weight: 0.98,
  },
  {
    id: "rel-weak-battery-capacity-test",
    from: "problem-weak-battery",
    to: "test-battery-capacity",
    type: "verified-by",
    weight: 0.96,
  },
  {
    id: "rel-weak-battery-jump-test",
    from: "problem-weak-battery",
    to: "test-jump-start",
    type: "verified-by",
    weight: 0.90,
  },
  {
    id: "rel-weak-battery-charging-test",
    from: "problem-weak-battery",
    to: "test-charging-system",
    type: "verified-by",
    weight: 0.92,
  },
  {
    id: "rel-weak-battery-part",
    from: "problem-weak-battery",
    to: "part-battery",
    type: "requires-part",
    weight: 0.72,
  },

  {
    id: "rel-internal-battery-no-start",
    from: "problem-battery-internal-failure",
    to: "symptom-no-start",
    type: "produces",
    weight: 0.80,
  },
  {
    id: "rel-internal-battery-slow-cranking",
    from: "problem-battery-internal-failure",
    to: "symptom-slow-cranking",
    type: "produces",
    weight: 0.80,
  },
  {
    id: "rel-internal-battery-old",
    from: "problem-battery-internal-failure",
    to: "observation-battery-old",
    type: "supports",
    weight: 0.84,
  },
  {
    id: "rel-internal-battery-not-hold-charge",
    from: "problem-battery-internal-failure",
    to: "observation-battery-does-not-hold-charge",
    type: "supports",
    weight: 0.98,
  },
  {
    id: "rel-internal-battery-swollen",
    from: "problem-battery-internal-failure",
    to: "observation-battery-swollen-or-odor",
    type: "supports",
    weight: 0.96,
  },
  {
    id: "rel-internal-battery-capacity-test",
    from: "problem-battery-internal-failure",
    to: "test-battery-capacity",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-internal-battery-part",
    from: "problem-battery-internal-failure",
    to: "part-battery",
    type: "requires-part",
    weight: 0.97,
  },
  {
    id: "rel-internal-battery-procedure",
    from: "problem-battery-internal-failure",
    to: "procedure-replace-battery",
    type: "repaired-by",
    weight: 0.95,
  },

  {
    id: "rel-battery-connection-no-start",
    from: "problem-battery-connection",
    to: "symptom-no-start",
    type: "produces",
    weight: 0.70,
  },
  {
    id: "rel-battery-connection-click",
    from: "problem-battery-connection",
    to: "symptom-click-start",
    type: "produces",
    weight: 0.72,
  },
  {
    id: "rel-battery-connection-slow-cranking",
    from: "problem-battery-connection",
    to: "symptom-slow-cranking",
    type: "produces",
    weight: 0.78,
  },
  {
    id: "rel-battery-connection-corrosion",
    from: "problem-battery-connection",
    to: "observation-battery-terminal-corrosion",
    type: "supports",
    weight: 0.99,
  },
  {
    id: "rel-battery-connection-loose",
    from: "problem-battery-connection",
    to: "observation-battery-terminal-loose",
    type: "supports",
    weight: 0.99,
  },
  {
    id: "rel-battery-connection-test",
    from: "problem-battery-connection",
    to: "test-battery-connections",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-battery-connection-voltage-drop",
    from: "problem-battery-connection",
    to: "test-battery-voltage-drop",
    type: "verified-by",
    weight: 0.98,
  },
  {
    id: "rel-battery-connection-part",
    from: "problem-battery-connection",
    to: "part-battery-terminal",
    type: "requires-part",
    weight: 0.90,
  },
  {
    id: "rel-battery-connection-procedure",
    from: "problem-battery-connection",
    to: "procedure-service-battery-connections",
    type: "repaired-by",
    weight: 0.92,
  },

  {
    id: "rel-parasitic-drain-repeated-flat",
    from: "problem-battery-parasitic-drain",
    to: "symptom-battery-repeatedly-flat",
    type: "produces",
    weight: 0.98,
  },
  {
    id: "rel-parasitic-drain-long-parking",
    from: "problem-battery-parasitic-drain",
    to: "observation-problem-after-long-parking",
    type: "supports",
    weight: 0.88,
  },
  {
    id: "rel-parasitic-drain-starts-after-charge",
    from: "problem-battery-parasitic-drain",
    to: "observation-starts-after-charge",
    type: "supports",
    weight: 0.72,
  },
  {
    id: "rel-parasitic-drain-test",
    from: "problem-battery-parasitic-drain",
    to: "test-battery-parasitic-draw",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-parasitic-drain-procedure",
    from: "problem-battery-parasitic-drain",
    to: "procedure-diagnose-parasitic-drain",
    type: "repaired-by",
    weight: 0.90,
  },

  {
    id: "rel-unsuitable-battery-start-stop",
    from: "problem-battery-unsuitable",
    to: "observation-start-stop-battery",
    type: "supports",
    weight: 0.72,
  },
  {
    id: "rel-unsuitable-battery-repeated-flat",
    from: "problem-battery-unsuitable",
    to: "symptom-battery-repeatedly-flat",
    type: "produces",
    weight: 0.62,
  },
  {
    id: "rel-unsuitable-battery-slow-cranking",
    from: "problem-battery-unsuitable",
    to: "symptom-slow-cranking",
    type: "produces",
    weight: 0.58,
  },
  {
    id: "rel-unsuitable-battery-compatibility-test",
    from: "problem-battery-unsuitable",
    to: "test-battery-compatibility",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-unsuitable-battery-part",
    from: "problem-battery-unsuitable",
    to: "part-battery",
    type: "requires-part",
    weight: 0.82,
  },
  {
    id: "rel-unsuitable-battery-sensor",
    from: "problem-battery-unsuitable",
    to: "part-battery-monitoring-sensor",
    type: "requires-part",
    weight: 0.30,
  },

  {
    id: "rel-weak-battery-procedure",
    from: "problem-weak-battery",
    to: "procedure-replace-battery",
    type: "repaired-by",
    weight: 0.45,
  },
  {
    id: "rel-voltage-test-multimeter",
    from: "test-battery-voltage",
    to: "tool-multimeter",
    type: "requires-tool",
    weight: 1,
  },
  {
    id: "rel-voltage-drop-test-multimeter",
    from: "test-battery-voltage-drop",
    to: "tool-multimeter",
    type: "requires-tool",
    weight: 1,
  },
  {
    id: "rel-parasitic-test-multimeter",
    from: "test-battery-parasitic-draw",
    to: "tool-multimeter",
    type: "requires-tool",
    weight: 1,
  },
  {
    id: "rel-capacity-test-battery-tester",
    from: "test-battery-capacity",
    to: "tool-battery-tester",
    type: "requires-tool",
    weight: 1,
  },
];

export const batteryKnowledgeGraph: KnowledgeGraphData = {
  entities: batteryEntities,
  relations: batteryRelations,
};


