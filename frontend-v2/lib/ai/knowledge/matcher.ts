import {
  normalizeText,
} from "../conversation";

import {
  automotiveKnowledgeGraph,
} from "./data";

import type {
  KnowledgeEntity,
} from "./types";

const SEARCHABLE_ENTITY_TYPES =
  new Set<KnowledgeEntity["type"]>([
    "symptom",
    "observation",
    "vehicle",
    "engine",
  ]);

const OPTIONAL_MATCH_WORDS =
  new Set([
    "je",
    "j",
    "tu",
    "il",
    "elle",
    "on",
    "nous",
    "vous",
    "ils",
    "elles",

    "ma",
    "mon",
    "mes",
    "ta",
    "ton",
    "tes",
    "sa",
    "son",
    "ses",

    "la",
    "le",
    "les",
    "l",
    "un",
    "une",
    "des",
    "du",
    "de",
    "d",

    "ce",
    "cet",
    "cette",
    "ces",

    "voiture",
    "vehicule",
    "auto",

    "ne",
    "n",
    "pas",

    "quand",
    "lorsque",
    "pendant",
    "encore",
    "toujours",
    "environ",
  ]);

type EntityMatch = {
  entity: KnowledgeEntity;
  matchedTerm: string;
  matchScore: number;
};

type TextRewriteRule = {
  pattern: RegExp;
  replacement: string;
};

/*
 * Reformulations naturelles fréquentes.
 *
 * Ces règles transforment uniquement des formulations
 * courantes en expressions déjà présentes dans le graphe.
 */
const TEXT_REWRITE_RULES:
  TextRewriteRule[] = [
    /*
     * ========================================================
     * DÉMARRAGE
     * ========================================================
     */

    {
      pattern:
        /\b(?:ma |la |cette )?(?:voiture|auto|vehicule) ne tourne plus\b/g,
      replacement:
        "le moteur ne tourne pas",
    },

    {
      pattern:
        /\b(?:elle|il) ne tourne plus\b/g,
      replacement:
        "le moteur ne tourne pas",
    },

    {
      pattern:
        /\ble moteur ne tourne plus\b/g,
      replacement:
        "le moteur ne tourne pas",
    },

    {
      pattern:
        /\brien ne tourne\b/g,
      replacement:
        "le moteur ne tourne pas",
    },

    {
      pattern:
        /\b(?:elle|il) ne lance plus\b/g,
      replacement:
        "le moteur ne tourne pas",
    },

    {
      pattern:
        /\b(?:ma |la |cette )?(?:voiture|auto|vehicule) ne lance plus\b/g,
      replacement:
        "le moteur ne tourne pas",
    },

    {
      pattern:
        /\bca ne lance plus\b/g,
      replacement:
        "le moteur ne tourne pas",
    },

    {
      pattern:
        /\bca tourne doucement\b/g,
      replacement:
        "le moteur tourne lentement",
    },

    {
      pattern:
        /\bca tourne tres lentement\b/g,
      replacement:
        "le moteur tourne lentement",
    },

    {
      pattern:
        /\belle tourne lentement\b/g,
      replacement:
        "le moteur tourne lentement",
    },

    {
      pattern:
        /\belle mouline mais ne part pas\b/g,
      replacement:
        "le moteur tourne mais ne demarre pas",
    },

    {
      pattern:
        /\bca mouline mais ca ne part pas\b/g,
      replacement:
        "le moteur tourne mais ne demarre pas",
    },

    {
      pattern:
        /\belle lance mais ne part pas\b/g,
      replacement:
        "le moteur tourne mais ne demarre pas",
    },

    /*
     * ========================================================
     * ALTERNATEUR ET CIRCUIT DE CHARGE
     * ========================================================
     */

    {
      pattern:
        /\bvoyant rouge de batterie\b/g,
      replacement:
        "voyant batterie",
    },

    {
      pattern:
        /\btemoin rouge de batterie\b/g,
      replacement:
        "temoin batterie rouge",
    },

    {
      pattern:
        /\bvoyant batterie reste allume quand le moteur tourne\b/g,
      replacement:
        "voyant batterie reste allume",
    },

    {
      pattern:
        /\bvoyant batterie reste allume lorsque le moteur tourne\b/g,
      replacement:
        "voyant batterie reste allume",
    },

    {
      pattern:
        /\bvoyant batterie allume moteur tournant\b/g,
      replacement:
        "voyant batterie reste allume",
    },

    {
      pattern:
        /\bbatterie neuve mais elle se vide encore en roulant\b/g,
      replacement:
        "batterie remplacee mais probleme revient batterie se vide en roulant",
    },

    {
      pattern:
        /\bbatterie neuve mais elle se vide en roulant\b/g,
      replacement:
        "batterie remplacee mais probleme revient batterie se vide en roulant",
    },

    {
      pattern:
        /\bbatterie neuve se vide en roulant\b/g,
      replacement:
        "nouvelle batterie se vide batterie se vide en roulant",
    },

    {
      pattern:
        /\bbatterie neuve\b/g,
      replacement:
        "nouvelle batterie",
    },

    {
      pattern:
        /\belle se vide en roulant\b/g,
      replacement:
        "batterie se vide en roulant",
    },

    {
      pattern:
        /\belle se decharge en roulant\b/g,
      replacement:
        "batterie se decharge en roulant",
    },

    {
      pattern:
        /\bles phares deviennent plus forts quand j accelere\b/g,
      replacement:
        "phares plus forts en accelerant",
    },

    {
      pattern:
        /\bles phares deviennent plus forts lorsque j accelere\b/g,
      replacement:
        "phares plus forts en accelerant",
    },

    {
      pattern:
        /\bphares deviennent plus forts en accelerant\b/g,
      replacement:
        "phares plus forts en accelerant",
    },

    {
      pattern:
        /\bles phares augmentent quand j accelere\b/g,
      replacement:
        "phares plus forts en accelerant",
    },

    {
      pattern:
        /\bles lumieres deviennent plus fortes quand j accelere\b/g,
      replacement:
        "phares plus forts en accelerant",
    },

    {
      pattern:
        /\bles phares faiblissent au ralenti\b/g,
      replacement:
        "charge faible au ralenti",
    },

    {
      pattern:
        /\ble voyant batterie disparait en accelerant\b/g,
      replacement:
        "voyant batterie s eteint en accelerant",
    },
  ];

function rewriteNaturalText(
  value: string,
): string {
  let rewritten =
    normalizeText(value);

  for (
    const rule
    of TEXT_REWRITE_RULES
  ) {
    rewritten =
      rewritten.replace(
        rule.pattern,
        rule.replacement,
      );
  }

  return rewritten
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function getEntitySearchTerms(
  entity: KnowledgeEntity,
): string[] {
  const normalizedTerms = [
    entity.name,
    ...(entity.aliases ?? []),
  ]
    .map(rewriteNaturalText)
    .filter(
      (term) =>
        term.length > 0,
    );

  return [
    ...new Set(
      normalizedTerms,
    ),
  ].sort(
    (
      first,
      second,
    ) =>
      second.length -
      first.length,
  );
}

function tokenize(
  value: string,
): string[] {
  return value
    .split(/\s+/)
    .map(
      (token) =>
        token.trim(),
    )
    .filter(Boolean);
}

function simplifyTokens(
  value: string,
): string[] {
  return tokenize(value)
    .filter(
      (token) =>
        !OPTIONAL_MATCH_WORDS.has(
          token,
        ),
    );
}

/**
 * Recherche une expression complète.
 */
function containsCompleteTerm(
  normalizedText: string,
  normalizedTerm: string,
): boolean {
  if (
    !normalizedText ||
    !normalizedTerm
  ) {
    return false;
  }

  const paddedText =
    ` ${normalizedText} `;

  const paddedTerm =
    ` ${normalizedTerm} `;

  return paddedText.includes(
    paddedTerm,
  );
}

/**
 * Recherche une suite strictement contiguë de mots.
 */
function containsTokenSequence(
  textTokens: string[],
  termTokens: string[],
): boolean {
  if (
    termTokens.length === 0 ||
    textTokens.length <
      termTokens.length
  ) {
    return false;
  }

  for (
    let startIndex = 0;
    startIndex <=
      textTokens.length -
        termTokens.length;
    startIndex += 1
  ) {
    let isMatch = true;

    for (
      let termIndex = 0;
      termIndex <
        termTokens.length;
      termIndex += 1
    ) {
      if (
        textTokens[
          startIndex +
            termIndex
        ] !==
        termTokens[
          termIndex
        ]
      ) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return true;
    }
  }

  return false;
}

/**
 * Accepte quelques mots intermédiaires dans une phrase
 * naturelle, mais conserve l’ordre des mots importants.
 *
 * Exemple :
 * "voyant rouge de batterie reste allumé"
 * correspond à :
 * "voyant batterie reste allumé".
 */
function containsOrderedTokens(
  textTokens: string[],
  termTokens: string[],
): boolean {
  if (
    termTokens.length < 3 ||
    textTokens.length <
      termTokens.length
  ) {
    return false;
  }

  let textIndex = 0;
  let previousMatchIndex = -1;

  for (
    const termToken
    of termTokens
  ) {
    let foundIndex = -1;

    for (
      let index = textIndex;
      index < textTokens.length;
      index += 1
    ) {
      if (
        textTokens[index] ===
        termToken
      ) {
        foundIndex =
          index;

        break;
      }
    }

    if (
      foundIndex === -1
    ) {
      return false;
    }

    if (
      previousMatchIndex >= 0 &&
      foundIndex -
        previousMatchIndex >
        5
    ) {
      return false;
    }

    previousMatchIndex =
      foundIndex;

    textIndex =
      foundIndex + 1;
  }

  return true;
}

/**
 * Accepte une formulation contenant tous les mots
 * significatifs, même lorsque leur ordre naturel varie
 * légèrement.
 *
 * Cette méthode est limitée aux expressions comportant
 * au moins quatre mots significatifs afin d’éviter les
 * correspondances trop générales.
 */
function containsSignificantTokens(
  textTokens: string[],
  termTokens: string[],
): boolean {
  if (
    termTokens.length < 4
  ) {
    return false;
  }

  const textTokenSet =
    new Set(textTokens);

  const matchedTokenCount =
    termTokens.filter(
      (token) =>
        textTokenSet.has(token),
    ).length;

  const requiredMatches =
    Math.max(
      4,
      Math.ceil(
        termTokens.length *
          0.8,
      ),
    );

  return (
    matchedTokenCount >=
    requiredMatches
  );
}

function getFlexibleMatchScore(
  normalizedText: string,
  normalizedTerm: string,
): number {
  if (
    containsCompleteTerm(
      normalizedText,
      normalizedTerm,
    )
  ) {
    return 1000 +
      normalizedTerm.length;
  }

  const simplifiedTextTokens =
    simplifyTokens(
      normalizedText,
    );

  const simplifiedTermTokens =
    simplifyTokens(
      normalizedTerm,
    );

  if (
    simplifiedTermTokens.length ===
    0
  ) {
    return 0;
  }

  if (
    containsTokenSequence(
      simplifiedTextTokens,
      simplifiedTermTokens,
    )
  ) {
    return 800 +
      simplifiedTermTokens.length *
        10;
  }

  if (
    containsOrderedTokens(
      simplifiedTextTokens,
      simplifiedTermTokens,
    )
  ) {
    return 600 +
      simplifiedTermTokens.length *
        10;
  }

  if (
    containsSignificantTokens(
      simplifiedTextTokens,
      simplifiedTermTokens,
    )
  ) {
    return 400 +
      simplifiedTermTokens.length *
        10;
  }

  return 0;
}

function containsFlexibleTerm(
  normalizedText: string,
  normalizedTerm: string,
): boolean {
  return (
    getFlexibleMatchScore(
      normalizedText,
      normalizedTerm,
    ) > 0
  );
}

function findBestMatchingTerm(
  normalizedText: string,
  entity: KnowledgeEntity,
): {
  term: string;
  score: number;
} | null {
  const searchTerms =
    getEntitySearchTerms(
      entity,
    );

  let bestTerm:
    string | null = null;

  let bestScore = 0;

  for (
    const term
    of searchTerms
  ) {
    const score =
      getFlexibleMatchScore(
        normalizedText,
        term,
      );

    if (
      score <=
      bestScore
    ) {
      continue;
    }

    bestTerm =
      term;

    bestScore =
      score;
  }

  if (
    !bestTerm
  ) {
    return null;
  }

  return {
    term: bestTerm,
    score: bestScore,
  };
}

/**
 * Supprime une correspondance générale lorsqu’une entité
 * plus précise du même type couvre la même expression.
 */
function removeDominatedMatches(
  matches: EntityMatch[],
): EntityMatch[] {
  return matches.filter(
    (currentMatch) =>
      !matches.some(
        (otherMatch) => {
          if (
            otherMatch.entity.id ===
              currentMatch.entity.id ||
            otherMatch.entity.type !==
              currentMatch.entity.type
          ) {
            return false;
          }

          if (
            otherMatch.matchScore <
              currentMatch.matchScore
          ) {
            return false;
          }

          if (
            otherMatch.matchedTerm.length <=
            currentMatch.matchedTerm.length
          ) {
            return false;
          }

          return containsFlexibleTerm(
            otherMatch.matchedTerm,
            currentMatch.matchedTerm,
          );
        },
      ),
  );
}

export function findEntitiesInText(
  text: string,
): KnowledgeEntity[] {
  const normalizedText =
    rewriteNaturalText(
      text,
    );

  if (
    !normalizedText
  ) {
    return [];
  }

  const matches:
    EntityMatch[] = [];

  for (
    const entity
    of automotiveKnowledgeGraph.entities
  ) {
    if (
      !SEARCHABLE_ENTITY_TYPES.has(
        entity.type,
      )
    ) {
      continue;
    }

    const match =
      findBestMatchingTerm(
        normalizedText,
        entity,
      );

    if (
      !match
    ) {
      continue;
    }

    matches.push({
      entity,
      matchedTerm:
        match.term,
      matchScore:
        match.score,
    });
  }

  return removeDominatedMatches(
    matches,
  )
    .sort(
      (
        first,
        second,
      ) => {
        if (
          second.matchScore !==
          first.matchScore
        ) {
          return (
            second.matchScore -
            first.matchScore
          );
        }

        return (
          second.matchedTerm.length -
          first.matchedTerm.length
        );
      },
    )
    .map(
      (match) =>
        match.entity,
    );
}