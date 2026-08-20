import type {
  KnowledgeQuestionTemplate,
} from "./types";

/*
 * ============================================================
 * QUESTIONS — BATTERIE QUI SE DÉCHARGE À L’ARRÊT
 * ============================================================
 *
 * Objectifs :
 * - distinguer une consommation parasite d’une batterie usée ;
 * - rechercher une diode d’alternateur défectueuse ;
 * - vérifier si la batterie conserve sa charge hors véhicule ;
 * - éviter de repartir trop tôt vers le démarreur ou la courroie.
 */

export const batteryDischargeQuestions:
  KnowledgeQuestionTemplate[] = [
    {
      id: "question-battery-discharge-delay",

      domains: [
        "electrical",
      ],

      targetEntityId:
        "observation-problem-after-long-parking",

      discriminates: [
        "problem-battery-parasitic-drain",
        "problem-battery-internal-failure",
        "problem-alternator-diode",
        "problem-weak-battery",
      ],

      priority: 5,

      purpose:
        "La durée nécessaire pour vider la batterie aide à distinguer une forte consommation parasite d’une batterie qui perd progressivement sa capacité.",

      text:
        "Après combien de temps à l’arrêt la batterie devient-elle trop faible pour démarrer ?",

      options: [
        {
          id: "battery-discharge-one-night",

          label:
            "Après une seule nuit",

          value:
            "La batterie devient trop faible après une seule nuit à l’arrêt.",

          addsEvidence: [
            "observation-problem-after-long-parking",
            "symptom-battery-repeatedly-flat",
          ],

          supports: [
            "problem-battery-parasitic-drain",
            "problem-alternator-diode",
          ],
        },

        {
          id: "battery-discharge-few-days",

          label:
            "Après deux à cinq jours",

          value:
            "La batterie devient trop faible après quelques jours à l’arrêt.",

          addsEvidence: [
            "observation-problem-after-long-parking",
            "symptom-battery-repeatedly-flat",
          ],

          supports: [
            "problem-battery-parasitic-drain",
            "problem-battery-internal-failure",
            "problem-weak-battery",
          ],
        },

        {
          id: "battery-discharge-weeks",

          label:
            "Après plusieurs semaines",

          value:
            "La batterie devient faible uniquement après plusieurs semaines sans rouler.",

          addsEvidence: [
            "observation-problem-after-long-parking",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-internal-failure",
          ],

          rejects: [
            "problem-battery-parasitic-drain",
          ],
        },

        {
          id: "battery-discharge-delay-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas après combien de temps la batterie devient trop faible.",
        },
      ],
    },

    {
      id: "question-battery-holds-charge-outside-vehicle",

      domains: [
        "electrical",
      ],

      targetEntityId:
        "observation-battery-does-not-hold-charge",

      discriminates: [
        "problem-battery-internal-failure",
        "problem-weak-battery",
        "problem-battery-parasitic-drain",
        "problem-alternator-diode",
      ],

      priority: 10,

      purpose:
        "Une batterie qui se décharge même lorsqu’elle est isolée du véhicule présente probablement un défaut interne.",

      text:
        "Après une recharge complète, la batterie conserve-t-elle sa charge lorsqu’elle est débranchée du véhicule ?",

      options: [
        {
          id: "battery-does-not-hold-charge",

          label:
            "Non, elle se décharge encore",

          value:
            "La batterie se décharge encore même lorsqu’elle est débranchée du véhicule.",

          addsEvidence: [
            "observation-battery-does-not-hold-charge",
          ],

          supports: [
            "problem-battery-internal-failure",
            "problem-weak-battery",
          ],

          rejects: [
            "problem-battery-parasitic-drain",
            "problem-alternator-diode",
          ],
        },

        {
          id: "battery-holds-charge",

          label:
            "Oui, elle garde sa charge",

          value:
            "La batterie garde sa charge lorsqu’elle est débranchée du véhicule.",

          supports: [
            "problem-battery-parasitic-drain",
            "problem-alternator-diode",
          ],

          rejects: [
            "problem-battery-internal-failure",
          ],
        },

        {
          id: "battery-hold-charge-not-tested",

          label:
            "Pas encore testé",

          value:
            "La tenue de charge de la batterie hors du véhicule n’a pas encore été testée.",
        },
      ],
    },

    {
      id: "question-battery-parasitic-draw-test",

      domains: [
        "electrical",
      ],

      targetEntityId:
        "test-battery-parasitic-draw",

      discriminates: [
        "problem-battery-parasitic-drain",
        "problem-alternator-diode",
        "problem-battery-internal-failure",
        "problem-weak-battery",
      ],

      priority: 15,

      purpose:
        "Une mesure du courant consommé véhicule arrêté permet de confirmer ou d’écarter une consommation parasite.",

      text:
        "Un courant de fuite a-t-il été mesuré lorsque le véhicule est arrêté et verrouillé ?",

      options: [
        {
          id: "parasitic-draw-high",

          label:
            "Oui, la consommation est anormalement élevée",

          value:
            "Une consommation électrique anormalement élevée a été mesurée véhicule arrêté.",

          supports: [
            "problem-battery-parasitic-drain",
            "problem-alternator-diode",
          ],

          rejects: [
            "problem-battery-internal-failure",
          ],
        },

        {
          id: "parasitic-draw-normal",

          label:
            "Oui, la consommation est normale",

          value:
            "La consommation électrique mesurée véhicule arrêté est normale.",

          supports: [
            "problem-battery-internal-failure",
            "problem-weak-battery",
          ],

          rejects: [
            "problem-battery-parasitic-drain",
          ],
        },

        {
          id: "parasitic-draw-not-tested",

          label:
            "Pas encore mesuré",

          value:
            "Le courant de fuite n’a pas encore été mesuré.",
        },
      ],
    },

    {
      id: "question-battery-drain-alternator-isolation",

      domains: [
        "electrical",
      ],

      targetEntityId:
        "observation-battery-drain-linked-to-alternator",

      discriminates: [
        "problem-alternator-diode",
        "problem-battery-parasitic-drain",
        "problem-battery-internal-failure",
      ],

      priority: 20,

      purpose:
        "Si la consommation disparaît lorsque l’alternateur est isolé, une diode interne défectueuse devient très probable.",

      text:
        "Lors d’un contrôle professionnel, la consommation à l’arrêt disparaît-elle lorsque l’alternateur est isolé ?",

      options: [
        {
          id: "alternator-isolation-stops-drain",

          label:
            "Oui, la consommation disparaît",

          value:
            "La consommation anormale disparaît lorsque l’alternateur est isolé.",

          addsEvidence: [
            "observation-battery-drain-linked-to-alternator",
          ],

          supports: [
            "problem-alternator-diode",
          ],

          rejects: [
            "problem-battery-internal-failure",
          ],
        },

        {
          id: "alternator-isolation-no-change",

          label:
            "Non, elle reste présente",

          value:
            "La consommation anormale reste présente lorsque l’alternateur est isolé.",

          supports: [
            "problem-battery-parasitic-drain",
          ],

          rejects: [
            "problem-alternator-diode",
          ],
        },

        {
          id: "alternator-isolation-not-tested",

          label:
            "Pas encore testé",

          value:
            "L’alternateur n’a pas encore été isolé pendant le contrôle de consommation.",
        },
      ],
    },

    {
      id: "question-battery-replaced-discharge",

      domains: [
        "electrical",
      ],

      targetEntityId:
        "observation-repeated-battery-replacement",

      discriminates: [
        "problem-battery-parasitic-drain",
        "problem-alternator-diode",
        "problem-battery-internal-failure",
        "problem-battery-unsuitable",
        "problem-smart-charging-system",
      ],

      priority: 25,

      purpose:
        "Une batterie récente qui se vide à nouveau indique souvent que la cause principale se trouve ailleurs.",

      text:
        "Une batterie récente s’est-elle déjà déchargée de la même manière sur ce véhicule ?",

      options: [
        {
          id: "recent-battery-also-flat",

          label:
            "Oui",

          value:
            "Une batterie récente s’est déjà déchargée de la même manière sur ce véhicule.",

          addsEvidence: [
            "observation-repeated-battery-replacement",
          ],

          supports: [
            "problem-battery-parasitic-drain",
            "problem-alternator-diode",
            "problem-battery-unsuitable",
            "problem-smart-charging-system",
          ],

          rejects: [
            "problem-battery-internal-failure",
          ],
        },

        {
          id: "no-recent-battery-test",

          label:
            "Non",

          value:
            "Aucune batterie récente n’a encore été testée durablement sur ce véhicule.",
        },

        {
          id: "recent-battery-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si une batterie récente s’est déjà déchargée de cette manière.",
        },
      ],
    },

    {
      id: "question-battery-discharge-charging-voltage",

      domains: [
        "electrical",
      ],

      targetEntityId:
        "test-charging-voltage",

      discriminates: [
        "problem-battery-parasitic-drain",
        "problem-alternator-diode",
        "problem-alternator-no-charge",
        "problem-alternator-low-output",
        "problem-battery-internal-failure",
      ],

      priority: 30,

      purpose:
        "Une charge normale moteur tournant recentre le diagnostic sur la décharge à l’arrêt, la batterie ou une diode d’alternateur.",

      text:
        "La tension de charge moteur tournant a-t-elle été contrôlée ?",

      options: [
        {
          id: "battery-discharge-charge-normal",

          label:
            "Oui, elle est normale",

          value:
            "La tension de charge est normale lorsque le moteur tourne.",

          addsEvidence: [
            "observation-charging-voltage-normal",
          ],

          supports: [
            "problem-battery-parasitic-drain",
            "problem-alternator-diode",
          ],

          rejects: [
            "problem-alternator-no-charge",
            "problem-alternator-low-output",
          ],
        },

        {
          id: "battery-discharge-charge-low",

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
          ],

          rejects: [
            "problem-battery-parasitic-drain",
          ],
        },

        {
          id: "battery-discharge-charge-unstable",

          label:
            "Oui, elle est instable",

          value:
            "La tension de charge varie anormalement lorsque le moteur tourne.",

          addsEvidence: [
            "observation-charging-voltage-unstable",
          ],

          supports: [
            "problem-alternator-diode",
            "problem-smart-charging-system",
          ],
        },

        {
          id: "battery-discharge-charge-not-tested",

          label:
            "Pas encore mesurée",

          value:
            "La tension de charge moteur tournant n’a pas encore été mesurée.",
        },
      ],
    },

    {
      id: "question-battery-start-stop-compatibility",

      domains: [
        "electrical",
      ],

      targetEntityId:
        "observation-start-stop-battery",

      discriminates: [
        "problem-battery-unsuitable",
        "problem-battery-internal-failure",
        "problem-weak-battery",
        "problem-battery-parasitic-drain",
      ],

      priority: 35,

      purpose:
        "Un véhicule Start-Stop équipé d’une batterie inadaptée peut présenter des décharges répétées et une durée de vie réduite.",

      text:
        "Le véhicule possède-t-il le Start-Stop et une batterie AGM ou EFB adaptée ?",

      options: [
        {
          id: "start-stop-battery-correct",

          label:
            "Oui, la batterie est adaptée",

          value:
            "Le véhicule possède le Start-Stop et la batterie AGM ou EFB installée est adaptée.",

          addsEvidence: [
            "observation-start-stop-battery",
          ],

          rejects: [
            "problem-battery-unsuitable",
          ],
        },

        {
          id: "start-stop-battery-wrong",

          label:
            "Le véhicule est Start-Stop, mais la batterie n’est peut-être pas adaptée",

          value:
            "Le véhicule possède le Start-Stop mais la batterie installée n’est peut-être pas du type adapté.",

          addsEvidence: [
            "observation-start-stop-battery",
          ],

          supports: [
            "problem-battery-unsuitable",
          ],
        },

        {
          id: "no-start-stop",

          label:
            "Le véhicule n’a pas de Start-Stop",

          value:
            "Le véhicule n’est pas équipé du système Start-Stop.",

          rejects: [
            "problem-battery-unsuitable",
          ],
        },

        {
          id: "start-stop-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si le véhicule possède le Start-Stop ou si la batterie est adaptée.",
        },
      ],
    },
  ];
