export type AutomotiveTextCorrection = {
  originalText: string;
  correctedText: string;
  changed: boolean;
  requiresConfirmation: boolean;
  corrections: string[];
};

type CorrectionRule = {
  pattern: RegExp;
  replacement: string;
  label: string;
};

/*
 * Correction linguistique uniquement.
 *
 * Cette couche ne produit aucune hypothèse mécanique,
 * aucune preuve diagnostique et aucune pièce.
 *
 * Son rôle est de rendre une phrase utilisateur
 * exploitable avant son passage dans le moteur.
 */
const SAFE_CORRECTION_RULES: CorrectionRule[] = [
  {
    pattern: /\bd[eé]marreplus\b/giu,
    replacement: "démarre plus",
    label: "démarreplus → démarre plus",
  },

  {
    pattern: /\bpohares\b/giu,
    replacement: "phares",
    label: "pohares → phares",
  },

  {
    pattern: /\bformtement\b/giu,
    replacement: "fortement",
    label: "formtement → fortement",
  },

  {
    pattern: /\bbattrie\b/giu,
    replacement: "batterie",
    label: "battrie → batterie",
  },

  {
    pattern: /\bd[eé]mareur\b/giu,
    replacement: "démarreur",
    label: "demareur → démarreur",
  },

  {
    pattern: /\balternteur\b/giu,
    replacement: "alternateur",
    label: "alternteur → alternateur",
  },
];

/*
 * Corrections dépendant légèrement du contexte.
 *
 * Elles restent grammaticales : elles ne transforment
 * jamais un symptôme en diagnostic.
 */
function applyContextualCorrections(
  input: string,
  corrections: string[],
): string {
  let text = input;

  const pluralLightPattern =
    /\b(les\s+(?:phares|voyants|lumi[eè]res))\s+diminue\b/giu;

  if (pluralLightPattern.test(text)) {
    pluralLightPattern.lastIndex = 0;

    text = text.replace(
      pluralLightPattern,
      "$1 diminuent",
    );

    corrections.push(
      "diminue → diminuent",
    );
  }

  return text;
}

function normalizeSpacing(
  input: string,
): string {
  return input
    .replace(/\s+/gu, " ")
    .replace(/\s+([,.!?;:])/gu, "$1")
    .trim();
}

function capitalizeSentence(
  input: string,
): string {
  if (!input) {
    return input;
  }

  return (
    input.charAt(0).toUpperCase() +
    input.slice(1)
  );
}

export function correctAutomotiveText(
  input: string,
): AutomotiveTextCorrection {
  const originalText =
    normalizeSpacing(input);

  let correctedText =
    originalText;

  const corrections: string[] = [];

  for (
    const rule
    of SAFE_CORRECTION_RULES
  ) {
    rule.pattern.lastIndex = 0;

    if (!rule.pattern.test(correctedText)) {
      continue;
    }

    rule.pattern.lastIndex = 0;

    correctedText =
      correctedText.replace(
        rule.pattern,
        rule.replacement,
      );

    corrections.push(
      rule.label,
    );
  }

  correctedText =
    applyContextualCorrections(
      correctedText,
      corrections,
    );

  correctedText =
    normalizeSpacing(
      correctedText,
    );

  const changed =
    correctedText !== originalText;

  /*
   * Une correction unique et purement évidente pourra
   * plus tard être acceptée silencieusement par l'UI.
   *
   * Plusieurs corrections dans la même phrase demandent
   * confirmation avant le diagnostic.
   */
  const requiresConfirmation =
    corrections.length >= 2;

  return {
    originalText,
    correctedText:
      capitalizeSentence(
        correctedText,
      ),
    changed,
    requiresConfirmation,
    corrections,
  };
}