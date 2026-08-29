import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS — DÉMARREUR ET CIRCUIT DE COMMANDE
 * ============================================================
 *
 * Positionnement TPA :
 * - orienter le particulier ;
 * - aider le vendeur de pièces à éviter les remplacements inutiles ;
 * - préparer les contrôles du professionnel ;
 * - ne pas fournir de tutoriel de réparation au particulier.
 */

export const starterEntities: KnowledgeEntity[] = [
  {
    id: "problem-starter",
    type: "problem",
    name: "Démarreur ou solénoïde défectueux",
    description:
      "Le démarreur ne parvient pas à entraîner correctement le moteur malgré une alimentation électrique suffisante.",
    category: "demarrage",
    severity: "high",
    aliases: [
      "demarreur defectueux",
      "demarreur en panne",
      "solenoide defectueux",
      "demarreur bloque",
      "demarreur hs",
      "demarreur mort",
    ],
  },

  {
    id: "problem-starter-solenoid",
    type: "problem",
    name: "Solénoïde de démarreur défectueux",
    description:
      "Le solénoïde commande l’engagement du pignon et l’alimentation du moteur de démarreur. Une défaillance peut produire un clic unique sans entraînement du moteur.",
    category: "demarrage",
    severity: "high",
    aliases: [
      "solenoide hs",
      "solenoide bloque",
      "relais du demarreur integre",
      "contacteur du demarreur",
    ],
  },

  {
    id: "problem-starter-worn-brushes",
    type: "problem",
    name: "Charbons de démarreur usés",
    description:
      "Des charbons usés peuvent provoquer un fonctionnement intermittent, un démarrage aléatoire ou une absence totale de rotation.",
    category: "demarrage",
    severity: "high",
    aliases: [
      "charbons de demarreur uses",
      "balais de demarreur uses",
      "demarreur intermittent",
      "demarreur fonctionne une fois sur deux",
    ],
  },

  {
    id: "problem-starter-drive",
    type: "problem",
    name: "Lanceur ou pignon de démarreur défectueux",
    description:
      "Le moteur électrique du démarreur tourne mais n’entraîne pas correctement le moteur thermique, souvent avec un bruit de rotation libre ou métallique.",
    category: "demarrage",
    severity: "high",
    aliases: [
      "bendix hs",
      "lanceur de demarreur hs",
      "pignon de demarreur use",
      "demarreur tourne dans le vide",
    ],
  },

  {
    id: "problem-starter-relay",
    type: "problem",
    name: "Relais de démarreur défectueux",
    description:
      "Le relais de commande ne transmet pas correctement l’ordre électrique vers le démarreur.",
    category: "demarrage",
    severity: "medium",
    aliases: [
      "relais de demarreur hs",
      "relais demarrage defectueux",
      "relais qui colle",
      "relais neiman demarreur",
    ],
  },

  {
    id: "problem-starter-control-circuit",
    type: "problem",
    name: "Défaut du circuit de commande du démarreur",
    description:
      "La commande électrique du démarreur n’arrive pas correctement jusqu’au solénoïde. Le défaut peut provenir du contacteur de démarrage, du bouton Start, d’un capteur d’autorisation ou du câblage.",
    category: "demarrage",
    severity: "medium",
    aliases: [
      "commande demarreur absente",
      "pas de courant au demarreur",
      "contact demarrage defectueux",
      "bouton start defectueux",
      "circuit de commande demarreur",
    ],
  },

  {
    id: "problem-engine-mechanical-lock",
    type: "problem",
    name: "Moteur mécaniquement bloqué",
    description:
      "Le démarreur ne peut pas entraîner le moteur parce que le moteur thermique ou un accessoire entraîné est bloqué. Cette hypothèse doit être vérifiée avant de condamner le démarreur.",
    category: "demarrage",
    severity: "critical",
    aliases: [
      "moteur bloque",
      "moteur serre",
      "moteur grippe",
      "moteur ne tourne plus",
    ],
  },

  {
    id: "symptom-single-click-start",
    type: "symptom",
    name: "Un seul clic pendant la tentative de démarrage",
    description:
      "Un clic unique peut indiquer que le solénoïde s’active sans que le moteur de démarreur tourne correctement.",
    category: "demarrage",
    aliases: [
      "un seul clic",
      "un clic au demarrage",
      "ca fait clic une fois",
      "un seul clac",
      "un tac puis rien",
      "clic unique",
    ],
  },

  {
    id: "symptom-starter-intermittent",
    type: "symptom",
    name: "Le démarreur fonctionne de manière intermittente",
    description:
      "Le véhicule démarre parfois normalement et parfois pas du tout, sans changement évident des conditions.",
    category: "demarrage",
    aliases: [
      "demarre une fois sur deux",
      "parfois elle demarre parfois non",
      "demarrage aleatoire",
      "demarreur intermittent",
      "elle finit par demarrer apres plusieurs essais",
    ],
  },

  {
    id: "symptom-starter-spins-free",
    type: "symptom",
    name: "Le démarreur tourne dans le vide",
    description:
      "Le moteur électrique du démarreur tourne mais le moteur thermique ne semble pas entraîné.",
    category: "demarrage",
    aliases: [
      "demarreur tourne dans le vide",
      "ca mouline sans entrainer le moteur",
      "on entend le demarreur mais le moteur ne tourne pas",
      "bruit de moteur electrique sans demarrage",
      "ca tourne librement",
    ],
  },

  {
    id: "symptom-metallic-grinding-start",
    type: "symptom",
    name: "Bruit métallique ou de grincement au démarrage",
    description:
      "Un bruit métallique peut indiquer un problème d’engagement entre le pignon du démarreur et la couronne moteur.",
    category: "demarrage",
    aliases: [
      "bruit metallique au demarrage",
      "grincement au demarrage",
      "ca craque quand je demarre",
      "bruit de ferraille au demarrage",
      "pignon qui gratte",
    ],
  },

  {
    id: "symptom-starter-remains-engaged",
    type: "symptom",
    name: "Le démarreur reste entraîné après le démarrage",
    description:
      "Le démarreur continue à tourner ou reste engagé après que le moteur a démarré.",
    category: "demarrage",
    severity: "critical",
    aliases: [
      "demarreur reste enclenche",
      "demarreur continue de tourner",
      "bruit de demarreur apres demarrage",
      "le demarreur ne se coupe pas",
    ],
  },

  {
    id: "observation-full-lights",
    type: "observation",
    name: "Les voyants et les phares restent normaux pendant la tentative de démarrage",
    aliases: [
      "les phares restent normaux",
      "les voyants restent normaux",
      "les phares ne faiblissent pas",
      "les voyants ne faiblissent pas",
    ],
    category: "demarrage",
  },

  {
    id: "observation-full-lights-single-click",
    type: "observation",
    name: "Les voyants restent lumineux malgré un clic unique",
    aliases: [
      "les phares restent forts",
      "les voyants ne faiblissent pas",
      "tout reste allume quand ca clique",
      "la batterie semble bonne mais un clic",
    ],
    category: "demarrage",
  },

  {
    id: "observation-jump-start-no-effect",
    type: "observation",
    name: "Un booster ou des câbles ne changent rien",
    aliases: [
      "le booster ne change rien",
      "meme avec les cables elle ne demarre pas",
      "les pinces ne changent rien",
      "avec une autre batterie pareil",
    ],
    category: "demarrage",
  },

  {
    id: "observation-starts-after-tapping-starter",
    type: "observation",
    name: "Le démarreur refonctionne après un choc léger ou plusieurs tentatives",
    description:
      "Ce comportement peut orienter vers des charbons usés ou un défaut interne intermittent. Cette observation ne constitue pas une méthode de réparation.",
    aliases: [
      "elle demarre apres avoir tape sur le demarreur",
      "le demarreur repart apres un choc",
      "apres plusieurs essais elle demarre",
      "en insistant elle finit par partir",
    ],
    category: "demarrage",
  },

  {
    id: "observation-problem-hot-engine",
    type: "observation",
    name: "Le problème apparaît surtout moteur chaud",
    aliases: [
      "ne demarre plus a chaud",
      "probleme uniquement moteur chaud",
      "elle demarre froide mais pas chaude",
      "demarreur bloque a chaud",
    ],
    category: "demarrage",
  },

  {
    id: "observation-problem-cold-engine",
    type: "observation",
    name: "Le problème apparaît surtout moteur froid",
    aliases: [
      "ne demarre pas a froid",
      "probleme uniquement moteur froid",
      "demarreur lent a froid",
      "elle demarre mieux quand il fait chaud",
    ],
    category: "demarrage",
  },

  {
    id: "observation-no-control-voltage-starter",
    type: "observation",
    name: "Aucune tension de commande n’arrive au démarreur",
    description:
      "Cette observation oriente vers le relais, le contacteur de démarrage, un capteur d’autorisation, le câblage ou un calculateur.",
    aliases: [
      "pas de tension au demarreur",
      "pas de courant sur le petit fil",
      "aucune commande solenoide",
      "pas de signal demarreur",
    ],
    category: "demarrage",
  },

  {
    id: "observation-control-voltage-present",
    type: "observation",
    name: "La tension de commande arrive correctement au démarreur",
    description:
      "Si l’alimentation de puissance et la commande sont présentes mais que le démarreur ne fonctionne pas, le démarreur devient fortement suspect.",
    aliases: [
      "courant arrive au demarreur",
      "12 volts sur le solenoide",
      "commande demarreur presente",
      "alimentation demarreur correcte",
    ],
    category: "demarrage",
  },

  {
    id: "part-starter",
    type: "part",
    name: "Démarreur",
    category: "demarrage",
    aliases: [
      "moteur de demarrage",
      "demarreur complet",
    ],
  },

  {
    id: "part-starter-solenoid",
    type: "part",
    name: "Solénoïde de démarreur",
    category: "demarrage",
    aliases: [
      "solenoide de demarreur",
      "contacteur de demarreur",
    ],
  },

  {
    id: "part-starter-drive",
    type: "part",
    name: "Lanceur ou pignon de démarreur",
    category: "demarrage",
    aliases: [
      "bendix",
      "lanceur de demarreur",
      "pignon de demarreur",
    ],
  },

  {
    id: "part-starter-relay",
    type: "part",
    name: "Relais de démarreur",
    category: "demarrage",
    aliases: [
      "relais demarrage",
      "relais de commande demarreur",
    ],
  },

  {
    id: "part-ignition-switch",
    type: "part",
    name: "Contacteur de démarrage ou bouton Start",
    category: "demarrage",
    aliases: [
      "neiman",
      "contacteur a cle",
      "bouton start",
      "bouton demarrage",
    ],
  },

  {
    id: "test-starter-voltage",
    type: "test",
    name: "Contrôle de l’alimentation du démarreur",
    description:
      "Contrôler la tension disponible sur le circuit de puissance et sur la commande du démarreur pendant une tentative de démarrage.",
    category: "demarrage",
    metadata: {
      unit: "volt",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-starter-operation",
    type: "test",
    name: "Contrôle du fonctionnement du démarreur",
    description:
      "Déterminer si le démarreur tourne, reste bloqué, tourne dans le vide ou produit uniquement un claquement.",
    category: "demarrage",
  },

  {
    id: "test-starter-current-draw",
    type: "test",
    name: "Mesure du courant absorbé par le démarreur",
    description:
      "Mesurer l’intensité absorbée pendant la tentative de démarrage afin de distinguer un démarreur défectueux, un moteur bloqué ou une alimentation insuffisante.",
    category: "demarrage",
    metadata: {
      unit: "ampere",
      recommendedTool: "pince-amperemetrique",
    },
  },

  {
    id: "test-starter-voltage-drop",
    type: "test",
    name: "Contrôle des chutes de tension du circuit de démarreur",
    description:
      "Mesurer les pertes de tension sur le câble positif et les masses pendant la tentative de démarrage.",
    category: "demarrage",
    metadata: {
      unit: "volt",
      recommendedTool: "multimetre",
    },
  },

  {
    id: "test-starter-relay",
    type: "test",
    name: "Contrôle du relais de démarreur",
    description:
      "Vérifier l’alimentation, la commande et la commutation du relais de démarreur.",
    category: "demarrage",
  },

  {
    id: "test-starter-control-circuit",
    type: "test",
    name: "Contrôle du circuit d’autorisation et de commande du démarreur",
    description:
      "Vérifier le contacteur de démarrage, le bouton Start, les capteurs d’embrayage ou de position de boîte, le câblage et les autorisations électroniques.",
    category: "demarrage",
  },

  {
    id: "test-engine-rotation",
    type: "test",
    name: "Vérification professionnelle de la rotation mécanique du moteur",
    description:
      "Confirmer que le moteur thermique et les accessoires entraînés ne sont pas mécaniquement bloqués avant de remplacer le démarreur.",
    category: "demarrage",
  },

  {
    id: "procedure-replace-starter",
    type: "procedure",
    name: "Remplacement professionnel du démarreur",
    description:
      "Remplacement du démarreur après confirmation du diagnostic et contrôle préalable de la batterie, des connexions et du circuit de commande.",
    category: "demarrage",
    metadata: {
      estimatedMinutes: 120,
      difficulty: 4,
    },
  },

  {
    id: "procedure-replace-starter-relay",
    type: "procedure",
    name: "Remplacement professionnel du relais de démarreur",
    category: "demarrage",
    metadata: {
      estimatedMinutes: 30,
      difficulty: 2,
    },
  },

  {
    id: "procedure-repair-starter-control-circuit",
    type: "procedure",
    name: "Réparation professionnelle du circuit de commande du démarreur",
    category: "demarrage",
    metadata: {
      estimatedMinutes: 90,
      difficulty: 4,
    },
  },

  {
    id: "tool-clamp-meter",
    type: "tool",
    name: "Pince ampèremétrique",
    category: "diagnostic",
  },
];

/*
 * ============================================================
 * RELATIONS — DÉMARREUR
 * ============================================================
 */

export const starterRelations: KnowledgeRelation[] = [
  {
    id: "rel-starter-no-start",
    from: "problem-starter",
    to: "symptom-no-start",
    type: "produces",
    weight: 0.86,
  },

  {
    id: "rel-starter-click",
    from: "problem-starter",
    to: "symptom-click-start",
    type: "produces",
    weight: 0.76,
  },

  {
    id: "rel-starter-single-click",
    from: "problem-starter",
    to: "symptom-single-click-start",
    type: "produces",
    weight: 0.90,
  },

  {
    id: "rel-starter-intermittent",
    from: "problem-starter",
    to: "symptom-starter-intermittent",
    type: "produces",
    weight: 0.78,
  },

  {
    id: "rel-starter-full-lights-general",
    from: "problem-starter",
    to: "observation-full-lights",
    type: "supports",
    weight: 0.62,
  },
  {
    id: "rel-solenoid-full-lights-general",
    from: "problem-starter-solenoid",
    to: "observation-full-lights",
    type: "supports",
    weight: 0.58,
  },
  {
    id: "rel-relay-full-lights-general",
    from: "problem-starter-relay",
    to: "observation-full-lights",
    type: "supports",
    weight: 0.52,
  },
  {
    id: "rel-control-circuit-full-lights-general",
    from: "problem-starter-control-circuit",
    to: "observation-full-lights",
    type: "supports",
    weight: 0.52,
  },

  {
    id: "rel-starter-full-lights",
    from: "problem-starter",
    to: "observation-full-lights-single-click",
    type: "supports",
    weight: 0.88,
  },

  {
    id: "rel-starter-jump-no-effect",
    from: "problem-starter",
    to: "observation-jump-start-no-effect",
    type: "supports",
    weight: 0.92,
  },

  {
    id: "rel-starter-jump-success-contradiction",
    from: "problem-starter",
    to: "observation-jump-start-success",
    type: "contradicts",
    weight: 0.45,
  },

  {
    id: "rel-starter-metallic-noise",
    from: "problem-starter",
    to: "symptom-metallic-grinding-start",
    type: "supports",
    weight: 0.46,
  },

  {
    id: "rel-starter-control-present",
    from: "problem-starter",
    to: "observation-control-voltage-present",
    type: "supports",
    weight: 0.98,
  },

  {
    id: "rel-starter-part",
    from: "problem-starter",
    to: "part-starter",
    type: "requires-part",
    weight: 0.96,
  },

  {
    id: "rel-starter-voltage-test",
    from: "problem-starter",
    to: "test-starter-voltage",
    type: "verified-by",
    weight: 0.98,
  },

  {
    id: "rel-starter-operation-test",
    from: "problem-starter",
    to: "test-starter-operation",
    type: "verified-by",
    weight: 0.98,
  },

  {
    id: "rel-starter-current-test",
    from: "problem-starter",
    to: "test-starter-current-draw",
    type: "verified-by",
    weight: 0.94,
  },

  {
    id: "rel-starter-voltage-drop-test",
    from: "problem-starter",
    to: "test-starter-voltage-drop",
    type: "verified-by",
    weight: 0.92,
  },

  {
    id: "rel-starter-procedure",
    from: "problem-starter",
    to: "procedure-replace-starter",
    type: "repaired-by",
    weight: 0.90,
  },

  {
    id: "rel-solenoid-single-click",
    from: "problem-starter-solenoid",
    to: "symptom-single-click-start",
    type: "produces",
    weight: 0.96,
  },

  {
    id: "rel-solenoid-no-start",
    from: "problem-starter-solenoid",
    to: "symptom-no-start",
    type: "produces",
    weight: 0.82,
  },

  {
    id: "rel-solenoid-control-present",
    from: "problem-starter-solenoid",
    to: "observation-control-voltage-present",
    type: "supports",
    weight: 0.92,
  },

  {
    id: "rel-solenoid-jump-success-contradiction",
    from: "problem-starter-solenoid",
    to: "observation-jump-start-success",
    type: "contradicts",
    weight: 0.50,
  },

  {
    id: "rel-solenoid-metallic-noise-contradiction",
    from: "problem-starter-solenoid",
    to: "symptom-metallic-grinding-start",
    type: "contradicts",
    weight: 0.40,
  },

  {
    id: "rel-solenoid-part",
    from: "problem-starter-solenoid",
    to: "part-starter-solenoid",
    type: "requires-part",
    weight: 0.88,
  },

  {
    id: "rel-solenoid-operation-test",
    from: "problem-starter-solenoid",
    to: "test-starter-operation",
    type: "verified-by",
    weight: 0.96,
  },

  {
    id: "rel-brushes-intermittent",
    from: "problem-starter-worn-brushes",
    to: "symptom-starter-intermittent",
    type: "produces",
    weight: 0.96,
  },

  {
    id: "rel-brushes-tapping",
    from: "problem-starter-worn-brushes",
    to: "observation-starts-after-tapping-starter",
    type: "supports",
    weight: 0.95,
  },

  {
    id: "rel-brushes-hot",
    from: "problem-starter-worn-brushes",
    to: "observation-problem-hot-engine",
    type: "supports",
    weight: 0.72,
  },

  {
    id: "rel-brushes-metallic-noise-contradiction",
    from: "problem-starter-worn-brushes",
    to: "symptom-metallic-grinding-start",
    type: "contradicts",
    weight: 0.82,
  },

  {
    id: "rel-brushes-jump-success-contradiction",
    from: "problem-starter-worn-brushes",
    to: "observation-jump-start-success",
    type: "contradicts",
    weight: 0.58,
  },

  {
    id: "rel-brushes-rapid-clicking-contradiction",
    from: "problem-starter-worn-brushes",
    to: "symptom-rapid-clicking-start",
    type: "contradicts",
    weight: 0.42,
  },

  {
    id: "rel-brushes-part",
    from: "problem-starter-worn-brushes",
    to: "part-starter",
    type: "requires-part",
    weight: 0.82,
  },

  {
    id: "rel-brushes-operation-test",
    from: "problem-starter-worn-brushes",
    to: "test-starter-operation",
    type: "verified-by",
    weight: 0.94,
  },

  {
    id: "rel-drive-spins-free",
    from: "problem-starter-drive",
    to: "symptom-starter-spins-free",
    type: "produces",
    weight: 0.99,
  },

  {
    id: "rel-drive-metallic-noise",
    from: "problem-starter-drive",
    to: "symptom-metallic-grinding-start",
    type: "produces",
    weight: 0.98,
  },

  {
    id: "rel-drive-intermittent",
    from: "problem-starter-drive",
    to: "symptom-starter-intermittent",
    type: "supports",
    weight: 0.48,
  },

  {
    id: "rel-drive-hot",
    from: "problem-starter-drive",
    to: "observation-problem-hot-engine",
    type: "supports",
    weight: 0.32,
  },

  {
    id: "rel-drive-remains-engaged",
    from: "problem-starter-drive",
    to: "symptom-starter-remains-engaged",
    type: "produces",
    weight: 0.82,
  },

  {
    id: "rel-drive-jump-success-contradiction",
    from: "problem-starter-drive",
    to: "observation-jump-start-success",
    type: "contradicts",
    weight: 0.35,
  },

  {
    id: "rel-drive-part",
    from: "problem-starter-drive",
    to: "part-starter-drive",
    type: "requires-part",
    weight: 0.94,
  },

  {
    id: "rel-drive-operation-test",
    from: "problem-starter-drive",
    to: "test-starter-operation",
    type: "verified-by",
    weight: 0.98,
  },

  {
    id: "rel-relay-no-start",
    from: "problem-starter-relay",
    to: "symptom-no-start",
    type: "produces",
    weight: 0.72,
  },

  {
    id: "rel-relay-no-control-voltage",
    from: "problem-starter-relay",
    to: "observation-no-control-voltage-starter",
    type: "supports",
    weight: 0.88,
  },

  {
    id: "rel-relay-metallic-noise-contradiction",
    from: "problem-starter-relay",
    to: "symptom-metallic-grinding-start",
    type: "contradicts",
    weight: 0.78,
  },

  {
    id: "rel-relay-part",
    from: "problem-starter-relay",
    to: "part-starter-relay",
    type: "requires-part",
    weight: 0.94,
  },

  {
    id: "rel-relay-test",
    from: "problem-starter-relay",
    to: "test-starter-relay",
    type: "verified-by",
    weight: 0.99,
  },

  {
    id: "rel-relay-procedure",
    from: "problem-starter-relay",
    to: "procedure-replace-starter-relay",
    type: "repaired-by",
    weight: 0.92,
  },

  {
    id: "rel-control-circuit-no-start",
    from: "problem-starter-control-circuit",
    to: "symptom-no-start",
    type: "produces",
    weight: 0.78,
  },

  {
    id: "rel-control-circuit-no-voltage",
    from: "problem-starter-control-circuit",
    to: "observation-no-control-voltage-starter",
    type: "supports",
    weight: 0.98,
  },

  {
    id: "rel-control-circuit-metallic-noise-contradiction",
    from: "problem-starter-control-circuit",
    to: "symptom-metallic-grinding-start",
    type: "contradicts",
    weight: 0.90,
  },

  {
    id: "rel-control-circuit-jump-success-contradiction",
    from: "problem-starter-control-circuit",
    to: "observation-jump-start-success",
    type: "contradicts",
    weight: 0.35,
  },

  {
    id: "rel-control-circuit-part",
    from: "problem-starter-control-circuit",
    to: "part-ignition-switch",
    type: "requires-part",
    weight: 0.55,
  },

  {
    id: "rel-control-circuit-test",
    from: "problem-starter-control-circuit",
    to: "test-starter-control-circuit",
    type: "verified-by",
    weight: 0.99,
  },

  {
    id: "rel-control-circuit-procedure",
    from: "problem-starter-control-circuit",
    to: "procedure-repair-starter-control-circuit",
    type: "repaired-by",
    weight: 0.90,
  },

  {
    id: "rel-engine-lock-no-start",
    from: "problem-engine-mechanical-lock",
    to: "symptom-no-start",
    type: "produces",
    weight: 0.94,
  },

  {
    id: "rel-engine-lock-single-click",
    from: "problem-engine-mechanical-lock",
    to: "symptom-single-click-start",
    type: "produces",
    weight: 0.70,
  },

  {
    id: "rel-engine-lock-jump-no-effect",
    from: "problem-engine-mechanical-lock",
    to: "observation-jump-start-no-effect",
    type: "supports",
    weight: 0.82,
  },

  {
    id: "rel-engine-lock-jump-success-contradiction",
    from: "problem-engine-mechanical-lock",
    to: "observation-jump-start-success",
    type: "contradicts",
    weight: 0.95,
  },

  {
    id: "rel-engine-lock-metallic-noise",
    from: "problem-engine-mechanical-lock",
    to: "symptom-metallic-grinding-start",
    type: "supports",
    weight: 0.42,
  },

  {
    id: "rel-engine-lock-intermittent-contradiction",
    from: "problem-engine-mechanical-lock",
    to: "symptom-starter-intermittent",
    type: "contradicts",
    weight: 0.86,
  },

  {
    id: "rel-engine-lock-current-test",
    from: "problem-engine-mechanical-lock",
    to: "test-starter-current-draw",
    type: "verified-by",
    weight: 0.90,
  },

  {
    id: "rel-engine-lock-rotation-test",
    from: "problem-engine-mechanical-lock",
    to: "test-engine-rotation",
    type: "verified-by",
    weight: 0.99,
  },

  {
    id: "rel-starter-voltage-tool",
    from: "test-starter-voltage",
    to: "tool-multimeter",
    type: "requires-tool",
    weight: 1,
  },

  {
    id: "rel-starter-voltage-drop-tool",
    from: "test-starter-voltage-drop",
    to: "tool-multimeter",
    type: "requires-tool",
    weight: 1,
  },

  {
    id: "rel-starter-current-tool",
    from: "test-starter-current-draw",
    to: "tool-clamp-meter",
    type: "requires-tool",
    weight: 1,
  },
];

export const starterKnowledgeGraph: KnowledgeGraphData = {
  entities: starterEntities,
  relations: starterRelations,
};

