import type {
  KnowledgeEntity,
  KnowledgeGraphData,
  KnowledgeRelation,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS COMMUNES — DÉMARRAGE
 * ============================================================
 *
 * Ce fichier contient les symptômes partagés par plusieurs
 * modules du domaine démarrage.
 */

export const commonStartupEntities: KnowledgeEntity[] = [
  {
    id: "symptom-no-start",
    type: "symptom",
    name: "Le véhicule ne démarre pas",
    description:
      "Le moteur ne démarre pas lorsqu’une tentative de démarrage est effectuée.",
    category: "demarrage",
    aliases: [
      "ne demarre pas",
      "ne demarre plus",
      "impossible de demarrer",
      "impossible de mettre en route",
      "impossible de lancer le moteur",
      "voiture ne demarre pas",
      "vehicule ne demarre pas",
      "moteur ne demarre pas",
      "elle refuse de demarrer",
      "plus rien au demarrage",
    ],
  },

  {
    id: "symptom-no-crank",
    type: "symptom",
    name: "Le moteur ne tourne pas",
    description:
      "Le démarreur ne lance pas le moteur.",
    category: "demarrage",
    aliases: [
      "le moteur ne tourne pas",
      "le moteur ne tourne plus",
      "rien ne tourne",
      "aucune rotation",
      "pas de rotation moteur",
      "le moteur reste immobile",
      "le moteur ne se lance pas",
      "elle ne lance pas",
      "elle ne lance plus",
      "ma voiture ne tourne plus",
      "la voiture ne tourne plus",
      "le vehicule ne tourne plus",
    ],
  },

  {
    id: "symptom-engine-cranks",
    type: "symptom",
    name: "Le moteur tourne mais ne démarre pas",
    description:
      "Le démarreur entraîne le moteur, mais le moteur thermique ne démarre pas.",
    category: "demarrage",
    aliases: [
      "le moteur tourne mais ne demarre pas",
      "elle mouline",
      "elle mouline sans demarrer",
      "elle lance mais ne part pas",
      "ca tourne mais ca ne part pas",
      "le moteur est entraine mais ne demarre pas",
    ],
  },

  {
    id: "symptom-click-start",
    type: "symptom",
    name: "Cliquement au démarrage",
    description:
      "Un ou plusieurs clics sont entendus pendant la tentative de démarrage.",
    category: "demarrage",
    aliases: [
      "clic au demarrage",
      "clac au demarrage",
      "le demarreur fait clic",
      "un bruit de clic au demarrage",
      "ca clique au demarrage",
      "ca claque au demarrage",
    ],
  },
];

/*
 * ============================================================
 * RELATIONS COMMUNES — DÉMARRAGE
 * ============================================================
 *
 * Ces relations permettent à une phrase générale comme
 * « ma voiture ne tourne plus » de générer plusieurs
 * hypothèses concurrentes au lieu de n’en générer aucune.
 */

export const commonStartupRelations: KnowledgeRelation[] = [
  {
    id: "rel-common-no-crank-weak-battery",
    from: "problem-weak-battery",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.78,
  },

  {
    id: "rel-common-no-crank-battery-failure",
    from: "problem-battery-internal-failure",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.76,
  },

  {
    id: "rel-common-no-crank-battery-connection",
    from: "problem-battery-connection",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.72,
  },

  {
    id: "rel-common-no-crank-starter",
    from: "problem-starter",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.86,
  },

  {
    id: "rel-common-no-crank-solenoid",
    from: "problem-starter-solenoid",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.84,
  },

  {
    id: "rel-common-no-crank-brushes",
    from: "problem-starter-worn-brushes",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.68,
  },

  {
    id: "rel-common-no-crank-relay",
    from: "problem-starter-relay",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.74,
  },

  {
    id: "rel-common-no-crank-control-circuit",
    from: "problem-starter-control-circuit",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.78,
  },

  {
    id: "rel-common-no-crank-engine-lock",
    from: "problem-engine-mechanical-lock",
    to: "symptom-no-crank",
    type: "produces",
    weight: 0.82,
  },
];

export const commonStartupKnowledgeGraph: KnowledgeGraphData = {
  entities: commonStartupEntities,
  relations: commonStartupRelations,
};

