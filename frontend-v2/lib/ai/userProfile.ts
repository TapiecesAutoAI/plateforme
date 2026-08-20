import type {
  ChatMessage,
} from "./conversation";

import {
  normalizeText,
} from "./conversation";

export type UserProfileType =
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur"
  | "etudiant-mecanique"
  | "autre-professionnel";

export type UserSkillLevel =
  | "novice"
  | "amateur"
  | "professional";

export type UserProfileOption = {
  id: UserProfileType;
  label: string;
  description: string;
  skillLevel: UserSkillLevel;
};

export type UserSkillProfile = {
  profile: UserProfileType | null;
  level: UserSkillLevel;
  confidence: number;
  amateurScore: number;
  professionalScore: number;
  detectedSignals: string[];
  selectedExplicitly: boolean;
};

type SkillSignal = {
  id: string;
  pattern: RegExp;
  level: "amateur" | "professional";
  weight: number;
};

const PROFESSIONAL_THRESHOLD = 4;
const AMATEUR_THRESHOLD = 2;

export const USER_PROFILE_QUESTION_ID =
  "question-user-profile";

export const USER_PROFILE_QUESTION_TEXT =
  "Quel profil vous correspond le mieux ?";

export const USER_PROFILE_OPTIONS: UserProfileOption[] = [
  {
    id: "particulier",
    label: "Particulier",
    description: "Je ne connais pas ou peu la mécanique.",
    skillLevel: "novice",
  },
  {
    id: "bricoleur",
    label: "Bricoleur",
    description: "Je réalise moi-même certains contrôles ou entretiens.",
    skillLevel: "amateur",
  },
  {
    id: "vendeur-pieces-auto",
    label: "Vendeur de pièces auto",
    description: "Je conseille un client et je cherche la pièce probablement concernée.",
    skillLevel: "amateur",
  },
  {
    id: "mecanicien-garage",
    label: "Mécanicien / Garage",
    description: "Je peux effectuer des mesures et contrôles techniques avancés.",
    skillLevel: "professional",
  },
  {
    id: "depanneur",
    label: "Dépanneur",
    description: "Je dois identifier rapidement la panne sur place.",
    skillLevel: "professional",
  },
  {
    id: "etudiant-mecanique",
    label: "Étudiant en mécanique",
    description: "Je connais les bases et je souhaite aussi comprendre le raisonnement.",
    skillLevel: "amateur",
  },
  {
    id: "autre-professionnel",
    label: "Autre professionnel",
    description: "Je travaille dans l’automobile sans être nécessairement mécanicien.",
    skillLevel: "professional",
  },
];

const SKILL_SIGNALS: SkillSignal[] = [
  {
    id: "uses-multimeter",
    pattern: /\bmultimetre\b/,
    level: "amateur",
    weight: 1,
  },
  {
    id: "mentions-voltage",
    pattern: /\b\d{1,2}(?:[.,]\d+)?\s*(?:v|volt|volts)\b/,
    level: "amateur",
    weight: 1,
  },
  {
    id: "uses-booster",
    pattern: /\b(?:booster|cables de demarrage|cables batterie)\b/,
    level: "amateur",
    weight: 1,
  },
  {
    id: "uses-battery-charger",
    pattern: /\b(?:chargeur de batterie|recharge complete|batterie rechargee)\b/,
    level: "amateur",
    weight: 1,
  },
  {
    id: "mentions-obd",
    pattern: /\b(?:obd|valise diagnostic|lecteur de code|code defaut)\b/,
    level: "amateur",
    weight: 1,
  },
  {
    id: "parasitic-current-value",
    pattern: /\b\d{1,4}\s*(?:ma|milliampere|milliamperes)\b/,
    level: "professional",
    weight: 2,
  },
  {
    id: "voltage-drop",
    pattern: /\b(?:chute de tension|voltage drop)\b/,
    level: "professional",
    weight: 2,
  },
  {
    id: "vehicle-sleep",
    pattern: /\b(?:mise en sommeil|vehicule endormi|reseau endormi|apres endormissement)\b/,
    level: "professional",
    weight: 2,
  },
  {
    id: "alternator-ripple",
    pattern: /\b(?:ripple alternateur|ondulation alternateur|courant alternatif residuel)\b/,
    level: "professional",
    weight: 2,
  },
  {
    id: "oscilloscope",
    pattern: /\boscilloscope\b/,
    level: "professional",
    weight: 2,
  },
  {
    id: "clamp-meter",
    pattern: /\b(?:pince amperemetrique|pince ampèremetrique)\b/,
    level: "professional",
    weight: 2,
  },
  {
    id: "lin-bus",
    pattern: /\b(?:lin bus|bus lin|reseau lin)\b/,
    level: "professional",
    weight: 2,
  },
  {
    id: "can-bus",
    pattern: /\b(?:can bus|bus can|reseau can)\b/,
    level: "professional",
    weight: 2,
  },
  {
    id: "pwm-signal",
    pattern: /\b(?:pwm|rapport cyclique|signal de commande alternateur)\b/,
    level: "professional",
    weight: 2,
  },
];

function clamp(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(value, 1));
}

function getUserText(messages: ChatMessage[]): string {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ");
}

function getProfileOption(
  profile: UserProfileType,
): UserProfileOption {
  const option = USER_PROFILE_OPTIONS.find(
    (currentOption) => currentOption.id === profile,
  );

  if (!option) {
    throw new Error(
      `Profil utilisateur inconnu : ${profile}`,
    );
  }

  return option;
}

export function getUserProfileOption(
  profile: UserProfileType,
): UserProfileOption {
  return {
    ...getProfileOption(profile),
  };
}

export function getUserProfileOptions():
  UserProfileOption[] {
  return USER_PROFILE_OPTIONS.map(
    (option) => ({
      ...option,
    }),
  );
}

export function detectExplicitUserProfile(
  value: string,
): UserProfileType | null {
  const normalizedText = normalizeText(value);

  if (
    /\b(?:particulier|conducteur|client particulier|je n y connais rien|je ne connais rien en mecanique)\b/.test(
      normalizedText,
    )
  ) {
    return "particulier";
  }

  if (
    /\b(?:bricoleur|je bricole|je fais moi meme|mecanique amateur)\b/.test(
      normalizedText,
    )
  ) {
    return "bricoleur";
  }

  if (
    /\b(?:vendeur de pieces auto|vendeur pieces auto|magasin de pieces auto|comptoir pieces auto|pieces automobile)\b/.test(
      normalizedText,
    )
  ) {
    return "vendeur-pieces-auto";
  }

  if (
    /\b(?:mecanicien|garagiste|garage automobile|technicien automobile)\b/.test(
      normalizedText,
    )
  ) {
    return "mecanicien-garage";
  }

  if (
    /\b(?:depanneur|depannage automobile|assistance routiere)\b/.test(
      normalizedText,
    )
  ) {
    return "depanneur";
  }

  if (
    /\b(?:etudiant en mecanique|apprenti mecanicien|formation mecanique)\b/.test(
      normalizedText,
    )
  ) {
    return "etudiant-mecanique";
  }

  if (
    /\b(?:autre professionnel|professionnel automobile|professionnel de l automobile)\b/.test(
      normalizedText,
    )
  ) {
    return "autre-professionnel";
  }

  return null;
}

function detectProfileFromMessages(
  messages: ChatMessage[],
): UserProfileType | null {
  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }

    const profile =
      detectExplicitUserProfile(
        message.content,
      );

    if (profile) {
      return profile;
    }
  }

  return null;
}

export function detectUserSkillProfile(
  messages: ChatMessage[],
): UserSkillProfile {
  const explicitProfile =
    detectProfileFromMessages(messages);

  if (explicitProfile) {
    const option =
      getProfileOption(explicitProfile);

    return {
      profile: explicitProfile,
      level: option.skillLevel,
      confidence: 1,
      amateurScore:
        option.skillLevel === "amateur"
          ? AMATEUR_THRESHOLD
          : 0,
      professionalScore:
        option.skillLevel === "professional"
          ? PROFESSIONAL_THRESHOLD
          : 0,
      detectedSignals: [
        `profile-${explicitProfile}`,
      ],
      selectedExplicitly: true,
    };
  }

  const normalizedText =
    normalizeText(getUserText(messages));

  let amateurScore = 0;
  let professionalScore = 0;

  const detectedSignals: string[] = [];

  for (const signal of SKILL_SIGNALS) {
    if (!signal.pattern.test(normalizedText)) {
      continue;
    }

    detectedSignals.push(signal.id);

    if (signal.level === "professional") {
      professionalScore += signal.weight;
    } else {
      amateurScore += signal.weight;
    }
  }

  if (
    professionalScore >=
    PROFESSIONAL_THRESHOLD
  ) {
    return {
      profile: null,
      level: "professional",
      confidence: clamp(
        0.65 +
        professionalScore * 0.07,
      ),
      amateurScore,
      professionalScore,
      detectedSignals,
      selectedExplicitly: false,
    };
  }

  if (
    amateurScore >=
    AMATEUR_THRESHOLD
  ) {
    return {
      profile: null,
      level: "amateur",
      confidence: clamp(
        0.60 +
        amateurScore * 0.08,
      ),
      amateurScore,
      professionalScore,
      detectedSignals,
      selectedExplicitly: false,
    };
  }

  return {
    profile: null,
    level: "novice",
    confidence:
      detectedSignals.length === 0
        ? 0.85
        : 0.65,
    amateurScore,
    professionalScore,
    detectedSignals,
    selectedExplicitly: false,
  };
}

export function detectUserSkillLevel(
  messages: ChatMessage[],
): UserSkillLevel {
  return detectUserSkillProfile(
    messages,
  ).level;
}

export function hasSelectedUserProfile(
  messages: ChatMessage[],
): boolean {
  return (
    detectProfileFromMessages(messages) !==
    null
  );
}

export function isNoviceUser(
  messages: ChatMessage[],
): boolean {
  return (
    detectUserSkillLevel(messages) ===
    "novice"
  );
}

export function isAmateurUser(
  messages: ChatMessage[],
): boolean {
  return (
    detectUserSkillLevel(messages) ===
    "amateur"
  );
}

export function isProfessionalUser(
  messages: ChatMessage[],
): boolean {
  return (
    detectUserSkillLevel(messages) ===
    "professional"
  );
}
