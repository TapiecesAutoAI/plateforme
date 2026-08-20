import type {
  KnowledgeGraphData,
} from "./types";

import {
  commonNoiseKnowledgeGraph,
} from "./domains/common/noise";

import {
  commonStartupKnowledgeGraph,
} from "./domains/common/startup";

import {
  batteryKnowledgeGraph,
} from "./domains/electrical/battery";

import {
  alternatorKnowledgeGraph,
} from "./domains/electrical/alternator";

import {
  starterKnowledgeGraph,
} from "./domains/starting/starter";

import {
  cvJointKnowledgeGraph,
} from "./domains/transmission/cvjoints";

import {
  wheelBearingKnowledgeGraph,
} from "./domains/wheels/bearing";

import {
  brakeKnowledgeGraph,
} from "./domains/brakes/brakes";

import {
  suspensionKnowledgeGraph,
} from "./domains/suspension/suspension";

/*
 * ============================================================
 * ASSEMBLAGE DU GRAPHE DE CONNAISSANCES AUTOMOBILE
 * ============================================================
 *
 * Chaque domaine conserve ses propres entités et relations.
 * Les éléments communs sont définis une seule fois dans :
 *
 * - common/noise.ts
 * - common/startup.ts
 */

const knowledgeModules:
  KnowledgeGraphData[] = [
    commonNoiseKnowledgeGraph,
    commonStartupKnowledgeGraph,

    batteryKnowledgeGraph,
    alternatorKnowledgeGraph,
    starterKnowledgeGraph,

    cvJointKnowledgeGraph,
    wheelBearingKnowledgeGraph,

    brakeKnowledgeGraph,
    suspensionKnowledgeGraph,
  ];

/*
 * Graphe complet utilisé par le moteur de diagnostic.
 */

export const automotiveKnowledgeGraph:
  KnowledgeGraphData = {
    entities:
      knowledgeModules.flatMap(
        (module) =>
          module.entities,
      ),

    relations:
      knowledgeModules.flatMap(
        (module) =>
          module.relations,
      ),
  };