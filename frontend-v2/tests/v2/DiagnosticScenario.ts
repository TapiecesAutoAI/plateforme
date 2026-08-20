export type DiagnosticTestProfile =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur";

export interface DiagnosticScenarioAnswer {
  questionId?:
    string;

  questionContains?:
    string;

  optionId?:
    string;

  optionLabelContains?:
    string;
}

export interface DiagnosticScenarioExpectation {
  maximumQuestions:
    number;

  expectedHypothesisIds:
    string[];

  expectedPartNames:
    string[];

  minimumConfidence:
    number;

  maximumConfidence:
    number;

  forbiddenQuestionIds:
    string[];

  forbiddenQuestionTerms:
    string[];
}

export interface DiagnosticScenario {
  id:
    string;

  title:
    string;

  profile:
    DiagnosticTestProfile;

  domain:
    "starting";

  complaint:
    string;

  initialEvidenceIds?:
    string[];

  answers:
    DiagnosticScenarioAnswer[];

  expectation:
    DiagnosticScenarioExpectation;
}

export interface DiagnosticScenarioStep {
  index:
    number;

  questionId:
    string;

  questionText:
    string;

  selectedOptionId:
    string;

  selectedOptionLabel:
    string;
}

export interface DiagnosticScenarioResult {
  scenarioId:
    string;

  passed:
    boolean;

  questionCount:
    number;

  conclusionId:
    string | null;

  conclusionTitle:
    string | null;

  confidence:
    number;

  recommendedPart:
    string | null;

  steps:
    DiagnosticScenarioStep[];

  failures:
    string[];
}

export const STARTING_REFERENCE_SCENARIOS:
  DiagnosticScenario[] = [
    {
      id:
        "starting-battery-old-single-click",

      title:
        "Batterie ancienne, clic unique et éclairage faible",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "Ma voiture ne démarre plus depuis ce matin.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionLabelContains:
            "un seul clic",
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
            "non effectué",
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
          "problem-weak-battery",
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
          "starting-fuel-question",
          "starting-engine-seized-check",
        ],

        forbiddenQuestionTerms: [
          "seconde clé",
          "carburant",
          "bourdonnement",
          "vilebrequin",
        ],
      },
    },

    {
      id:
        "starting-starter-single-click",

      title:
        "Démarreur probable avec clic unique et booster inefficace",

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

          optionLabelContains:
            "un seul clic",
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
          "problem-starter",
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
        "starting-rapid-clicks-battery",

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

          optionLabelContains:
            "plusieurs clics rapides",
        },

        {
          questionContains:
            "voyants",

          optionLabelContains:
            "fortement",
        },

        {
          questionContains:
            "âge",

          optionLabelContains:
            "plus de 4 ans",
        },

        {
          questionContains:
            "booster",

          optionLabelContains:
            "démarre",
        },
      ],

      expectation: {
        maximumQuestions:
          6,

        expectedHypothesisIds: [
          "problem-weak-battery",
          "problem-weak-battery",
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
        "starting-battery-terminal-connection",

      title:
        "Connexion ou cosse de batterie défectueuse",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "La voiture ne démarre pas et les voyants s'éteignent.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionLabelContains:
            "un seul clic",
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

          optionLabelContains:
            "oxyd",
        },
      ],

      expectation: {
        maximumQuestions:
          6,

        expectedHypothesisIds: [
          "problem-battery-connection",
          "problem-battery-connection",
          "problem-battery-connection",
        ],

        expectedPartNames: [
          "Cosse de batterie",
          "Câble de masse",
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
        "starting-immobilizer",

      title:
        "Antidémarrage ou clé non reconnue",

      profile:
        "particulier",

      domain:
        "starting",

      complaint:
        "La voiture ne démarre pas et un voyant avec une clé clignote.",

      answers: [
        {
          questionContains:
            "Que se passe-t-il",

          optionLabelContains:
            "aucun bruit",
        },

        {
          questionContains:
            "antivol",

          optionLabelContains:
            "oui",
        },

        {
          questionContains:
            "seconde clé",

          optionLabelContains:
            "oui",
        },
      ],

      expectation: {
        maximumQuestions:
          6,

        expectedHypothesisIds: [
          "problem-immobilizer",
          "problem-immobilizer",
        ],

        expectedPartNames: [
          "Clé",
          "Antidémarrage",
          "Transpondeur",
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
        "starting-fuel-pump",

      title:
        "Pompe à carburant probable",

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

          optionLabelContains:
            "moteur tourne",
        },

        {
          questionContains:
            "carburant",

          optionLabelContains:
            "oui",
        },

        {
          questionContains:
            "bourdonnement",

          optionLabelContains:
            "non",
        },
      ],

      expectation: {
        maximumQuestions:
          7,

        expectedHypothesisIds: [
          "problem-fuel-supply",
          "problem-fuel-supply",
        ],

        expectedPartNames: [
          "Pompe à carburant",
        ],

        minimumConfidence:
          0.5,

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
        "starting-starter-spins-free",

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

          optionLabelContains:
            "tourne rapidement",
        },
      ],

      expectation: {
        maximumQuestions:
          5,

        expectedHypothesisIds: [
          "problem-starter-drive",
          "problem-starter-drive",
          "problem-starter-drive",
        ],

        expectedPartNames: [
          "Démarreur",
          "Lanceur de démarreur",
        ],

        minimumConfidence:
          0.5,

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


