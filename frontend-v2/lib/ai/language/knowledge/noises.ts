import type {
  AutomotiveLanguageRule,
  AutomotiveNoiseType,
} from "../types";

export const automotiveNoiseRules: Array<
  AutomotiveLanguageRule<AutomotiveNoiseType>
> = [
  {
    value: "clicking",
    confidence: 0.95,
    patterns: [
      "clac",
      "clac clac",
      "clic",
      "clic clic",
      "claquement",
      "cliquetis",
      "tac",
      "tac tac",
      "toc",
      "toc toc",
    ],
  },

  {
    value: "clunking",
    confidence: 0.95,
    patterns: [
      "gros clac",
      "gros claquement",
      "coup",
      "coup sourd",
      "ca tape",
      "tape fort",
    ],
  },

  {
    value: "grinding",
    confidence: 0.95,
    patterns: [
      "grincement metallique",
      "bruit de broyage",
      "ca broie",
      "ca grince fort",
      "bruit de ferraille",
    ],
  },

  {
    value: "squeaking",
    confidence: 0.9,
    patterns: [
      "grincement",
      "couinement",
      "couine",
      "grince",
      "grince doucement",
    ],
  },

  {
    value: "squealing",
    confidence: 0.9,
    patterns: [
      "crissement",
      "crisse",
      "cri aigu",
      "bruit aigu",
    ],
  },

  {
    value: "whistling",
    confidence: 0.9,
    patterns: [
      "sifflement",
      "siffle",
      "bruit de sifflet",
    ],
  },

  {
    value: "humming",
    confidence: 0.9,
    patterns: [
      "ronronnement",
      "ronronne",
      "grondement regulier",
      "bruit sourd regulier",
    ],
  },

  {
    value: "buzzing",
    confidence: 0.85,
    patterns: [
      "bourdonnement",
      "bourdonne",
      "bruit electrique",
      "vibration electrique",
    ],
  },

  {
    value: "rattling",
    confidence: 0.9,
    patterns: [
      "cliquetement",
      "ferraille",
      "bruit de casserole",
      "ca tremble",
      "ca vibre et claque",
    ],
  },

  {
    value: "knocking",
    confidence: 0.95,
    patterns: [
      "cognement",
      "cogne",
      "toc moteur",
      "claquement moteur",
      "bruit de bielle",
    ],
  },

  {
    value: "scraping",
    confidence: 0.95,
    patterns: [
      "frottement",
      "frotte",
      "bruit de frottement",
      "racle",
      "raclement",
    ],
  },

  {
    value: "metallic",
    confidence: 0.8,
    patterns: [
      "bruit metallique",
      "metal contre metal",
      "bruit de fer",
      "ferraille",
    ],
  },
];
