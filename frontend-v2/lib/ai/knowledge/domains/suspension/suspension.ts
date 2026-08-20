import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS — SUSPENSION
 * ============================================================
 */

export const suspensionEntities: KnowledgeEntity[] = [
  {
    id: "problem-suspension-link",
    type: "problem",
    name: "Biellette ou articulation de suspension usée",
    description:
      "Une biellette, une rotule ou une articulation usée peut provoquer un claquement sur les bosses ou les routes dégradées.",
    category: "suspension",
    severity: "medium",
    aliases: [
      "biellette usee",
      "rotule usee",
      "suspension usee",
    ],
  },

  {
    id: "observation-noise-on-bumps",
    type: "observation",
    name: "Le bruit apparaît sur les bosses ou les routes dégradées",
    aliases: [
      "bruit sur les bosses",
      "bruit sur route abimee",
      "claquement dans les trous",
      "bruit sur dos d ane",
    ],
    category: "suspension",
  },

  {
    id: "part-suspension-link",
    type: "part",
    name: "Biellette ou articulation de suspension",
    category: "suspension",
    aliases: [
      "biellette de suspension",
      "biellette stabilisatrice",
      "rotule",
      "silentbloc",
    ],
  },

  {
    id: "test-suspension-inspection",
    type: "test",
    name: "Contrôle des articulations de suspension",
    description:
      "Contrôler le jeu des biellettes, rotules, silentblocs et autres articulations.",
    category: "suspension",
  },

  {
    id: "procedure-repair-suspension-link",
    type: "procedure",
    name: "Remplacement de l’articulation de suspension défectueuse",
    category: "suspension",
    metadata: {
      estimatedMinutes: 90,
      difficulty: 4,
    },
  },
];

/*
 * ============================================================
 * RELATIONS — SUSPENSION
 * ============================================================
 */

export const suspensionRelations: KnowledgeRelation[] = [
  {
    id: "rel-suspension-link-general-noise",
    from: "problem-suspension-link",
    to: "symptom-vehicle-noise",
    type: "produces",
    weight: 0.4,
  },

  {
    id: "rel-suspension-link-clicking",
    from: "problem-suspension-link",
    to: "symptom-clicking-noise",
    type: "produces",
    weight: 0.65,
  },

  {
    id: "rel-suspension-link-bumps",
    from: "problem-suspension-link",
    to: "observation-noise-on-bumps",
    type: "supports",
    weight: 0.98,
  },

  {
    id: "rel-suspension-link-test",
    from: "problem-suspension-link",
    to: "test-suspension-inspection",
    type: "verified-by",
    weight: 0.95,
  },

  {
    id: "rel-suspension-link-part",
    from: "problem-suspension-link",
    to: "part-suspension-link",
    type: "requires-part",
    weight: 0.9,
  },

  {
    id: "rel-suspension-link-procedure",
    from: "problem-suspension-link",
    to: "procedure-repair-suspension-link",
    type: "repaired-by",
    weight: 0.9,
  },
];

export const suspensionKnowledgeGraph: KnowledgeGraphData = {
  entities: suspensionEntities,
  relations: suspensionRelations,
};
