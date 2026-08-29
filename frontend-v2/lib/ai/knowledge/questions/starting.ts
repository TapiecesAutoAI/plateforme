import type {
  KnowledgeQuestionTemplate,
} from "./types";

/*
 * ============================================================
 * QUESTIONS — DÉMARRAGE
 * ============================================================
 *
 * Règles :
 * - la question d’ouverture doit être posée en premier ;
 * - les réponses doivent ajouter une preuve précise ;
 * - « Je ne sais pas » et « Pas encore testé » restent neutres ;
 * - les questions suivantes affinent batterie, connexions,
 *   démarreur et circuit de commande.
 */

export const startingQuestions:
  KnowledgeQuestionTemplate[] = [
    {
      id: "question-no-start",

      domains: [
        "starting",
        "electrical",
      ],

      targetEntityId:
        "symptom-no-start",

      discriminates: [
        "problem-weak-battery",
        "problem-battery-internal-failure",
        "problem-battery-connection",
        "problem-starter",
        "problem-starter-solenoid",
        "problem-starter-worn-brushes",
        "problem-starter-drive",
        "problem-starter-relay",
        "problem-starter-control-circuit",
        "problem-engine-mechanical-lock",
      ],

      /*
       * Plus la valeur est faible, plus la question est prioritaire
       * dans le moteur de sélection actuel.
       */
      priority: 1,

      purpose:
        "Cette question sépare immédiatement les principales familles de panne de démarrage.",

      text:
        "Que se passe-t-il lorsque vous essayez de démarrer le véhicule ?",

      options: [
        {
          id: "no-start-engine-not-turning",

          label:
            "Le moteur ne tourne pas",

          value:
            "Le moteur ne tourne pas lorsque j’essaie de démarrer.",

          addsEvidence: [
            "symptom-no-crank",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-connection",
            "problem-starter",
            "problem-starter-solenoid",
            "problem-starter-relay",
            "problem-starter-control-circuit",
            "problem-engine-mechanical-lock",
          ],
        },

        {
          id: "no-start-engine-turning-slowly",

          label:
            "Le moteur tourne lentement",

          value:
            "Le moteur tourne lentement lorsque j’essaie de démarrer.",

          addsEvidence: [
            "symptom-slow-cranking",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-internal-failure",
            "problem-battery-connection",
            "problem-starter",
          ],

          rejects: [
            "problem-starter-drive",
            "problem-starter-relay",
            "problem-starter-control-circuit",
          ],
        },

        {
          id: "no-start-engine-turning",

          label:
            "Le moteur tourne normalement mais ne démarre pas",

          value:
            "Le moteur tourne normalement mais ne démarre pas.",

          addsEvidence: [
            "symptom-engine-cranks",
          ],

          rejects: [
            "problem-weak-battery",
            "problem-battery-connection",
            "problem-starter",
            "problem-starter-solenoid",
            "problem-starter-worn-brushes",
            "problem-starter-relay",
            "problem-starter-control-circuit",
            "problem-engine-mechanical-lock",
          ],
        },

        {
          id: "no-start-single-click",

          label:
            "J’entends un seul clic",

          value:
            "J’entends un seul clic lorsque j’essaie de démarrer.",

          addsEvidence: [
            "symptom-single-click-start",
          ],

          supports: [
            "problem-starter",
            "problem-starter-solenoid",
            "problem-battery-connection",
            "problem-engine-mechanical-lock",
          ],
        },

        {
          id: "no-start-multiple-clicks",

          label:
            "J’entends plusieurs clics rapides",

          value:
            "J’entends plusieurs clics rapides lorsque j’essaie de démarrer.",

          addsEvidence: [
            "symptom-rapid-clicking-start",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-internal-failure",
            "problem-battery-connection",
          ],

          rejects: [
            "symptom-single-click-start",
            "symptom-starter-spins-free",
            "symptom-metallic-grinding-start",
            "problem-starter-drive",
            "problem-starter-control-circuit",
          ],
        },

        {
          id: "no-start-nothing-happens",

          label:
            "Rien ne se passe",

          value:
            "Rien ne se passe lorsque j’essaie de démarrer.",

          addsEvidence: [
            "symptom-no-crank",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-connection",
            "problem-starter-relay",
            "problem-starter-control-circuit",
          ],
        },

        {
          id: "no-start-engine-starts",

          label:
            "Le moteur démarre finalement",

          value:
            "Le moteur démarre finalement.",

          rejects: [
            "problem-engine-mechanical-lock",
          ],
        },

        {
          id: "no-start-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas exactement ce qui se passe lorsque j’essaie de démarrer.",
        },
      ],
    },

    {
      id: "question-click-start",

      domains: [
        "starting",
        "electrical",
        "noise",
      ],

      targetEntityId:
        "symptom-click-start",

      discriminates: [
        "problem-weak-battery",
        "problem-battery-internal-failure",
        "problem-battery-connection",
        "problem-starter",
        "problem-starter-solenoid",
        "problem-starter-relay",
        "problem-starter-control-circuit",
        "problem-engine-mechanical-lock",
      ],

      priority: 10,

      purpose:
        "Le nombre et le rythme des clics permettent de distinguer une chute de tension d’un défaut du démarreur ou de sa commande.",

      text:
        "Quel bruit entendez-vous lorsque vous essayez de démarrer ?",

      options: [
        {
          id: "click-single",

          label:
            "Un seul clic",

          value:
            "J’entends un seul clic lorsque j’essaie de démarrer.",

          addsEvidence: [
            "symptom-single-click-start",
          ],

          supports: [
            "problem-starter",
            "problem-starter-solenoid",
            "problem-battery-connection",
            "problem-engine-mechanical-lock",
          ],

          rejects: [
            "symptom-rapid-clicking-start",
            "symptom-starter-spins-free",
            "symptom-metallic-grinding-start",
          ],
        },

        {
          id: "click-multiple",

          label:
            "Plusieurs clics rapides",

          value:
            "J’entends plusieurs clics rapides lorsque j’essaie de démarrer.",

          addsEvidence: [
            "symptom-rapid-clicking-start",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-internal-failure",
            "problem-battery-connection",
          ],

          rejects: [
            "symptom-single-click-start",
            "symptom-starter-spins-free",
            "symptom-metallic-grinding-start",
            "problem-starter-drive",
            "problem-starter-control-circuit",
          ],
        },

        {
          id: "click-none",

          label:
            "Aucun clic",

          value:
            "Je n’entends aucun clic lorsque j’essaie de démarrer.",

          supports: [
            "problem-starter-relay",
            "problem-starter-control-circuit",
            "problem-weak-battery",
          ],

          rejects: [
            "problem-starter-solenoid",
          ],
        },

        {
          id: "click-metallic",

          label:
            "Un bruit métallique ou de grincement",

          value:
            "J’entends un bruit métallique ou de grincement au démarrage.",

          addsEvidence: [
            "symptom-metallic-grinding-start",
          ],

          supports: [
            "problem-starter-drive",
          ],

          rejects: [
            "symptom-single-click-start",
            "symptom-rapid-clicking-start",
            "symptom-starter-spins-free",
          ],
        },

        {
          id: "click-spins-free",

          label:
            "Le démarreur tourne dans le vide",

          value:
            "Le démarreur tourne dans le vide sans entraîner le moteur.",

          addsEvidence: [
            "symptom-starter-spins-free",
          ],

          supports: [
            "problem-starter-drive",
          ],

          rejects: [
            "symptom-single-click-start",
            "symptom-rapid-clicking-start",
            "symptom-metallic-grinding-start",
            "problem-weak-battery",
            "problem-battery-internal-failure",
            "problem-battery-connection",
            "problem-starter-relay",
            "problem-starter-control-circuit",
          ],
        },

        {
          id: "click-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas quel bruit se produit au démarrage.",
        },
      ],
    },

    {
      id: "question-jump-start",

      domains: [
        "starting",
        "electrical",
      ],

      targetEntityId:
        "observation-jump-start-success",

      discriminates: [
        "problem-weak-battery",
        "problem-battery-internal-failure",
        "problem-battery-connection",
        "problem-starter",
        "problem-starter-solenoid",
        "problem-engine-mechanical-lock",
      ],

      priority: 20,

      purpose:
        "L’effet d’une alimentation externe aide à distinguer un manque d’énergie d’un défaut du démarreur ou d’un blocage mécanique.",

      text:
        "Le véhicule démarre-t-il avec des câbles ou un booster ?",

      options: [
        {
          id: "jump-start-yes",

          label:
            "Oui",

          value:
            "Le véhicule démarre avec des câbles ou un booster.",

          addsEvidence: [
            "observation-jump-start-success",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-internal-failure",
            "problem-battery-connection",
          ],

          rejects: [
            "problem-starter",
            "problem-starter-solenoid",
            "problem-engine-mechanical-lock",
          ],
        },

        {
          id: "jump-start-no",

          label:
            "Non",

          value:
            "Le véhicule ne démarre pas avec des câbles ou un booster.",

          addsEvidence: [
            "observation-jump-start-fails",
          ],

          supports: [
            "problem-starter",
            "problem-starter-solenoid",
            "problem-engine-mechanical-lock",
            "problem-battery-connection",
          ],

          rejects: [
            "problem-weak-battery",
          ],
        },

        {
          id: "jump-start-not-tested",

          label:
            "Pas encore testé",

          value:
            "Je n’ai pas encore essayé de démarrer avec des câbles ou un booster.",
        },

        {
          id: "jump-start-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si un essai avec des câbles ou un booster a été effectué.",
        },
      ],
    },

    {
      id: "question-dim-lights",

      domains: [
        "starting",
        "electrical",
      ],

      targetEntityId:
        "observation-dim-lights",

      discriminates: [
        "problem-weak-battery",
        "problem-battery-internal-failure",
        "problem-battery-connection",
        "problem-starter",
        "problem-starter-solenoid",
        "problem-engine-mechanical-lock",
      ],

      priority: 30,

      purpose:
        "La variation de luminosité indique si la tension s’effondre pendant la tentative de démarrage.",

      text:
        "Les voyants ou les phares faiblissent-ils pendant la tentative de démarrage ?",

      options: [
        {
          id: "dim-lights-yes",

          label:
            "Oui, fortement",

          value:
            "Les voyants ou les phares faiblissent fortement pendant la tentative de démarrage.",

          addsEvidence: [
            "observation-dim-lights",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-internal-failure",
            "problem-battery-connection",
            "problem-engine-mechanical-lock",
          ],
        },

        {
          id: "dim-lights-slightly",

          label:
            "Oui, légèrement",

          value:
            "Les voyants ou les phares faiblissent légèrement pendant la tentative de démarrage.",

          addsEvidence: [
            "observation-dim-lights",
          ],

          supports: [
            "problem-weak-battery",
            "problem-battery-connection",
            "problem-starter",
          ],
        },

        {
          id: "dim-lights-no",

          label:
            "Non, ils restent normaux",

          value:
            "Les voyants et les phares restent normaux pendant la tentative de démarrage.",

          addsEvidence: [
            "observation-full-lights",
          ],

          supports: [
            "problem-starter",
            "problem-starter-solenoid",
            "problem-starter-relay",
            "problem-starter-control-circuit",
            "problem-battery-connection",
          ]
        },

        {
          id: "dim-lights-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si les voyants ou les phares faiblissent.",
        },
      ],
    },

    {
      id: "question-starter-intermittent",

      domains: [
        "starting",
      ],

      targetEntityId:
        "symptom-starter-intermittent",

      discriminates: [
        "problem-starter",
        "problem-starter-worn-brushes",
        "problem-starter-relay",
        "problem-starter-control-circuit",
      ],

      priority: 40,

      purpose:
        "Un fonctionnement aléatoire oriente vers un défaut intermittent du démarreur ou de sa commande.",

      text:
        "Le véhicule démarre-t-il parfois normalement après plusieurs tentatives ?",

      options: [
        {
          id: "starter-intermittent-yes",

          label:
            "Oui",

          value:
            "Le véhicule démarre parfois normalement après plusieurs tentatives.",

          addsEvidence: [
            "symptom-starter-intermittent",
          ],

          supports: [
            "problem-starter-worn-brushes",
            "problem-starter",
            "problem-starter-relay",
            "problem-starter-control-circuit",
          ],
        },

        {
          id: "starter-intermittent-no",

          label:
            "Non",

          value:
            "Le véhicule ne démarre jamais, même après plusieurs tentatives.",

          rejects: [
            "problem-starter-worn-brushes",
          ],
        },

        {
          id: "starter-intermittent-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si plusieurs tentatives changent le comportement.",
        },
      ],
    },

    {
      id: "question-hot-engine-start",

      domains: [
        "starting",
      ],

      targetEntityId:
        "observation-problem-hot-engine",

      discriminates: [
        "problem-starter",
        "problem-starter-worn-brushes",
        "problem-starter-solenoid",
      ],

      priority: 50,

      purpose:
        "Une panne surtout à chaud peut révéler un défaut interne intermittent du démarreur.",

      text:
        "Le problème apparaît-il surtout lorsque le moteur est chaud ?",

      options: [
        {
          id: "hot-engine-yes",

          label:
            "Oui",

          value:
            "Le problème apparaît surtout lorsque le moteur est chaud.",

          addsEvidence: [
            "observation-problem-hot-engine",
          ],

          supports: [
            "problem-starter-worn-brushes",
            "problem-starter",
            "problem-starter-solenoid",
          ],
        },

        {
          id: "hot-engine-no",

          label:
            "Non",

          value:
            "Le problème n’est pas lié à la température du moteur.",
        },

        {
          id: "hot-engine-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si la température du moteur influence le problème.",
        },
      ],
    },
  ];

