import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS — ROULEMENT DE ROUE
 * ============================================================
 *
 * Ce domaine couvre :
 * - les grondements et ronflements ;
 * - les vibrations ressenties en roulant ;
 * - les vibrations localisées à une roue ;
 * - les variations du bruit selon la vitesse.
 *
 * Les symptômes de bruit communs sont définis dans :
 * domains/common/noise.ts
 */

export const wheelBearingEntities: KnowledgeEntity[] = [
  {
    id: "problem-wheel-bearing",
    type: "problem",
    name: "Roulement de roue usé",
    description:
      "Un roulement de roue usé peut provoquer un ronflement, un grondement ou des vibrations qui augmentent généralement avec la vitesse.",
    category: "roulement",
    severity: "high",
    aliases: [
      "roulement use",
      "roulement de roue use",
      "roulement defectueux",
      "roulement abime",
      "roulement de roue defectueux",
    ],
  },

  {
    id: "symptom-vehicle-vibration",
    type: "symptom",
    name: "Le véhicule tremble ou vibre",
    description:
      "Le véhicule présente une vibration ou un tremblement perceptible pendant la conduite.",
    aliases: [
      "ma voiture tremble",
      "la voiture tremble",
      "mon vehicule tremble",
      "le vehicule tremble",
      "ma voiture vibre",
      "la voiture vibre",
      "mon vehicule vibre",
      "le vehicule vibre",
      "ca tremble",
      "ca vibre",
      "tremblement",
      "vibration",
      "vibrations",
      "tremble en roulant",
      "vibre en roulant",
      "la voiture tremble en roulant",
      "la voiture vibre en roulant",
    ],
    category: "roulement",
  },

  {
    id: "observation-vibration-right-wheel",
    type: "observation",
    name: "La vibration semble venir de la roue droite",
    description:
      "La vibration ou le bruit paraît localisé du côté droit du véhicule.",
    aliases: [
      "la roue droite",
      "roue droite",
      "cote droit",
      "du cote droit",
      "a droite",
      "vibration roue droite",
      "vibration cote droit",
      "ca tremble a droite",
      "ca vibre a droite",
      "bruit roue droite",
      "roulement droit",
      "roulement avant droit",
      "roulement arriere droit",
    ],
    category: "roulement",
  },

  {
    id: "observation-vibration-left-wheel",
    type: "observation",
    name: "La vibration semble venir de la roue gauche",
    description:
      "La vibration ou le bruit paraît localisé du côté gauche du véhicule.",
    aliases: [
      "la roue gauche",
      "roue gauche",
      "cote gauche",
      "du cote gauche",
      "a gauche",
      "vibration roue gauche",
      "vibration cote gauche",
      "ca tremble a gauche",
      "ca vibre a gauche",
      "bruit roue gauche",
      "roulement gauche",
      "roulement avant gauche",
      "roulement arriere gauche",
    ],
    category: "roulement",
  },

  {
    id: "observation-noise-increases-with-speed",
    type: "observation",
    name: "Le bruit augmente avec la vitesse",
    aliases: [
      "plus je roule vite plus le bruit augmente",
      "bruit augmente avec la vitesse",
      "bruit proportionnel a la vitesse",
      "le bruit augmente quand j accelere",
      "plus vite plus de bruit",
    ],
    category: "roulement",
  },

  {
    id: "observation-vibration-increases-with-speed",
    type: "observation",
    name: "La vibration augmente avec la vitesse",
    aliases: [
      "plus je roule vite plus ca tremble",
      "plus je roule vite plus ca vibre",
      "la vibration augmente avec la vitesse",
      "le tremblement augmente avec la vitesse",
      "ca tremble plus vite",
      "ca vibre plus vite",
      "vibration proportionnelle a la vitesse",
    ],
    category: "roulement",
  },

  {
    id: "part-wheel-bearing",
    type: "part",
    name: "Roulement de roue",
    category: "roulement",
    aliases: [
      "roulement avant",
      "roulement arriere",
      "moyeu",
      "moyeu de roue",
      "roulement avant droit",
      "roulement avant gauche",
      "roulement arriere droit",
      "roulement arriere gauche",
    ],
  },

  {
    id: "test-wheel-bearing",
    type: "test",
    name: "Contrôle du roulement de roue",
    description:
      "Contrôler le jeu du roulement, faire tourner la roue et écouter un éventuel grondement ou frottement.",
    category: "roulement",
  },

  {
    id: "procedure-replace-wheel-bearing",
    type: "procedure",
    name: "Remplacement du roulement de roue",
    category: "roulement",
    metadata: {
      estimatedMinutes: 120,
      difficulty: 4,
    },
  },
];

/*
 * ============================================================
 * RELATIONS
 * ============================================================
 */

export const wheelBearingRelations: KnowledgeRelation[] = [
  {
    id: "rel-wheel-bearing-general-noise",
    from: "problem-wheel-bearing",
    to: "symptom-vehicle-noise",
    type: "produces",
    weight: 0.40,
  },

  {
    id: "rel-wheel-bearing-humming",
    from: "problem-wheel-bearing",
    to: "symptom-humming-noise",
    type: "produces",
    weight: 0.95,
  },

  {
    id: "rel-wheel-bearing-vibration",
    from: "problem-wheel-bearing",
    to: "symptom-vehicle-vibration",
    type: "produces",
    weight: 0.72,
  },

  {
    id: "rel-wheel-bearing-right-wheel",
    from: "problem-wheel-bearing",
    to: "observation-vibration-right-wheel",
    type: "supports",
    weight: 0.68,
  },

  {
    id: "rel-wheel-bearing-left-wheel",
    from: "problem-wheel-bearing",
    to: "observation-vibration-left-wheel",
    type: "supports",
    weight: 0.68,
  },

  {
    id: "rel-wheel-bearing-speed",
    from: "problem-wheel-bearing",
    to: "observation-noise-increases-with-speed",
    type: "supports",
    weight: 0.98,
  },

  {
    id: "rel-wheel-bearing-vibration-speed",
    from: "problem-wheel-bearing",
    to: "observation-vibration-increases-with-speed",
    type: "supports",
    weight: 0.88,
  },

  {
    id: "rel-wheel-bearing-test",
    from: "problem-wheel-bearing",
    to: "test-wheel-bearing",
    type: "verified-by",
    weight: 0.95,
  },

  {
    id: "rel-wheel-bearing-part",
    from: "problem-wheel-bearing",
    to: "part-wheel-bearing",
    type: "requires-part",
    weight: 0.95,
  },

  {
    id: "rel-wheel-bearing-procedure",
    from: "problem-wheel-bearing",
    to: "procedure-replace-wheel-bearing",
    type: "repaired-by",
    weight: 0.90,
  },
];

export const wheelBearingKnowledgeGraph: KnowledgeGraphData = {
  entities: wheelBearingEntities,
  relations: wheelBearingRelations,
};

