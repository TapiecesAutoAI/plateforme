import {
  describe,
  expect,
  it,
} from "vitest";

import {
  detectUserSkillProfile,
} from "../lib/ai/userProfile";

import type {
  ChatMessage,
} from "../lib/ai/types";

function messagesForProfile(
  profile:
    | "particulier"
    | "bricoleur"
    | "mecanicien-garage",
): ChatMessage[] {
  return [
    {
      role: "user",
      content: profile,
    },
    {
      role: "user",
      content:
        "ma voiture ne démarre pas",
    },
  ];
}

function maximumQuestionsForLevel(
  level:
    | "novice"
    | "amateur"
    | "professional",
): number {
  if (
    level ===
    "professional"
  ) {
    return 10;
  }

  if (
    level ===
    "amateur"
  ) {
    return 7;
  }

  return 5;
}

describe(
  "Diagnostic depth by user profile",
  () => {
    it(
      "Particulier -> novice -> maximum 5 questions",
      () => {
        const profile =
          detectUserSkillProfile(
            messagesForProfile(
              "particulier",
            ),
          );

        expect(
          profile.profile,
        ).toBe(
          "particulier",
        );

        expect(
          profile.level,
        ).toBe(
          "novice",
        );

        expect(
          maximumQuestionsForLevel(
            profile.level,
          ),
        ).toBe(5);
      },
    );

    it(
      "Bricoleur -> amateur -> maximum 7 questions",
      () => {
        const profile =
          detectUserSkillProfile(
            messagesForProfile(
              "bricoleur",
            ),
          );

        expect(
          profile.profile,
        ).toBe(
          "bricoleur",
        );

        expect(
          profile.level,
        ).toBe(
          "amateur",
        );

        expect(
          maximumQuestionsForLevel(
            profile.level,
          ),
        ).toBe(7);
      },
    );

    it(
      "Mecanicien -> professional -> maximum 10 questions",
      () => {
        const profile =
          detectUserSkillProfile(
            messagesForProfile(
              "mecanicien-garage",
            ),
          );

        expect(
          profile.profile,
        ).toBe(
          "mecanicien-garage",
        );

        expect(
          profile.level,
        ).toBe(
          "professional",
        );

        expect(
          maximumQuestionsForLevel(
            profile.level,
          ),
        ).toBe(10);
      },
    );
  },
);
