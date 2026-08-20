/*
 * ============================================================
 * NORMALISATION DU LANGAGE AUTOMOBILE
 * ============================================================
 *
 * Ce module transforme une phrase libre en une version
 * standardisée afin de faciliter :
 *
 * - la recherche de mots-clés
 * - la détection d'intentions
 * - le matching avec le Knowledge Graph
 * - le futur moteur IA
 *
 * Exemple :
 *
 * "Ça fait Clac-Clac à l'avant !!!"
 *
 * devient
 *
 * "ca fait clac clac a l avant"
 *
 * ============================================================
 */

const FILLER_WORDS = new Set([
  "euh",
  "heu",
  "ben",
  "bah",
  "hein",
  "quoi",
  "genre",
  "enfait",
  "en",
  "fait",
]);

/*
 * ============================================================
 * ACCENTS
 * ============================================================
 */

export function removeAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/*
 * ============================================================
 * ESPACES
 * ============================================================
 */

export function normalizeSpaces(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * ============================================================
 * PONCTUATION
 * ============================================================
 */

export function normalizePunctuation(
  text: string,
): string {
  return text
    .replace(/[’']/g, " ")
    .replace(/[-_/\\]/g, " ")
    .replace(/[.,;:!?()[\]{}"]/g, " ");
}

/*
 * ============================================================
 * RÉPÉTITIONS
 * ============================================================
 */

export function normalizeRepeatedWords(
  text: string,
): string {
  return text.replace(
    /\b(\w+)(\s+\1)+\b/g,
    "$1",
  );
}

/*
 * ============================================================
 * MOTS DE REMPLISSAGE
 * ============================================================
 */

export function removeFillerWords(
  text: string,
): string {
  return text
    .split(" ")
    .filter(
      (word) =>
        word.length > 0 &&
        !FILLER_WORDS.has(word),
    )
    .join(" ");
}

/*
 * ============================================================
 * CLAC-CLAC / TAC TAC / ETC.
 * ============================================================
 */

const DUPLICATED_SOUND_PATTERNS: Array<{
  pattern: RegExp;
  replacement: string;
}> = [
  {
    pattern: /\bclacclac\b/g,
    replacement: "clac clac",
  },
  {
    pattern: /\btactac\b/g,
    replacement: "tac tac",
  },
  {
    pattern: /\btoctoc\b/g,
    replacement: "toc toc",
  },
  {
    pattern: /\bcliquetis\b/g,
    replacement: "cliquetis",
  },
];

/*
 * ============================================================
 * BRUITS
 * ============================================================
 */

export function normalizeNoiseWords(
  text: string,
): string {
  let normalized = text;

  DUPLICATED_SOUND_PATTERNS.forEach(
    ({ pattern, replacement }) => {
      normalized = normalized.replace(
        pattern,
        replacement,
      );
    },
  );

  return normalized;
}

/*
 * ============================================================
 * TEXTE COMPLET
 * ============================================================
 */

export function normalizeText(
  input: string,
): string {
  let text = input.toLowerCase();

  text = removeAccents(text);

  text = normalizePunctuation(text);

  text = normalizeSpaces(text);

  text = removeFillerWords(text);

  text = normalizeNoiseWords(text);

  text = normalizeRepeatedWords(text);

  text = normalizeSpaces(text);

  return text;
}

/*
 * ============================================================
 * TOKENISATION
 * ============================================================
 */

export function tokenize(
  input: string,
): string[] {
  return normalizeText(input)
    .split(" ")
    .filter(Boolean);
}
