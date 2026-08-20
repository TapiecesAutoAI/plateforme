import type {
  KnowledgeEntity,
  KnowledgeGraphData,
} from "../../types";

/*
 * ============================================================
 * ENTITÉS COMMUNES — BRUITS
 * ============================================================
 *
 * Ces entités sont partagées par plusieurs domaines :
 * transmission, roues, freinage et suspension.
 *
 * Elles ne doivent exister qu’une seule fois dans le graphe final.
 */

export const commonNoiseEntities: KnowledgeEntity[] = [
  {
    id: "symptom-vehicle-noise",
    type: "symptom",
    name: "Le véhicule fait un bruit anormal",
    description:
      "Le conducteur perçoit un bruit inhabituel provenant du véhicule.",
    aliases: [
      "ma voiture fait du bruit",
      "la voiture fait du bruit",
      "mon véhicule fait du bruit",
      "j entends un bruit",
      "bruit anormal",
      "bruit dans la voiture",
      "bruit du vehicule",
      "bruit inhabituel",
    ],
    category: "bruit",
  },

  {
    id: "symptom-clicking-noise",
    type: "symptom",
    name: "Claquement ou clic-clic en roulant",
    description:
      "Un bruit répétitif de claquement ou de clic est entendu lorsque le véhicule roule.",
    aliases: [
      "clac clac",
      "clic clic",
      "claquement",
      "bruit de claquement",
      "claquement en roulant",
      "bruit repetitif",
    ],
    category: "bruit",
  },

  {
    id: "symptom-humming-noise",
    type: "symptom",
    name: "Ronflement ou grondement",
    description:
      "Un bruit continu de ronflement, de grondement ou de bourdonnement est entendu en roulant.",
    aliases: [
      "ronflement",
      "grondement",
      "bourdonnement",
      "bruit sourd",
      "bruit continu",
    ],
    category: "bruit",
  },

  {
    id: "symptom-grinding-noise",
    type: "symptom",
    name: "Grincement ou frottement",
    description:
      "Un bruit de grincement ou de frottement, parfois métallique, est entendu.",
    aliases: [
      "grincement",
      "bruit de frottement",
      "frottement metallique",
      "bruit metallique",
      "bruit de ferraille",
    ],
    category: "bruit",
  },
];

/*
 * Ce module ne contient aucune relation.
 *
 * Les relations restent dans les domaines concernés :
 * freinage, suspension, transmission et roulement.
 */

export const commonNoiseKnowledgeGraph: KnowledgeGraphData = {
  entities: commonNoiseEntities,
  relations: [],
};

