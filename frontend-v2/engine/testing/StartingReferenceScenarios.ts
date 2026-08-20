import type {
  DiagnosticScenario,
} from "./DiagnosticScenario";

export const STARTING_REFERENCE_SCENARIOS_V2:
  DiagnosticScenario[] = [
    {
      id:
        "starting-v2-battery-old-single-click",

      title:
        "Batterie ancienne avec clic unique",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "La voiture ne démarre plus et j'entends un seul clic.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionId:
            "single-click",
        },

        {
          questionContains:
            "voyants",

          optionLabelContains:
            "fortement",
        },

        {
          questionContains:
            "booster",

          optionLabelContains:
            "test non effectué",
        },

        {
          questionContains:
            "bornes",

          optionLabelContains:
            "je ne sais pas",
        },

        {
          questionContains:
            "âge",

          optionLabelContains:
            "plus de 4 ans",
        },
      ],

      expectation: {
        maximumQuestions:
          6,

        expectedHypothesisIds: [
          "problem-weak-battery",
        ],

        expectedPartNames: [
          "Batterie",
        ],

        minimumConfidence:
          0.55,

        maximumConfidence:
          1,

        forbiddenQuestionIds: [
          "starting-spare-key-test",
          "starting-fuel-pump-sound",
          "starting-engine-seized-check",
        ],

        forbiddenQuestionTerms: [
          "seconde clé",
          "carburant",
          "vilebrequin",
        ],
      },
    },

    {
      id:
        "starting-v2-starter-single-click",

      title:
        "Démarreur probable avec clic unique",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "La voiture ne démarre plus et j'entends un clic.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionId:
            "single-click",
        },

        {
          questionContains:
            "voyants",

          optionLabelContains:
            "restent normaux",
        },

        {
          questionContains:
            "booster",

          optionLabelContains:
            "aucun changement",
        },

        {
          questionContains:
            "bornes",

          optionLabelContains:
            "oui",
        },

        {
          questionContains:
            "âge",

          optionLabelContains:
            "moins de 2 ans",
        },
      ],

      expectation: {
        maximumQuestions:
          7,

        expectedHypothesisIds: [
          "problem-starter",
        ],

        expectedPartNames: [
          "Démarreur",
          "Solénoïde de démarreur",
        ],

        minimumConfidence:
          0.65,

        maximumConfidence:
          1,

        forbiddenQuestionIds: [
          "starting-fuel-question",
          "starting-fuel-pump-sound",
        ],

        forbiddenQuestionTerms: [
          "réservoir",
          "pompe à carburant",
        ],
      },
    },

    {
      id:
        "starting-v2-rapid-clicks-battery",

      title:
        "Clics rapides et batterie faible",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "Ma voiture fait plusieurs clics rapides et ne démarre pas.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionId:
            "rapid-clicking",
        },

        {
          questionContains:
            "voyants",

          optionLabelContains:
            "fortement",
        },

        {
          questionContains:
            "booster",

          optionLabelContains:
            "moteur tourne maintenant normalement",
        },

        {
          questionContains:
            "âge",

          optionLabelContains:
            "plus de 4 ans",
        },
      ],

      expectation: {
        maximumQuestions:
          6,

        expectedHypothesisIds: [
          "problem-weak-battery",
        ],

        expectedPartNames: [
          "Batterie",
        ],

        minimumConfidence:
          0.75,

        maximumConfidence:
          1,

        forbiddenQuestionIds: [
          "starting-spare-key-test",
          "starting-fuel-question",
          "starting-fuel-pump-sound",
        ],

        forbiddenQuestionTerms: [
          "seconde clé",
          "carburant",
          "bourdonnement",
        ],
      },
    },

    {
      id:
        "starting-v2-battery-connection",

      title:
        "Connexion de batterie défectueuse",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "La voiture ne démarre pas et les voyants faiblissent fortement.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionId:
            "single-click",
        },

        {
          questionContains:
            "voyants",

          optionLabelContains:
            "fortement",
        },

        {
          questionContains:
            "bornes",

          optionId:
            "bad",
        },

        {
          questionContains:
            "Après nettoyage",

          optionId:
            "yes",
        },

        {
          questionContains:
            "booster",

          optionLabelContains:
            "test non effectué",
        },
      ],

      expectation: {
        maximumQuestions:
          6,

        expectedHypothesisIds: [
          "problem-battery-connection",
        ],

        expectedPartNames: [
          "Cosse de batterie",
          "Câble positif",
          "Câble de masse",
          "Tresse de masse moteur",
        ],

        minimumConfidence:
          0.55,

        maximumConfidence:
          1,

        forbiddenQuestionIds: [
          "starting-fuel-question",
          "starting-fuel-pump-sound",
        ],

        forbiddenQuestionTerms: [
          "carburant",
          "bourdonnement",
        ],
      },
    },

    {
      id:
        "starting-v2-immobilizer",

      title:
        "Antidémarrage ou clé non reconnue",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "La voiture ne démarre pas et un voyant avec une clé clignote.",

      initialEvidenceIds: [
        "observation-immobilizer-warning",
      ],

      answers: [
        {
  questionContains:
    "Que se passe-t-il",

  optionId:
    "no-crank",
},
{
          questionContains:
            "Que se passe-t-il",

          optionId:
            "engine-not-turning",
        },

        {
          questionContains:
            "clé, cadenas ou antivol",

          optionId:
            "yes",
        },

        {
          questionContains:
            "seconde clé",

          optionId:
            "yes",
        },

        {
          questionContains:
            "voyants",

          optionLabelContains:
            "restent normaux",
        },
      ],

      expectation: {
        maximumQuestions:
          6,

        expectedHypothesisIds: [
          "problem-immobilizer",
        ],

        expectedPartNames: [
          "Clé codée",
          "Transpondeur de clé",
          "Antenne d'antidémarrage",
          "Boîtier antidémarrage",
        ],

        minimumConfidence:
          0.55,

        maximumConfidence:
          1,

        forbiddenQuestionIds: [
          "starting-fuel-question",
          "starting-engine-seized-check",
        ],

        forbiddenQuestionTerms: [
          "vilebrequin",
        ],
      },
    },

    {
      id:
        "starting-v2-fuel-supply",

      title:
        "Alimentation carburant insuffisante",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "Le moteur tourne mais la voiture ne démarre pas.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionId:
            "engine-cranks",
        },

        {
          questionContains:
            "voyants",

          optionLabelContains:
            "restent normaux",
        },

    {
      questionContains:
        "combien de temps",

      optionId:
        "three-ten",
    },

        {
          questionContains:
            "réservoir",

          optionId:
            "yes",
        },

        {
          questionContains:
            "bourdonnement",

          optionId:
            "no",
        },

        {
          questionContains:
            "signes qu'il veut démarrer",

          optionId:
            "no",
        },
      ],

      expectation: {
        maximumQuestions:
          7,

        expectedHypothesisIds: [
          "problem-fuel-supply",
        ],

        expectedPartNames: [
          "Pompe à carburant",
          "Relais de pompe à carburant",
          "Fusible de pompe à carburant",
          "Filtre à carburant",
          "Faisceau de pompe",
        ],

        minimumConfidence:
          0.50,

        maximumConfidence:
          1,

        forbiddenQuestionIds: [
          "starting-battery-voltage-known",
          "starting-check-battery-terminals",
        ],

        forbiddenQuestionTerms: [
          "tension de la batterie",
          "bornes de la batterie",
        ],
      },
    },

    {
      id:
        "starting-v2-starter-drive",

      title:
        "Démarreur tournant dans le vide",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "J'entends le démarreur tourner rapidement, mais le moteur ne tourne pas.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionId:
            "starter-spins-free",
        },

        {
          questionContains:
            "démarreur tourne-t-il rapidement",

          optionId:
            "yes",
        },
      ],

      expectation: {
        maximumQuestions:
          5,

        expectedHypothesisIds: [
          "problem-starter-drive",
        ],

        expectedPartNames: [
          "Lanceur de démarreur",
          "Pignon de démarreur",
          "Démarreur complet",
          "Couronne de volant moteur",
        ],

        minimumConfidence:
          0.50,

        maximumConfidence:
          1,

        forbiddenQuestionIds: [
          "starting-fuel-question",
          "starting-spare-key-test",
          "starting-battery-age",
        ],

        forbiddenQuestionTerms: [
          "carburant",
          "seconde clé",
          "âge approximatif",
        ],
      },
    },
  ];




