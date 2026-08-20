import type {
  KnowledgeQuestionTemplate,
} from "./types";

export const noiseQuestions:
  KnowledgeQuestionTemplate[] = [
    {
      id: "question-noise-type",

      domains: [
        "noise",
        "braking",
        "transmission",
        "suspension",
      ],

      targetEntityId:
        "symptom-vehicle-noise",

      discriminates: [
        "problem-cv-joint",
        "problem-wheel-bearing",
        "problem-brake-disc",
      ],

      priority: 95,

      purpose:
        "Identifier la nature du bruit afin d’orienter le diagnostic vers la transmission, les roues ou le freinage.",

      text:
        "Quel type de bruit entendez-vous principalement ?",

      options: [
        {
          id: "noise-type-clicking",

          label:
            "Claquement ou clic-clic",

          value:
            "J’entends un claquement ou un clic-clic répétitif.",

          addsEvidence: [
            "symptom-clicking-noise",
          ],

          supports: [
            "problem-cv-joint",
          ],
        },

        {
          id: "noise-type-humming",

          label:
            "Ronflement ou grondement",

          value:
            "J’entends un ronflement ou un grondement continu.",

          addsEvidence: [
            "symptom-humming-noise",
          ],

          supports: [
            "problem-wheel-bearing",
          ],
        },

        {
          id: "noise-type-grinding",

          label:
            "Grincement ou frottement",

          value:
            "J’entends un grincement ou un bruit de frottement.",

          addsEvidence: [
            "symptom-grinding-noise",
          ],

          supports: [
            "problem-brake-disc",
          ],
        },

        {
          id: "noise-type-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas définir précisément le type de bruit.",
        },
      ],
    },

    {
      id: "question-noise-turning",

      domains: [
        "noise",
        "transmission",
        "steering",
      ],

      targetEntityId:
        "observation-noise-while-turning",

      discriminates: [
        "problem-cv-joint",
        "problem-wheel-bearing",
      ],

      priority: 85,

      purpose:
        "Vérifier si le bruit est lié aux virages et aux éléments de transmission ou de roue.",

      text:
        "Le bruit apparaît-il ou devient-il plus fort lorsque vous tournez ?",

      options: [
        {
          id: "noise-turning-yes",

          label:
            "Oui",

          value:
            "Le bruit apparaît ou devient plus fort lorsque je tourne.",

          addsEvidence: [
            "observation-noise-while-turning",
          ],

          supports: [
            "problem-cv-joint",
            "problem-wheel-bearing",
          ],
        },

        {
          id: "noise-turning-no",

          label:
            "Non",

          value:
            "Le bruit ne change pas lorsque je tourne.",

          rejects: [
            "problem-cv-joint",
          ],
        },

        {
          id: "noise-turning-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si le bruit change lorsque je tourne.",
        },
      ],
    },

    {
      id: "question-noise-speed",

      domains: [
        "noise",
        "transmission",
        "suspension",
      ],

      targetEntityId:
        "observation-noise-increases-with-speed",

      discriminates: [
        "problem-wheel-bearing",
        "problem-cv-joint",
      ],

      priority: 75,

      purpose:
        "Déterminer si la fréquence ou l’intensité du bruit dépend de la vitesse du véhicule.",

      text:
        "Le bruit augmente-t-il avec la vitesse du véhicule ?",

      options: [
        {
          id: "noise-speed-yes",

          label:
            "Oui",

          value:
            "Le bruit augmente avec la vitesse du véhicule.",

          addsEvidence: [
            "observation-noise-increases-with-speed",
          ],

          supports: [
            "problem-wheel-bearing",
          ],
        },

        {
          id: "noise-speed-no",

          label:
            "Non",

          value:
            "Le bruit n’augmente pas avec la vitesse du véhicule.",

          rejects: [
            "problem-wheel-bearing",
          ],
        },

        {
          id: "noise-speed-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si le bruit augmente avec la vitesse.",
        },
      ],
    },

    {
      id: "question-noise-braking",

      domains: [
        "noise",
        "braking",
      ],

      targetEntityId:
        "observation-noise-while-braking",

      discriminates: [
        "problem-brake-disc",
        "problem-wheel-bearing",
      ],

      priority: 80,

      purpose:
        "Vérifier si le bruit est directement lié au freinage.",

      text:
        "Le bruit apparaît-il surtout lorsque vous freinez ?",

      options: [
        {
          id: "noise-braking-yes",

          label:
            "Oui",

          value:
            "Le bruit apparaît surtout lorsque je freine.",

          addsEvidence: [
            "observation-noise-while-braking",
          ],

          supports: [
            "problem-brake-disc",
          ],
        },

        {
          id: "noise-braking-no",

          label:
            "Non",

          value:
            "Le bruit n’est pas spécialement lié au freinage.",

          rejects: [
            "problem-brake-disc",
          ],
        },

        {
          id: "noise-braking-unsure",

          label:
            "Je ne sais pas",

          value:
            "Je ne sais pas si le bruit est lié au freinage.",
        },
      ],
    },
  ];

