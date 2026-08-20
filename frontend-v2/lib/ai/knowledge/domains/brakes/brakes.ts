import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS — FREINAGE
 * ============================================================
 */

export const brakeEntities: KnowledgeEntity[] = [
  {
    id: "problem-brake-friction",
    type: "problem",
    name: "Plaquettes ou disque de frein usés",
    description:
      "Des plaquettes ou un disque usés peuvent produire un grincement ou un frottement pendant le freinage.",
    category: "freinage",
    severity: "high",
    aliases: [
      "plaquettes usees",
      "disque de frein use",
      "freins uses",
    ],
  },

  {
    id: "observation-noise-when-braking",
    type: "observation",
    name: "Le bruit apparaît pendant le freinage",
    aliases: [
      "bruit au freinage",
      "bruit quand je freine",
      "bruit en freinant",
    ],
    category: "freinage",
  },

  {
    id: "part-brake-pads",
    type: "part",
    name: "Plaquettes de frein",
    category: "freinage",
    aliases: [
      "plaquettes",
      "jeu de plaquettes",
    ],
  },

  {
    id: "part-brake-disc",
    type: "part",
    name: "Disque de frein",
    category: "freinage",
    aliases: [
      "disque",
      "disques de frein",
    ],
  },

  {
    id: "test-brake-inspection",
    type: "test",
    name: "Inspection des freins",
    description:
      "Contrôler l’épaisseur des plaquettes, l’état des disques et la présence de frottements anormaux.",
    category: "freinage",
  },

  {
    id: "procedure-service-brakes",
    type: "procedure",
    name: "Remplacement des plaquettes ou des disques de frein",
    category: "freinage",
    metadata: {
      estimatedMinutes: 90,
      difficulty: 4,
    },
  },
];

/*
 * ============================================================
 * RELATIONS — FREINAGE
 * ============================================================
 */

export const brakeRelations: KnowledgeRelation[] = [
  {
    id: "rel-brake-friction-general-noise",
    from: "problem-brake-friction",
    to: "symptom-vehicle-noise",
    type: "produces",
    weight: 0.4,
  },

  {
    id: "rel-brake-friction-grinding",
    from: "problem-brake-friction",
    to: "symptom-grinding-noise",
    type: "produces",
    weight: 0.9,
  },

  {
    id: "rel-brake-friction-braking",
    from: "problem-brake-friction",
    to: "observation-noise-when-braking",
    type: "supports",
    weight: 0.98,
  },

  {
    id: "rel-brake-friction-test",
    from: "problem-brake-friction",
    to: "test-brake-inspection",
    type: "verified-by",
    weight: 0.95,
  },

  {
    id: "rel-brake-friction-pads",
    from: "problem-brake-friction",
    to: "part-brake-pads",
    type: "requires-part",
    weight: 0.85,
  },

  {
    id: "rel-brake-friction-disc",
    from: "problem-brake-friction",
    to: "part-brake-disc",
    type: "requires-part",
    weight: 0.75,
  },

  {
    id: "rel-brake-friction-procedure",
    from: "problem-brake-friction",
    to: "procedure-service-brakes",
    type: "repaired-by",
    weight: 0.9,
  },
];

export const brakeKnowledgeGraph: KnowledgeGraphData = {
  entities: brakeEntities,
  relations: brakeRelations,
};
