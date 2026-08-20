import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS — ALTERNATEUR ET CIRCUIT DE CHARGE
 * ============================================================
 *
 * Positionnement TPA :
 * - distinguer une batterie déchargée d’un défaut de charge ;
 * - éviter le remplacement inutile de la batterie ;
 * - orienter vers les contrôles professionnels appropriés ;
 * - signaler rapidement les situations présentant un risque.
 */

export const alternatorEntities: KnowledgeEntity[] = [
  {
    id: "problem-alternator-no-charge",
    type: "problem",
    name: "Alternateur ne rechargeant plus la batterie",
    description:
      "L’alternateur ne produit plus suffisamment d’énergie lorsque le moteur fonctionne. Le véhicule utilise alors progressivement l’énergie stockée dans la batterie jusqu’à l’arrêt.",
    category: "electricite",
    severity: "high",
    aliases: [
      "alternateur ne charge plus",
      "alternateur hs",
      "alternateur en panne",
      "pas de charge batterie",
      "batterie ne recharge plus",
      "defaut de charge",
    ],
  },

  {
    id: "problem-alternator-low-output",
    type: "problem",
    name: "Charge insuffisante de l’alternateur",
    description:
      "L’alternateur produit encore de l’électricité, mais pas suffisamment pour alimenter correctement le véhicule et recharger la batterie.",
    category: "electricite",
    severity: "high",
    aliases: [
      "alternateur charge faiblement",
      "charge alternateur insuffisante",
      "tension de charge trop basse",
      "alternateur faible",
      "batterie charge mal en roulant",
    ],
  },

  {
    id: "problem-alternator-overcharge",
    type: "problem",
    name: "Surcharge du circuit de charge",
    description:
      "Le circuit de charge fournit une tension excessive. Cette situation peut endommager la batterie, les calculateurs et les équipements électriques.",
    category: "electricite",
    severity: "critical",
    aliases: [
      "alternateur charge trop",
      "surcharge alternateur",
      "tension trop haute",
      "regulateur surcharge",
      "plus de 15 volts",
    ],
  },

  {
    id: "problem-alternator-regulator",
    type: "problem",
    name: "Régulateur de tension défectueux",
    description:
      "Le régulateur ne contrôle plus correctement la tension produite par l’alternateur. La charge peut devenir insuffisante, instable ou excessive.",
    category: "electricite",
    severity: "high",
    aliases: [
      "regulateur alternateur hs",
      "regulateur de tension defectueux",
      "tension alternateur instable",
      "regulateur de charge",
    ],
  },

  {
    id: "problem-alternator-diode",
    type: "problem",
    name: "Diode ou pont redresseur d’alternateur défectueux",
    description:
      "Une diode défectueuse peut réduire la puissance de charge, provoquer des variations électriques ou décharger la batterie lorsque le véhicule est arrêté.",
    category: "electricite",
    severity: "high",
    aliases: [
      "diode alternateur hs",
      "pont de diode alternateur",
      "pont redresseur defectueux",
      "alternateur decharge batterie a l arret",
      "courant alternatif alternateur",
    ],
  },

  {
    id: "problem-alternator-belt",
    type: "problem",
    name: "Courroie d’accessoires détendue, cassée ou absente",
    description:
      "La courroie n’entraîne plus correctement l’alternateur. Selon le véhicule, elle peut également entraîner la pompe à eau ou d’autres accessoires essentiels.",
    category: "electricite",
    severity: "critical",
    aliases: [
      "courroie alternateur cassee",
      "courroie accessoire cassee",
      "courroie alternateur detendue",
      "courroie absente",
      "courroie accessoires hs",
    ],
  },

  {
    id: "problem-alternator-pulley",
    type: "problem",
    name: "Poulie d’alternateur défectueuse",
    description:
      "Une poulie débrayable ou une poulie d’alternateur défectueuse peut produire des vibrations, des bruits et un entraînement irrégulier de l’alternateur.",
    category: "electricite",
    severity: "medium",
    aliases: [
      "poulie alternateur hs",
      "poulie debrayable alternateur",
      "roue libre alternateur",
      "poulie alternateur bloquee",
    ],
  },

  {
    id: "problem-alternator-connection",
    type: "problem",
    name: "Connexion électrique d’alternateur défectueuse",
    description:
      "Un câble de charge, une masse, un connecteur ou un fusible principal défectueux empêche l’énergie produite par l’alternateur d’atteindre correctement la batterie.",
    category: "electricite",
    severity: "high",
    aliases: [
      "cable alternateur defectueux",
      "connexion alternateur",
      "fil alternateur coupe",
      "fusible alternateur",
      "mauvaise masse alternateur",
      "cable de charge",
    ],
  },

  {
    id: "problem-smart-charging-system",
    type: "problem",
    name: "Défaut de gestion électronique de la charge",
    description:
      "Sur les véhicules modernes, le calculateur, le capteur de batterie ou la communication avec l’alternateur peut empêcher une gestion correcte de la charge.",
    category: "electricite",
    severity: "medium",
    aliases: [
      "gestion intelligente alternateur",
      "alternateur pilote",
      "defaut smart charge",
      "calculateur ne commande pas alternateur",
      "capteur batterie ibs",
    ],
  },

  {
    id: "symptom-battery-warning-light",
    type: "symptom",
    name: "Voyant de batterie allumé pendant que le moteur tourne",
    description:
      "Le voyant de batterie moteur tournant indique généralement un défaut du circuit de charge plutôt qu’un simple défaut de batterie.",
    category: "electricite",
    severity: "high",
    aliases: [
      "voyant batterie allume",
      "temoin batterie rouge",
      "voyant alternateur",
      "logo batterie au tableau de bord",
      "voyant batterie reste allume",
    ],
  },

  {
    id: "symptom-vehicle-stalls-electrically",
    type: "symptom",
    name: "Le véhicule perd progressivement ses fonctions électriques puis s’arrête",
    description:
      "Les équipements cessent progressivement de fonctionner avant l’arrêt du moteur, car le véhicule fonctionne uniquement sur la batterie.",
    category: "electricite",
    severity: "critical",
    aliases: [
      "la voiture s eteint en roulant",
      "tout s eteint puis le moteur cale",
      "perte electrique progressive",
      "tableau de bord s eteint en roulant",
      "voiture cale batterie vide",
    ],
  },

  {
    id: "symptom-light-intensity-varies",
    type: "symptom",
    name: "L’intensité des éclairages varie avec le régime moteur",
    description:
      "Les phares ou l’éclairage intérieur deviennent plus forts ou plus faibles lorsque le régime moteur change.",
    category: "electricite",
    aliases: [
      "phares varient avec acceleration",
      "lumieres clignotent moteur allume",
      "phares plus forts en accelerant",
      "eclairage instable",
      "intensite phares variable",
    ],
  },

  {
    id: "symptom-alternator-noise",
    type: "symptom",
    name: "Bruit de roulement ou de grondement provenant de l’alternateur",
    description:
      "Un roulement, une poulie ou un élément interne de l’alternateur peut produire un grondement, un sifflement ou un bruit mécanique.",
    category: "electricite",
    aliases: [
      "alternateur fait du bruit",
      "roulement alternateur",
      "grondement alternateur",
      "sifflement alternateur",
      "bruit cote courroie accessoires",
    ],
  },

  {
    id: "symptom-belt-squeal",
    type: "symptom",
    name: "Sifflement ou couinement de la courroie d’accessoires",
    description:
      "Un couinement peut provenir d’une courroie détendue, usée, contaminée ou d’une poulie défectueuse.",
    category: "electricite",
    aliases: [
      "courroie qui siffle",
      "courroie qui couine",
      "sifflement au demarrage",
      "bruit courroie accessoires",
      "couinement quand j accelere",
    ],
  },

  {
    id: "observation-battery-discharges-while-driving",
    type: "observation",
    name: "La batterie se décharge alors que le véhicule roule",
    aliases: [
      "batterie se vide en roulant",
      "batterie ne charge pas en roulant",
      "voiture roule puis batterie vide",
      "plus de batterie apres avoir roule",
    ],
    category: "electricite",
  },

  {
    id: "observation-repeated-battery-replacement",
    type: "observation",
    name: "Plusieurs batteries ont été remplacées sans résoudre le problème",
    aliases: [
      "j ai deja change la batterie",
      "batterie neuve mais toujours en panne",
      "plusieurs batteries usees",
      "nouvelle batterie se vide",
      "batterie remplacee mais probleme revient",
    ],
    category: "electricite",
  },

  {
    id: "observation-charging-voltage-low",
    type: "observation",
    name: "La tension de charge mesurée est insuffisante",
    description:
      "La tension mesurée moteur tournant reste trop proche de la tension de repos de la batterie ou diminue lorsque des consommateurs sont activés.",
    category: "electricite",
    aliases: [
      "alternateur charge sous 13 volts",
      "tension moteur tournant trop basse",
      "12 volts moteur allume",
      "pas de hausse de tension moteur allume",
      "charge faible au multimetre",
    ],
  },

  {
    id: "observation-charging-voltage-normal",
    type: "observation",
    name: "La tension de charge mesurée est normale",
    description:
      "La tension mesurée moteur tournant est compatible avec un fonctionnement normal du circuit de charge dans les conditions du contrôle.",
    category: "electricite",
    aliases: [
      "tension de charge normale",
      "tension moteur tournant normale",
      "alternateur charge normalement",
      "charge normale au multimetre",
      "environ 14 volts moteur tournant",
      "entre 13 8 et 14 8 volts",
    ],
  },

  {
    id: "observation-charging-voltage-high",
    type: "observation",
    name: "La tension de charge mesurée est excessive",
    description:
      "Une tension anormalement élevée moteur tournant peut endommager la batterie et les équipements électroniques.",
    category: "electricite",
    severity: "critical",
    aliases: [
      "plus de 15 volts moteur tournant",
      "tension alternateur trop haute",
      "surcharge batterie",
      "alternateur charge a 16 volts",
    ],
  },

  {
    id: "observation-charging-voltage-unstable",
    type: "observation",
    name: "La tension de charge est instable",
    aliases: [
      "tension alternateur varie",
      "charge instable",
      "voltage monte et descend",
      "tension fluctue moteur tournant",
    ],
    category: "electricite",
  },

  {
    id: "observation-charge-improves-with-rpm",
    type: "observation",
    name: "La charge s’améliore uniquement lorsque le moteur accélère",
    aliases: [
      "alternateur charge seulement en accelerant",
      "tension remonte a haut regime",
      "charge faible au ralenti",
      "voyant batterie s eteint en accelerant",
    ],
    category: "electricite",
  },

  {
    id: "observation-belt-missing-or-damaged",
    type: "observation",
    name: "La courroie d’accessoires est absente, cassée ou fortement endommagée",
    description:
      "Selon le moteur, continuer à rouler sans cette courroie peut provoquer une surchauffe ou des dommages importants.",
    category: "electricite",
    severity: "critical",
    aliases: [
      "courroie cassee",
      "courroie absente",
      "courroie effilochee",
      "courroie accessoires sortie",
      "courroie alternateur rompue",
    ],
  },

  {
    id: "observation-burning-smell-alternator",
    type: "observation",
    name: "Odeur de brûlé ou échauffement près de l’alternateur",
    description:
      "Une odeur de brûlé, de plastique chaud ou une forte chaleur peut indiquer un alternateur, un câble ou une courroie en difficulté.",
    category: "electricite",
    severity: "critical",
    aliases: [
      "odeur de brule alternateur",
      "alternateur chauffe",
      "odeur plastique chaud moteur",
      "fumee cote alternateur",
      "cable alternateur chaud",
    ],
  },

  {
    id: "observation-alternator-ac-ripple",
    type: "observation",
    name: "Ondulation électrique anormale mesurée à la sortie de l’alternateur",
    description:
      "Une composante alternative excessive peut indiquer une ou plusieurs diodes défectueuses dans le pont redresseur.",
    category: "electricite",
    aliases: [
      "ripple alternateur",
      "courant alternatif batterie",
      "ondulation alternateur",
      "diode alternateur test",
    ],
  },

  {
    id: "observation-battery-drain-linked-to-alternator",
    type: "observation",
    name: "La consommation anormale à l’arrêt disparaît lorsque l’alternateur est isolé",
    description:
      "Cette observation professionnelle oriente fortement vers une diode interne d’alternateur défectueuse.",
    category: "electricite",
    aliases: [
      "alternateur vide batterie a l arret",
      "fuite courant par alternateur",
      "consommation disparait alternateur debranche",
    ],
  },

  {
    id: "part-alternator",
    type: "part",
    name: "Alternateur",
    category: "electricite",
    aliases: [
      "generateur",
      "alternateur complet",
      "dynamo",
    ],
  },

  {
    id: "part-alternator-regulator",
    type: "part",
    name: "Régulateur de tension d’alternateur",
    category: "electricite",
    aliases: [
      "regulateur alternateur",
      "regulateur de charge",
      "porte balais alternateur",
    ],
  },

  {
    id: "part-alternator-pulley",
    type: "part",
    name: "Poulie d’alternateur",
    category: "electricite",
    aliases: [
      "poulie debrayable",
      "roue libre alternateur",
      "poulie alternateur",
    ],
  },

  {
    id: "part-accessory-belt",
    type: "part",
    name: "Courroie d’accessoires",
    category: "electricite",
    aliases: [
      "courroie alternateur",
      "courroie accessoire",
      "courroie poly v",
      "courroie serpentine",
    ],
  },

  {
    id: "part-alternator-cable",
    type: "part",
    name: "Câble, connecteur ou fusible principal d’alternateur",
    category: "electricite",
    aliases: [
      "cable de charge",
      "fil alternateur",
      "fusible alternateur",
      "connecteur alternateur",
      "mega fusible",
    ],
  },

  {
    id: "test-charging-voltage",
    type: "test",
    name: "Mesure de la tension de charge",
    description:
      "Mesurer la tension aux bornes de la batterie moteur arrêté puis moteur tournant, au ralenti et avec plusieurs consommateurs électriques activés.",
    category: "electricite",
    metadata: {
      unit: "volt",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-alternator-current-output",
    type: "test",
    name: "Mesure du courant fourni par l’alternateur",
    description:
      "Mesurer l’intensité réellement fournie par l’alternateur selon la charge électrique et les conditions de fonctionnement.",
    category: "electricite",
    metadata: {
      unit: "ampere",
      recommendedTool: "pince-amperemetrique",
    },
  },

  {
    id: "test-alternator-ripple",
    type: "test",
    name: "Contrôle de l’ondulation électrique de l’alternateur",
    description:
      "Mesurer la composante alternative résiduelle afin de détecter une diode ou un pont redresseur défectueux.",
    category: "electricite",
    metadata: {
      unit: "volt",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-alternator-belt",
    type: "test",
    name: "Contrôle de la courroie et des poulies d’accessoires",
    description:
      "Contrôler visuellement l’état, la tension, l’alignement et le fonctionnement des poulies et du tendeur.",
    category: "electricite",
  },

  {
    id: "test-alternator-voltage-drop",
    type: "test",
    name: "Contrôle des chutes de tension du circuit de charge",
    description:
      "Mesurer les pertes de tension entre l’alternateur, la batterie et les masses lorsque le circuit débite.",
    category: "electricite",
    metadata: {
      unit: "volt",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-alternator-control-signal",
    type: "test",
    name: "Contrôle de la commande électronique de l’alternateur",
    description:
      "Vérifier les alimentations, les signaux de commande et la communication entre l’alternateur, le capteur de batterie et les calculateurs.",
    category: "electricite",
  },

  {
    id: "procedure-replace-alternator",
    type: "procedure",
    name: "Remplacement professionnel de l’alternateur",
    description:
      "Remplacement de l’alternateur après confirmation du défaut et contrôle de la batterie, des câbles, des masses et de la courroie.",
    category: "electricite",
    metadata: {
      estimatedMinutes: 120,
      difficulty: 4,
    },
  },

  {
    id: "procedure-replace-alternator-regulator",
    type: "procedure",
    name: "Remplacement professionnel du régulateur d’alternateur",
    category: "electricite",
    metadata: {
      estimatedMinutes: 90,
      difficulty: 4,
    },
  },

  {
    id: "procedure-replace-accessory-belt",
    type: "procedure",
    name: "Remplacement professionnel de la courroie d’accessoires",
    category: "electricite",
    metadata: {
      estimatedMinutes: 60,
      difficulty: 3,
    },
  },

  {
    id: "procedure-repair-alternator-circuit",
    type: "procedure",
    name: "Réparation professionnelle du circuit électrique de charge",
    category: "electricite",
    metadata: {
      estimatedMinutes: 90,
      difficulty: 4,
    },
  },
];

/*
 * ============================================================
 * RELATIONS — ALTERNATEUR ET CIRCUIT DE CHARGE
 * ============================================================
 */

export const alternatorRelations: KnowledgeRelation[] = [
  {
    id: "rel-alternator-no-charge-warning-light",
    from: "problem-alternator-no-charge",
    to: "symptom-battery-warning-light",
    type: "produces",
    weight: 0.96,
  },
  {
    id: "rel-alternator-no-charge-driving-discharge",
    from: "problem-alternator-no-charge",
    to: "observation-battery-discharges-while-driving",
    type: "produces",
    weight: 0.98,
  },
  {
    id: "rel-alternator-no-charge-stall",
    from: "problem-alternator-no-charge",
    to: "symptom-vehicle-stalls-electrically",
    type: "produces",
    weight: 0.95,
  },
  {
    id: "rel-alternator-no-charge-repeated-battery",
    from: "problem-alternator-no-charge",
    to: "observation-repeated-battery-replacement",
    type: "supports",
    weight: 0.88,
  },
  {
    id: "rel-alternator-no-charge-low-voltage",
    from: "problem-alternator-no-charge",
    to: "observation-charging-voltage-low",
    type: "supports",
    weight: 0.99,
  },
  {
    id: "rel-alternator-no-charge-battery-flat",
    from: "problem-alternator-no-charge",
    to: "symptom-battery-repeatedly-flat",
    type: "produces",
    weight: 0.82,
  },
  {
    id: "rel-alternator-no-charge-part",
    from: "problem-alternator-no-charge",
    to: "part-alternator",
    type: "requires-part",
    weight: 0.88,
  },
  {
    id: "rel-alternator-no-charge-voltage-test",
    from: "problem-alternator-no-charge",
    to: "test-charging-voltage",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-alternator-no-charge-output-test",
    from: "problem-alternator-no-charge",
    to: "test-alternator-current-output",
    type: "verified-by",
    weight: 0.96,
  },
  {
    id: "rel-alternator-no-charge-procedure",
    from: "problem-alternator-no-charge",
    to: "procedure-replace-alternator",
    type: "repaired-by",
    weight: 0.88,
  },

  {
    id: "rel-alternator-low-output-warning-light",
    from: "problem-alternator-low-output",
    to: "symptom-battery-warning-light",
    type: "produces",
    weight: 0.78,
  },
  {
    id: "rel-alternator-low-output-electrical-loss",
    from: "problem-alternator-low-output",
    to: "symptom-electrical-power-loss",
    type: "produces",
    weight: 0.88,
  },
  {
    id: "rel-alternator-low-output-light-variation",
    from: "problem-alternator-low-output",
    to: "symptom-light-intensity-varies",
    type: "produces",
    weight: 0.84,
  },
  {
    id: "rel-alternator-low-output-low-voltage",
    from: "problem-alternator-low-output",
    to: "observation-charging-voltage-low",
    type: "supports",
    weight: 0.98,
  },
  {
    id: "rel-alternator-low-output-rpm",
    from: "problem-alternator-low-output",
    to: "observation-charge-improves-with-rpm",
    type: "supports",
    weight: 0.86,
  },
  {
    id: "rel-alternator-low-output-part",
    from: "problem-alternator-low-output",
    to: "part-alternator",
    type: "requires-part",
    weight: 0.78,
  },
  {
    id: "rel-alternator-low-output-voltage-test",
    from: "problem-alternator-low-output",
    to: "test-charging-voltage",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-alternator-low-output-current-test",
    from: "problem-alternator-low-output",
    to: "test-alternator-current-output",
    type: "verified-by",
    weight: 0.98,
  },

  {
    id: "rel-overcharge-high-voltage",
    from: "problem-alternator-overcharge",
    to: "observation-charging-voltage-high",
    type: "produces",
    weight: 0.99,
  },
  {
    id: "rel-overcharge-battery-condition",
    from: "problem-alternator-overcharge",
    to: "observation-battery-swollen-or-odor",
    type: "produces",
    weight: 0.92,
  },
  {
    id: "rel-overcharge-light-variation",
    from: "problem-alternator-overcharge",
    to: "symptom-light-intensity-varies",
    type: "supports",
    weight: 0.68,
  },
  {
    id: "rel-overcharge-low-voltage-contradiction",
    from: "problem-alternator-overcharge",
    to: "observation-charging-voltage-low",
    type: "contradicts",
    weight: 0.98,
  },
  {
    id: "rel-overcharge-regulator-part",
    from: "problem-alternator-overcharge",
    to: "part-alternator-regulator",
    type: "requires-part",
    weight: 0.94,
  },
  {
    id: "rel-overcharge-voltage-test",
    from: "problem-alternator-overcharge",
    to: "test-charging-voltage",
    type: "verified-by",
    weight: 0.99,
  },

  {
    id: "rel-regulator-unstable-voltage",
    from: "problem-alternator-regulator",
    to: "observation-charging-voltage-unstable",
    type: "produces",
    weight: 0.96,
  },
  {
    id: "rel-regulator-high-voltage",
    from: "problem-alternator-regulator",
    to: "observation-charging-voltage-high",
    type: "supports",
    weight: 0.90,
  },
  {
    id: "rel-regulator-low-voltage",
    from: "problem-alternator-regulator",
    to: "observation-charging-voltage-low",
    type: "supports",
    weight: 0.82,
  },
  {
    id: "rel-regulator-light-variation",
    from: "problem-alternator-regulator",
    to: "symptom-light-intensity-varies",
    type: "produces",
    weight: 0.84,
  },
  {
    id: "rel-regulator-part",
    from: "problem-alternator-regulator",
    to: "part-alternator-regulator",
    type: "requires-part",
    weight: 0.94,
  },
  {
    id: "rel-regulator-voltage-test",
    from: "problem-alternator-regulator",
    to: "test-charging-voltage",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-regulator-procedure",
    from: "problem-alternator-regulator",
    to: "procedure-replace-alternator-regulator",
    type: "repaired-by",
    weight: 0.90,
  },

  {
    id: "rel-diode-low-output",
    from: "problem-alternator-diode",
    to: "observation-charging-voltage-low",
    type: "supports",
    weight: 0.76,
  },
  {
    id: "rel-diode-light-variation",
    from: "problem-alternator-diode",
    to: "symptom-light-intensity-varies",
    type: "produces",
    weight: 0.78,
  },
  {
    id: "rel-diode-ripple",
    from: "problem-alternator-diode",
    to: "observation-alternator-ac-ripple",
    type: "produces",
    weight: 0.99,
  },
  {
    id: "rel-diode-drain",
    from: "problem-alternator-diode",
    to: "observation-battery-drain-linked-to-alternator",
    type: "supports",
    weight: 0.98,
  },
  {
    id: "rel-diode-repeated-flat",
    from: "problem-alternator-diode",
    to: "symptom-battery-repeatedly-flat",
    type: "produces",
    weight: 0.72,
  },
  {
    id: "rel-diode-ripple-test",
    from: "problem-alternator-diode",
    to: "test-alternator-ripple",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-diode-alternator-part",
    from: "problem-alternator-diode",
    to: "part-alternator",
    type: "requires-part",
    weight: 0.84,
  },

  {
    id: "rel-belt-warning-light",
    from: "problem-alternator-belt",
    to: "symptom-battery-warning-light",
    type: "produces",
    weight: 0.88,
  },
  {
    id: "rel-belt-squeal",
    from: "problem-alternator-belt",
    to: "symptom-belt-squeal",
    type: "produces",
    weight: 0.88,
  },
  {
    id: "rel-belt-damaged-observation",
    from: "problem-alternator-belt",
    to: "observation-belt-missing-or-damaged",
    type: "supports",
    weight: 0.99,
  },
  {
    id: "rel-belt-low-voltage",
    from: "problem-alternator-belt",
    to: "observation-charging-voltage-low",
    type: "supports",
    weight: 0.90,
  },
  {
    id: "rel-belt-part",
    from: "problem-alternator-belt",
    to: "part-accessory-belt",
    type: "requires-part",
    weight: 0.98,
  },
  {
    id: "rel-belt-test",
    from: "problem-alternator-belt",
    to: "test-alternator-belt",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-belt-procedure",
    from: "problem-alternator-belt",
    to: "procedure-replace-accessory-belt",
    type: "repaired-by",
    weight: 0.96,
  },

  {
    id: "rel-pulley-noise",
    from: "problem-alternator-pulley",
    to: "symptom-alternator-noise",
    type: "produces",
    weight: 0.92,
  },
  {
    id: "rel-pulley-belt-squeal",
    from: "problem-alternator-pulley",
    to: "symptom-belt-squeal",
    type: "supports",
    weight: 0.78,
  },
  {
    id: "rel-pulley-light-variation",
    from: "problem-alternator-pulley",
    to: "symptom-light-intensity-varies",
    type: "supports",
    weight: 0.52,
  },
  {
    id: "rel-pulley-part",
    from: "problem-alternator-pulley",
    to: "part-alternator-pulley",
    type: "requires-part",
    weight: 0.96,
  },
  {
    id: "rel-pulley-belt-test",
    from: "problem-alternator-pulley",
    to: "test-alternator-belt",
    type: "verified-by",
    weight: 0.98,
  },

  {
    id: "rel-alternator-connection-low-voltage",
    from: "problem-alternator-connection",
    to: "observation-charging-voltage-low",
    type: "supports",
    weight: 0.88,
  },
  {
    id: "rel-alternator-connection-warning",
    from: "problem-alternator-connection",
    to: "symptom-battery-warning-light",
    type: "produces",
    weight: 0.78,
  },
  {
    id: "rel-alternator-connection-burning",
    from: "problem-alternator-connection",
    to: "observation-burning-smell-alternator",
    type: "supports",
    weight: 0.88,
  },
  {
    id: "rel-alternator-connection-part",
    from: "problem-alternator-connection",
    to: "part-alternator-cable",
    type: "requires-part",
    weight: 0.92,
  },
  {
    id: "rel-alternator-connection-drop-test",
    from: "problem-alternator-connection",
    to: "test-alternator-voltage-drop",
    type: "verified-by",
    weight: 0.99,
  },
  {
    id: "rel-alternator-connection-procedure",
    from: "problem-alternator-connection",
    to: "procedure-repair-alternator-circuit",
    type: "repaired-by",
    weight: 0.92,
  },

  {
    id: "rel-smart-charge-variable",
    from: "problem-smart-charging-system",
    to: "observation-charging-voltage-unstable",
    type: "supports",
    weight: 0.68,
  },
  {
    id: "rel-smart-charge-low",
    from: "problem-smart-charging-system",
    to: "observation-charging-voltage-low",
    type: "supports",
    weight: 0.62,
  },
  {
    id: "rel-smart-charge-repeated-battery",
    from: "problem-smart-charging-system",
    to: "observation-repeated-battery-replacement",
    type: "supports",
    weight: 0.70,
  },
  {
    id: "rel-smart-charge-control-test",
    from: "problem-smart-charging-system",
    to: "test-alternator-control-signal",
    type: "verified-by",
    weight: 0.99,
  },

  {
    id: "rel-alternator-noise-burning",
    from: "problem-alternator-no-charge",
    to: "observation-burning-smell-alternator",
    type: "supports",
    weight: 0.62,
  },

  {
    id: "rel-alternator-high-voltage-low-contradiction",
    from: "problem-alternator-no-charge",
    to: "observation-charging-voltage-high",
    type: "contradicts",
    weight: 0.98,
  },

  {
    id: "rel-alternator-no-charge-normal-voltage-contradiction",
    from: "problem-alternator-no-charge",
    to: "observation-charging-voltage-normal",
    type: "contradicts",
    weight: 0.99,
  },

  {
    id: "rel-alternator-low-output-normal-voltage-contradiction",
    from: "problem-alternator-low-output",
    to: "observation-charging-voltage-normal",
    type: "contradicts",
    weight: 0.94,
  },

  {
    id: "rel-overcharge-normal-voltage-contradiction",
    from: "problem-alternator-overcharge",
    to: "observation-charging-voltage-normal",
    type: "contradicts",
    weight: 0.99,
  },

  {
    id: "rel-regulator-normal-voltage-contradiction",
    from: "problem-alternator-regulator",
    to: "observation-charging-voltage-normal",
    type: "contradicts",
    weight: 0.72,
  },

  {
    id: "rel-alternator-connection-normal-voltage-contradiction",
    from: "problem-alternator-connection",
    to: "observation-charging-voltage-normal",
    type: "contradicts",
    weight: 0.78,
  },

  {
    id: "rel-belt-normal-voltage-contradiction",
    from: "problem-alternator-belt",
    to: "observation-charging-voltage-normal",
    type: "contradicts",
    weight: 0.88,
  },

  {
    id: "rel-alternator-no-charge-belt-test",
    from: "problem-alternator-no-charge",
    to: "test-alternator-belt",
    type: "verified-by",
    weight: 0.84,
  },

  {
    id: "rel-alternator-voltage-test-tool",
    from: "test-charging-voltage",
    to: "tool-multimeter",
    type: "requires-tool",
    weight: 1,
  },

  {
    id: "rel-alternator-ripple-test-tool",
    from: "test-alternator-ripple",
    to: "tool-multimeter",
    type: "requires-tool",
    weight: 1,
  },

  {
    id: "rel-alternator-drop-test-tool",
    from: "test-alternator-voltage-drop",
    to: "tool-multimeter",
    type: "requires-tool",
    weight: 1,
  },

  {
    id: "rel-alternator-current-test-tool",
    from: "test-alternator-current-output",
    to: "tool-clamp-meter",
    type: "requires-tool",
    weight: 1,
  },
];

export const alternatorKnowledgeGraph: KnowledgeGraphData = {
  entities: alternatorEntities,
  relations: alternatorRelations,
};