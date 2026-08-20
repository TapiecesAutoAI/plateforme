import type {
  UserProfile,
} from "./types";

export type QuestionOptionV2 = {
  id: string;

  label: string;

  value: string;
};

export type DiagnosticQuestionV2 = {
  id: string;

  text: string;

  profiles: UserProfile[];

  options: QuestionOptionV2[];
};

const ALL_PROFILES:
  UserProfile[] = [
    "particulier",
    "bricoleur",
    "vendeur",
    "garage",
    "expert",
  ];

const STARTING_QUESTIONS:
  DiagnosticQuestionV2[] = [
    {
      id:
        "question-no-start",

      text:
        "Que se passe-t-il lorsque vous essayez de démarrer le véhicule ?",

      profiles:
        ALL_PROFILES,

      options: [
        {
          id:
            "engine-not-turning",

          label:
            "Le moteur ne tourne pas",

          value:
            "Le moteur ne tourne pas lorsque j’essaie de démarrer.",
        },

        {
          id:
            "engine-turning-slowly",

          label:
            "Le moteur tourne lentement",

          value:
            "Le moteur tourne lentement lorsque j’essaie de démarrer.",
        },

        {
          id:
            "engine-turning-normal",

          label:
            "Le moteur tourne normalement mais ne démarre pas",

          value:
            "Le moteur tourne normalement mais ne démarre pas.",
        },

        {
          id:
            "single-click",

          label:
            "J’entends un seul clic",

          value:
            "J’entends un seul clic lorsque j’essaie de démarrer.",
        },

        {
          id:
            "multiple-clicks",

          label:
            "J’entends plusieurs clics rapides",

          value:
            "J’entends plusieurs clics rapides lorsque j’essaie de démarrer.",
        },

        {
          id:
            "nothing-happens",

          label:
            "Rien ne se passe",

          value:
            "Rien ne se passe lorsque j’essaie de démarrer.",
        },

        {
          id:
            "unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas exactement ce qui se passe lorsque j’essaie de démarrer.",
        },
      ],
    },

    {
      id:
        "question-click-start",

      text:
        "Quel bruit entendez-vous lorsque vous essayez de démarrer ?",

      profiles:
        ALL_PROFILES,

      options: [
        {
          id:
            "single-click",

          label:
            "Un seul clic",

          value:
            "J’entends un seul clic lorsque j’essaie de démarrer.",
        },

        {
          id:
            "multiple-clicks",

          label:
            "Plusieurs clics rapides",

          value:
            "J’entends plusieurs clics rapides lorsque j’essaie de démarrer.",
        },

        {
          id:
            "no-click",

          label:
            "Aucun clic",

          value:
            "Je n’entends aucun clic lorsque j’essaie de démarrer.",
        },

        {
          id:
            "metallic-noise",

          label:
            "Un bruit métallique ou de grincement",

          value:
            "J’entends un bruit métallique ou de grincement au démarrage.",
        },

        {
          id:
            "starter-spins-free",

          label:
            "Le démarreur tourne dans le vide",

          value:
            "Le démarreur tourne dans le vide sans entraîner le moteur.",
        },

        {
          id:
            "unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas quel bruit se produit au démarrage.",
        },
      ],
    },

    {
      id:
        "question-dim-lights",

      text:
        "Les voyants ou les phares faiblissent-ils pendant la tentative de démarrage ?",

      profiles:
        ALL_PROFILES,

      options: [
        {
          id:
            "lights-dim-strongly",

          label:
            "Oui, fortement",

          value:
            "Les voyants ou les phares faiblissent fortement pendant la tentative de démarrage.",
        },

        {
          id:
            "lights-dim-slightly",

          label:
            "Oui, légèrement",

          value:
            "Les voyants ou les phares faiblissent légèrement pendant la tentative de démarrage.",
        },

        {
          id:
            "lights-normal",

          label:
            "Non, ils restent normaux",

          value:
            "Les voyants et les phares restent normaux pendant la tentative de démarrage.",
        },

        {
          id:
            "unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si les voyants ou les phares faiblissent.",
        },
      ],
    },

    {
      id:
        "question-jump-start",

      text:
        "Le véhicule démarre-t-il avec des câbles ou un booster ?",

      profiles: [
        "bricoleur",
        "vendeur",
        "garage",
        "expert",
      ],

      options: [
        {
          id:
            "jump-start-yes",

          label:
            "Oui",

          value:
            "Le véhicule démarre avec des câbles ou un booster.",
        },

        {
          id:
            "jump-start-no",

          label:
            "Non",

          value:
            "Le véhicule ne démarre pas avec des câbles ou un booster.",
        },

        {
          id:
            "not-tested",

          label:
            "Pas encore testé",

          value:
            "Le démarrage avec des câbles ou un booster n’a pas encore été testé.",
        },

        {
          id:
            "unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si un essai avec des câbles ou un booster a été effectué.",
        },
      ],
    },

    {
      id:
        "question-starter-intermittent",

      text:
        "Le véhicule démarre-t-il parfois normalement après plusieurs tentatives ?",

      profiles:
        ALL_PROFILES,

      options: [
        {
          id:
            "intermittent-yes",

          label:
            "Oui",

          value:
            "Le véhicule démarre parfois normalement après plusieurs tentatives.",
        },

        {
          id:
            "intermittent-no",

          label:
            "Non",

          value:
            "Le véhicule ne démarre jamais, même après plusieurs tentatives.",
        },

        {
          id:
            "unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si plusieurs tentatives changent le comportement.",
        },
      ],
    },

    {
      id:
        "question-hot-engine-start",

      text:
        "Le problème apparaît-il surtout lorsque le moteur est chaud ?",

      profiles: [
        "bricoleur",
        "vendeur",
        "garage",
        "expert",
      ],

      options: [
        {
          id:
            "hot-engine-yes",

          label:
            "Oui",

          value:
            "Le problème apparaît surtout lorsque le moteur est chaud.",
        },

        {
          id:
            "hot-engine-no",

          label:
            "Non",

          value:
            "Le problème n’est pas lié à la température du moteur.",
        },

        {
          id:
            "unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si la température du moteur influence le problème.",
        },
      ],
    },
  ];

const QUESTIONS_BY_ID =
  new Map<
    string,
    DiagnosticQuestionV2
  >(
    STARTING_QUESTIONS.map(
      (question) => [
        question.id,
        question,
      ],
    ),
  );

export function getQuestionById(
  questionId: string,
): DiagnosticQuestionV2 | null {
  return (
    QUESTIONS_BY_ID.get(
      questionId,
    ) ?? null
  );
}

export function getQuestionForProfile(
  questionId: string,
  profile: UserProfile,
): DiagnosticQuestionV2 | null {
  const question =
    getQuestionById(
      questionId,
    );

  if (
    !question ||
    !question.profiles.includes(
      profile,
    )
  ) {
    return null;
  }

  return question;
}

export function getAllQuestions():
  DiagnosticQuestionV2[] {
  return STARTING_QUESTIONS.map(
    (question) => ({
      ...question,

      profiles: [
        ...question.profiles,
      ],

      options:
        question.options.map(
          (option) => ({
            ...option,
          }),
        ),
    }),
  );
}
