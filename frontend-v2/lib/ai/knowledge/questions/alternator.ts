import type {
  KnowledgeQuestionTemplate,
} from "./types";

/*
 * ============================================================
 * QUESTIONS — ALTERNATEUR ET CIRCUIT DE CHARGE
 * ============================================================
 *
 * Objectifs :
 * - distinguer une batterie faible d’un défaut de charge ;
 * - identifier une absence, une faiblesse ou une surcharge ;
 * - détecter les défauts de courroie, régulateur et connexions ;
 * - rester compréhensible pour un particulier.
 */

export const alternatorQuestions:
  KnowledgeQuestionTemplate[] = [
    {
      id: "question-battery-warning-light",

      domains: [
        "electrical",
        "engine",
      ],

      targetEntityId:
        "symptom-battery-warning-light",

      discriminates: [
        "problem-alternator-no-charge",
        "problem-alternator-low-output",
        "problem-alternator-regulator",
        "problem-alternator-belt",
        "problem-alternator-connection",
        "problem-smart-charging-system",
        "problem-weak-battery",
        "problem-battery-internal-failure",
      ],

      priority: 15,

      purpose:
        "Le voyant de batterie moteur tournant oriente davantage vers le circuit de charge que vers la batterie elle-même.",

      text:
        "Le voyant rouge de batterie reste-t-il allumé lorsque le moteur tourne ?",

      options: [
        {
          id: "battery-warning-light-on",

          label:
            "Oui, il reste allumé",

          value:
            "Le voyant rouge de batterie reste allumé lorsque le moteur tourne.",

          addsEvidence: [
            "symptom-battery-warning-light",
          ],

          supports: [
            "problem-alternator-no-charge",
            "problem-alternator-low-output",
            "problem-alternator-belt",
            "problem-alternator-connection",
            "problem-smart-charging-system",
          ],

          rejects: [
            "problem-weak-battery",
          ],
        },

        {
          id: "battery-warning-light-intermittent",

          label:
            "Il s’allume par moments",

          value:
            "Le voyant de batterie s’allume par moments lorsque le moteur tourne.",

          addsEvidence: [
            "symptom-battery-warning-light",
            "observation-charging-voltage-unstable",
          ],

          supports: [
            "problem-alternator-low-output",
            "problem-alternator-regulator",
            "problem-alternator-connection",
            "problem-alternator-pulley",
            "problem-smart-charging-system",
          ],
        },

        {
          id: "battery-warning-light-off",

          label:
            "Non, il s’éteint normalement",

          value:
            "Le voyant de batterie s’éteint normalement après le démarrage.",

          rejects: [
            "problem-alternator-no-charge",
            "problem-alternator-belt",
          ],
        },

        {
          id: "battery-warning-light-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si le voyant de batterie reste allumé.",
        },
      ],
    },

    {
      id: "question-battery-discharges-driving",

      domains: [
        "electrical",
        "engine",
      ],

      targetEntityId:
        "observation-battery-discharges-while-driving",

      discriminates: [
        "problem-alternator-no-charge",
        "problem-alternator-low-output",
        "problem-alternator-connection",
        "problem-alternator-belt",
        "problem-battery-parasitic-drain",
        "problem-battery-internal-failure",
      ],

      priority: 25,

      purpose:
        "Une batterie qui se décharge pendant la conduite indique généralement que le circuit de charge ne fournit pas assez d’énergie.",

      text:
        "Le véhicule perd-il progressivement ses fonctions électriques pendant que vous roulez ?",

      options: [
        {
          id: "driving-discharge-yes",

          label:
            "Oui",

          value:
            "Le véhicule perd progressivement ses fonctions électriques pendant que je roule.",

          addsEvidence: [
            "observation-battery-discharges-while-driving",
            "symptom-vehicle-stalls-electrically",
          ],

          supports: [
            "problem-alternator-no-charge",
            "problem-alternator-low-output",
            "problem-alternator-belt",
            "problem-alternator-connection",
          ],

          rejects: [
            "problem-battery-parasitic-drain",
          ],
        },

        {
          id: "driving-discharge-no",

          label:
            "Non",

          value:
            "Le véhicule ne perd pas ses fonctions électriques pendant que je roule.",

          rejects: [
            "problem-alternator-no-charge",
          ],
        },

        {
          id: "driving-discharge-only-parked",

          label:
            "La batterie se vide seulement à l’arrêt",

          value:
            "La batterie se décharge seulement lorsque le véhicule reste à l’arrêt.",

          addsEvidence: [
            "symptom-battery-repeatedly-flat",
          ],

          supports: [
            "problem-battery-parasitic-drain",
            "problem-alternator-diode",
            "problem-battery-internal-failure",
          ],

          rejects: [
            "problem-alternator-no-charge",
          ],
        },

        {
          id: "driving-discharge-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si les fonctions électriques diminuent pendant la conduite.",
        },
      ],
    },

    {
      id: "question-charging-voltage",

      domains: [
        "electrical",
      ],

      targetEntityId:
        "test-charging-voltage",

      discriminates: [
        "problem-alternator-no-charge",
        "problem-alternator-low-output",
        "problem-alternator-overcharge",
        "problem-alternator-regulator",
        "problem-alternator-connection",
        "problem-smart-charging-system",
        "problem-weak-battery",
        "problem-battery-internal-failure",
      ],

      priority: 35,

      purpose:
        "La tension mesurée moteur tournant permet de distinguer une absence de charge, une charge insuffisante ou une surcharge.",

      text:
        "Une mesure de tension a-t-elle été faite aux bornes de la batterie moteur tournant ?",

      options: [
        {
          id: "charging-voltage-low",

          label:
            "Oui, elle reste proche de 12 V",

          value:
            "La tension reste proche de 12 volts lorsque le moteur tourne.",

          addsEvidence: [
            "observation-charging-voltage-low",
          ],

          supports: [
            "problem-alternator-no-charge",
            "problem-alternator-low-output",
            "problem-alternator-belt",
            "problem-alternator-connection",
          ],

          rejects: [
            "problem-alternator-overcharge",
          ],
        },

        {
          id: "charging-voltage-normal",

          label:
            "Oui, elle est normale",

          value:
            "La tension de charge semble normale lorsque le moteur tourne.",

          addsEvidence: [
            "observation-charging-voltage-normal",
          ],

          rejects: [
            "problem-alternator-no-charge",
            "problem-alternator-low-output",
            "problem-alternator-overcharge",
            "problem-alternator-belt",
            "problem-alternator-connection",
          ],
        },

        {
          id: "charging-voltage-high",

          label:
            "Oui, elle dépasse environ 15 V",

          value:
            "La tension de charge dépasse environ 15 volts lorsque le moteur tourne.",

          addsEvidence: [
            "observation-charging-voltage-high",
          ],

          supports: [
            "problem-alternator-overcharge",
            "problem-alternator-regulator",
          ],

          rejects: [
            "problem-alternator-no-charge",
            "problem-alternator-low-output",
          ],
        },

        {
          id: "charging-voltage-unstable",

          label:
            "Oui, elle monte et descend",

          value:
            "La tension de charge monte et descend de manière instable.",

          addsEvidence: [
            "observation-charging-voltage-unstable",
          ],

          supports: [
            "problem-alternator-regulator",
            "problem-alternator-diode",
            "problem-alternator-connection",
            "problem-smart-charging-system",
          ],
        },

        {
          id: "charging-voltage-not-tested",

          label:
            "Pas encore mesurée",

          value:
            "La tension de charge n’a pas encore été mesurée.",
        },
      ],
    },

    {
      id: "question-light-intensity-rpm",

      domains: [
        "electrical",
        "engine",
      ],

      targetEntityId:
        "symptom-light-intensity-varies",

      discriminates: [
        "problem-alternator-low-output",
        "problem-alternator-regulator",
        "problem-alternator-diode",
        "problem-alternator-pulley",
        "problem-alternator-connection",
      ],

      priority: 45,

      purpose:
        "Des éclairages qui varient avec le régime peuvent révéler une production électrique instable.",

      text:
        "Les phares deviennent-ils plus forts ou plus faibles lorsque vous accélérez ?",

      options: [
        {
          id: "light-intensity-varies-yes",

          label:
            "Oui",

          value:
            "L’intensité des phares varie lorsque le régime moteur change.",

          addsEvidence: [
            "symptom-light-intensity-varies",
            "observation-charge-improves-with-rpm",
          ],

          supports: [
            "problem-alternator-low-output",
            "problem-alternator-regulator",
            "problem-alternator-diode",
            "problem-alternator-pulley",
          ],
        },

        {
          id: "light-intensity-varies-no",

          label:
            "Non",

          value:
            "L’intensité des phares ne varie pas avec le régime moteur.",

          rejects: [
            "problem-alternator-regulator",
            "problem-alternator-pulley",
          ],
        },

        {
          id: "light-intensity-varies-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si l’intensité des phares varie avec le régime moteur.",
        },
      ],
    },

    {
      id: "question-accessory-belt",

      domains: [
        "electrical",
        "engine",
        "noise",
      ],

      targetEntityId:
        "observation-belt-missing-or-damaged",

      discriminates: [
        "problem-alternator-belt",
        "problem-alternator-pulley",
        "problem-alternator-no-charge",
        "problem-alternator-low-output",
      ],

      priority: 55,

      purpose:
        "Une courroie cassée ou fortement endommagée peut empêcher immédiatement l’alternateur de fonctionner.",

      text:
        "La courroie d’accessoires est-elle présente et semble-t-elle en bon état ?",

      options: [
        {
          id: "accessory-belt-damaged",

          label:
            "Elle est cassée, absente ou abîmée",

          value:
            "La courroie d’accessoires est cassée, absente ou fortement endommagée.",

          addsEvidence: [
            "observation-belt-missing-or-damaged",
          ],

          supports: [
            "problem-alternator-belt",
            "problem-alternator-no-charge",
          ],
        },

        {
          id: "accessory-belt-squeals",

          label:
            "Elle est présente mais elle couine",

          value:
            "La courroie est présente mais elle produit un couinement ou un sifflement.",

          addsEvidence: [
            "symptom-belt-squeal",
          ],

          supports: [
            "problem-alternator-belt",
            "problem-alternator-pulley",
          ],
        },

        {
          id: "accessory-belt-normal",

          label:
            "Elle semble normale",

          value:
            "La courroie d’accessoires semble présente, tendue et en bon état.",

          rejects: [
            "problem-alternator-belt",
          ],
        },

        {
          id: "accessory-belt-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas dans quel état se trouve la courroie d’accessoires.",
        },
      ],
    },

    {
      id: "question-alternator-noise",

      domains: [
        "electrical",
        "noise",
        "engine",
      ],

      targetEntityId:
        "symptom-alternator-noise",

      discriminates: [
        "problem-alternator-pulley",
        "problem-alternator-belt",
        "problem-alternator-diode",
        "problem-alternator-no-charge",
      ],

      priority: 65,

      purpose:
        "Un bruit près de l’alternateur peut provenir de ses roulements, de sa poulie ou de la courroie.",

      text:
        "Entendez-vous un grondement, un sifflement ou un bruit près de la courroie d’accessoires ?",

      options: [
        {
          id: "alternator-noise-grinding",

          label:
            "Oui, un grondement ou roulement",

          value:
            "J’entends un grondement ou un bruit de roulement près de l’alternateur.",

          addsEvidence: [
            "symptom-alternator-noise",
          ],

          supports: [
            "problem-alternator-pulley",
            "problem-alternator-no-charge",
          ],
        },

        {
          id: "alternator-noise-squeal",

          label:
            "Oui, un couinement",

          value:
            "J’entends un couinement provenant de la courroie d’accessoires.",

          addsEvidence: [
            "symptom-belt-squeal",
          ],

          supports: [
            "problem-alternator-belt",
            "problem-alternator-pulley",
          ],
        },

        {
          id: "alternator-noise-none",

          label:
            "Non, aucun bruit",

          value:
            "Je n’entends aucun bruit anormal près de l’alternateur ou de la courroie.",

          rejects: [
            "problem-alternator-pulley",
          ],
        },

        {
          id: "alternator-noise-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si un bruit provient de l’alternateur ou de la courroie.",
        },
      ],
    },

    {
      id: "question-repeated-battery-replacement",

      domains: [
        "electrical",
        "starting",
      ],

      targetEntityId:
        "observation-repeated-battery-replacement",

      discriminates: [
        "problem-alternator-no-charge",
        "problem-alternator-low-output",
        "problem-alternator-diode",
        "problem-smart-charging-system",
        "problem-battery-internal-failure",
        "problem-battery-parasitic-drain",
      ],

      priority: 75,

      purpose:
        "Une batterie neuve qui se décharge à nouveau indique que la batterie n’est probablement pas la cause principale.",

      text:
        "La batterie a-t-elle déjà été remplacée récemment sans résoudre le problème ?",

      options: [
        {
          id: "battery-already-replaced-yes",

          label:
            "Oui",

          value:
            "La batterie a été remplacée récemment mais le problème est revenu.",

          addsEvidence: [
            "observation-repeated-battery-replacement",
          ],

          supports: [
            "problem-alternator-no-charge",
            "problem-alternator-low-output",
            "problem-alternator-diode",
            "problem-smart-charging-system",
            "problem-battery-parasitic-drain",
          ],

          rejects: [
            "problem-battery-internal-failure",
          ],
        },

        {
          id: "battery-already-replaced-no",

          label:
            "Non",

          value:
            "La batterie n’a pas été remplacée récemment.",
        },

        {
          id: "battery-already-replaced-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si la batterie a été remplacée récemment.",
        },
      ],
    },

    {
      id: "question-alternator-burning-smell",

      domains: [
        "electrical",
        "engine",
      ],

      targetEntityId:
        "observation-burning-smell-alternator",

      discriminates: [
        "problem-alternator-no-charge",
        "problem-alternator-connection",
        "problem-alternator-belt",
        "problem-alternator-pulley",
      ],

      priority: 85,

      purpose:
        "Une odeur de brûlé ou un échauffement anormal peut signaler un défaut électrique ou mécanique urgent.",

      text:
        "Y a-t-il une odeur de brûlé, de plastique chaud ou de la fumée près de l’alternateur ?",

      options: [
        {
          id: "alternator-burning-smell-yes",

          label:
            "Oui",

          value:
            "Il y a une odeur de brûlé, de plastique chaud ou de la fumée près de l’alternateur.",

          addsEvidence: [
            "observation-burning-smell-alternator",
          ],

          supports: [
            "problem-alternator-no-charge",
            "problem-alternator-connection",
            "problem-alternator-belt",
            "problem-alternator-pulley",
          ],
        },

        {
          id: "alternator-burning-smell-no",

          label:
            "Non",

          value:
            "Il n’y a aucune odeur de brûlé ni fumée près de l’alternateur.",
        },

        {
          id: "alternator-burning-smell-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas s’il y a une odeur ou un échauffement près de l’alternateur.",
        },
      ],
    },
  ];