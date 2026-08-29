import {
  describe,
  expect,
  it,
} from "vitest";

import {
  correctAutomotiveText,
} from "../lib/ai/AutomotiveTextCorrector";

describe(
  "AutomotiveTextCorrector",
  () => {
    it(
      "corrige la phrase réelle de l'utilisateur",
      () => {
        const result =
          correctAutomotiveText(
            "ma voiture ne démarreplus et les pohares diminue formtement",
          );

        console.log(
          "ORIGINAL :",
          result.originalText,
        );

        console.log(
          "CORRIGE :",
          result.correctedText,
        );

        console.log(
          "CORRECTIONS :",
          result.corrections,
        );

        console.log(
          "CONFIRMATION :",
          result.requiresConfirmation,
        );

        expect(
          result.correctedText,
        ).toBe(
          "Ma voiture ne démarre plus et les phares diminuent fortement",
        );

        expect(
          result.changed,
        ).toBe(true);

        expect(
          result.requiresConfirmation,
        ).toBe(true);
      },
    );

    it(
      "ne modifie pas une phrase correcte",
      () => {
        const result =
          correctAutomotiveText(
            "Ma voiture ne démarre plus et les phares diminuent fortement",
          );

        expect(
          result.correctedText,
        ).toBe(
          "Ma voiture ne démarre plus et les phares diminuent fortement",
        );

        expect(
          result.changed,
        ).toBe(false);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "corrige une faute automobile simple",
      () => {
        const result =
          correctAutomotiveText(
            "je pense au demareur",
          );

        expect(
          result.correctedText,
        ).toBe(
          "Je pense au démarreur",
        );

        expect(
          result.changed,
        ).toBe(true);

        expect(
          result.requiresConfirmation,
        ).toBe(false);
      },
    );

    it(
      "ne transforme pas un terme mécanique valide",
      () => {
        const result =
          correctAutomotiveText(
            "bruit de courroie au démarrage",
          );

        expect(
          result.correctedText,
        ).toBe(
          "Bruit de courroie au démarrage",
        );

        expect(
          result.corrections,
        ).toEqual([]);
      },
    );
  },
);