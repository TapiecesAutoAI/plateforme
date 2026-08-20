import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS — CARDAN / JOINT HOMOCINÉTIQUE
 * ============================================================
 *
 * Les symptômes de bruit communs sont maintenant définis dans :
 *
 * frontend/lib/ai/knowledge/domains/common/noise.ts
 *
 * Ce fichier conserve uniquement les entités propres au cardan.
 */

export const cvJointEntities: KnowledgeEntity[] = [
  {
    id: "problem-cv-joint",
    type: "problem",
    name: "Cardan ou joint homocinétique usé",
    description:
      "Un joint homocinétique usé peut produire des claquements répétés, surtout lorsque le véhicule tourne et accélère.",
    category: "transmission",
    severity: "high",
    aliases: [
      "cardan use",
      "joint homocinetique use",
    ],
  },

  {
    id: "observation-noise-when-turning",
    type: "observation",
    name: "Le bruit apparaît lorsque le véhicule tourne",
    aliases: [
      "bruit en tournant",
      "bruit quand je tourne",
      "bruit dans les virages",
      "bruit en braquant",
      "quand je braque",
    ],
    category: "direction",
  },

  {
    id: "observation-noise-when-accelerating",
    type: "observation",
    name: "Le bruit apparaît ou augmente à l’accélération",
    aliases: [
      "bruit en accelerant",
      "bruit a l acceleration",
      "claquement en accelerant",
    ],
    category: "transmission",
  },

  {
    id: "part-cv-joint",
    type: "part",
    name: "Cardan ou joint homocinétique",
    category: "transmission",
    aliases: [
      "cardan",
      "joint homocinetique",
      "arbre de transmission",
    ],
  },

  {
    id: "test-cv-joint",
    type: "test",
    name: "Contrôle du cardan et de son soufflet",
    description:
      "Contrôler le jeu du cardan, l’état du soufflet et la présence de graisse projetée.",
    category: "transmission",
  },

  {
    id: "procedure-replace-cv-joint",
    type: "procedure",
    name: "Remplacement du cardan ou du joint homocinétique",
    category: "transmission",
    metadata: {
      estimatedMinutes: 120,
      difficulty: 4,
    },
  },
];

/*
 * ============================================================
 * RELATIONS — CARDAN / JOINT HOMOCINÉTIQUE
 * ============================================================
 *
 * Les relations peuvent pointer vers des entités définies dans
 * un autre module, tant que leurs identifiants existent dans le
 * graphe final.
 */

export const cvJointRelations: KnowledgeRelation[] = [
  {
    id: "rel-cv-joint-general-noise",
    from: "problem-cv-joint",
    to: "symptom-vehicle-noise",
    type: "produces",
    weight: 0.4,
  },

  {
    id: "rel-cv-joint-clicking",
    from: "problem-cv-joint",
    to: "symptom-clicking-noise",
    type: "produces",
    weight: 0.95,
  },

  {
    id: "rel-cv-joint-turning",
    from: "problem-cv-joint",
    to: "observation-noise-when-turning",
    type: "supports",
    weight: 0.95,
  },

  {
    id: "rel-cv-joint-accelerating",
    from: "problem-cv-joint",
    to: "observation-noise-when-accelerating",
    type: "supports",
    weight: 0.85,
  },

  {
    id: "rel-cv-joint-test",
    from: "problem-cv-joint",
    to: "test-cv-joint",
    type: "verified-by",
    weight: 0.95,
  },

  {
    id: "rel-cv-joint-part",
    from: "problem-cv-joint",
    to: "part-cv-joint",
    type: "requires-part",
    weight: 0.95,
  },

  {
    id: "rel-cv-joint-procedure",
    from: "problem-cv-joint",
    to: "procedure-replace-cv-joint",
    type: "repaired-by",
    weight: 0.9,
  },
];

export const cvJointKnowledgeGraph: KnowledgeGraphData = {
  entities: cvJointEntities,
  relations: cvJointRelations,
};
