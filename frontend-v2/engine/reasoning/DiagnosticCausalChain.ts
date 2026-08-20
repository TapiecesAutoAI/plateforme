export interface DiagnosticCausalFault {
  hypothesisId: string;

  label: string;

  probability: number;

  probabilityPercentage: number;

  supportingEvidenceCount: number;
}

export interface DiagnosticCausalChain {
  active: true;

  reason:
    "primary-caused-secondary";

  primary:
    DiagnosticCausalFault;

  secondary:
    DiagnosticCausalFault;

  relation: {
    text: string;

    confidence:
      "probable" |
      "strong";
  };

  verification: {
    actionId:
      string | null;

    text:
      string;
  };

  repairOrder:
    string[];

  message:
    string;
}

interface ProbabilityLike {
  probability:
    number;

  hypothesis: {
    id:
      string;

    name:
      string;

    supportingEvidenceIds?:
      readonly string[];

    contradictingEvidenceIds?:
      readonly string[];
  };
}

interface CausalDefinition {
  primaryHypothesisId:
    string;

  secondaryHypothesisId:
    string;

  actionId:
    string | null;

  relationText:
    string;

  verificationText:
    string;

  repairOrder:
    string[];
}

function pairKey(
  hypothesisA: string,
  hypothesisB: string,
): string {

  return [
    hypothesisA,
    hypothesisB,
  ]
    .sort()
    .join("|");
}

/*
 * Relations volontairement explicites.
 *
 * Une coexistence statistique A+B ne suffit
 * jamais pour créer une causalité A->B.
 */
const DEFINITIONS:
  CausalDefinition[] = [

  // =========================================================
  // BATTERY
  // =========================================================

  {
    primaryHypothesisId:
      "problem-parasitic-drain",

    secondaryHypothesisId:
      "problem-discharged-battery",

    actionId:
      "battery-parasitic-current-value",

    relationText:
      "Une consommation électrique parasite peut décharger progressivement une batterie pourtant initialement fonctionnelle.",

    verificationText:
      "Mesurer le courant parasite véhicule en veille puis vérifier l'état de charge de la batterie.",

    repairOrder: [
      "Identifier et supprimer la consommation parasite.",
      "Recharger complètement la batterie.",
      "Retester ensuite la batterie afin de vérifier qu'elle n'a pas été endommagée par les décharges répétées.",
    ],
  },

  // =========================================================
  // BRAKING
  // =========================================================

  {
    primaryHypothesisId:
      "problem-brake-fluid-leak",

    secondaryHypothesisId:
      "problem-air-in-brake-system",

    actionId:
      "braking-visible-leak",

    relationText:
      "Une fuite hydraulique peut permettre l'entrée d'air dans le circuit de freinage.",

    verificationText:
      "Localiser la fuite, réparer le circuit puis effectuer une purge complète et contrôler la fermeté de la pédale.",

    repairOrder: [
      "Réparer d'abord la fuite hydraulique.",
      "Purger ensuite complètement le circuit.",
      "Contrôler enfin la pression et le comportement de la pédale.",
    ],
  },

  {
    primaryHypothesisId:
      "problem-sticking-caliper",

    secondaryHypothesisId:
      "problem-brake-discs",

    actionId:
      "braking-left-right-temperature",

    relationText:
      "Un étrier grippé peut maintenir les plaquettes en contact et provoquer une surchauffe puis une détérioration du disque.",

    verificationText:
      "Comparer les températures gauche/droite puis contrôler le coulissement de l'étrier et l'état du disque.",

    repairOrder: [
      "Corriger d'abord le grippage de l'étrier.",
      "Contrôler ensuite l'épaisseur, le voile et les traces de surchauffe du disque.",
      "Remplacer le disque et les plaquettes si les tolérances ne sont plus respectées.",
    ],
  },

  // =========================================================
  // CHARGING
  // =========================================================

  {
    primaryHypothesisId:
      "problem-accessory-belt",

    secondaryHypothesisId:
      "problem-alternator-failure",

    actionId:
      "charging-load-test",

    relationText:
      "Une courroie qui patine ou entraîne mal l'alternateur peut provoquer une charge insuffisante et donner l'apparence d'un alternateur défaillant.",

    verificationText:
      "Corriger ou confirmer d'abord l'entraînement mécanique puis refaire le test de charge de l'alternateur.",

    repairOrder: [
      "Contrôler et corriger la courroie, le tendeur et l'entraînement.",
      "Refaire ensuite les mesures de charge.",
      "Ne condamner l'alternateur que si sa production reste insuffisante avec un entraînement correct.",
    ],
  },

  // =========================================================
  // COOLING
  // =========================================================

  {
    primaryHypothesisId:
      "problem-coolant-leak",

    secondaryHypothesisId:
      "problem-air-in-system",

    actionId:
      "cooling-visible-leak",

    relationText:
      "Une fuite de liquide peut faire baisser le niveau et permettre l'introduction d'air dans le circuit.",

    verificationText:
      "Réparer la fuite, remettre le niveau correct puis purger complètement le circuit de refroidissement.",

    repairOrder: [
      "Localiser et réparer la fuite.",
      "Rétablir le niveau de liquide.",
      "Purger ensuite l'air du circuit.",
      "Recontrôler la température moteur et le chauffage habitacle.",
    ],
  },

  {
    primaryHypothesisId:
      "problem-water-pump",

    secondaryHypothesisId:
      "problem-coolant-leak",

    actionId:
      "cooling-water-pump",

    relationText:
      "Une pompe à eau défectueuse peut fuir par son joint, son axe ou son orifice de drainage.",

    verificationText:
      "Contrôler la pompe, son axe, son bruit, son jeu et les traces de liquide autour de la pompe.",

    repairOrder: [
      "Confirmer la défaillance de la pompe.",
      "Remplacer ou réparer la pompe à eau.",
      "Remettre le circuit sous pression et vérifier l'absence de fuite.",
      "Purger ensuite correctement le circuit.",
    ],
  },

  // =========================================================
  // ENGINE
  // =========================================================

  {
    primaryHypothesisId:
      "problem-head-gasket",

    secondaryHypothesisId:
      "problem-low-compression",

    actionId:
      "engine-compression",

    relationText:
      "Un joint de culasse défectueux peut provoquer une perte d'étanchéité d'un ou plusieurs cylindres et donc une compression insuffisante.",

    verificationText:
      "Mesurer les compressions puis confirmer la fuite interne par un test de gaz de combustion ou un test d'étanchéité des cylindres.",

    repairOrder: [
      "Confirmer d'abord l'origine de la perte de compression.",
      "Réparer le joint de culasse ou la fuite interne.",
      "Contrôler ensuite les compressions après réparation.",
    ],
  },

  {
    primaryHypothesisId:
      "problem-air-intake",

    secondaryHypothesisId:
      "problem-turbo-system",

    actionId:
      "engine-boost-leak",

    relationText:
      "Une fuite d'admission ou de suralimentation peut réduire la pression mesurée et faire croire à une défaillance du turbo.",

    verificationText:
      "Tester l'étanchéité de l'admission et de la suralimentation avant de condamner le turbocompresseur.",

    repairOrder: [
      "Supprimer d'abord toute fuite d'admission ou de suralimentation.",
      "Effacer les défauts si nécessaire puis refaire un essai.",
      "Contrôler le turbo uniquement si la pression reste insuffisante.",
    ],
  },

  // =========================================================
  // STEERING
  // =========================================================

  {
    primaryHypothesisId:
      "problem-power-steering-leak",

    secondaryHypothesisId:
      "problem-power-steering-fluid-low",

    actionId:
      "steering-leak",

    relationText:
      "Une fuite du circuit hydraulique entraîne directement une baisse progressive du niveau de liquide de direction assistée.",

    verificationText:
      "Localiser la fuite puis contrôler le niveau et l'état du liquide après réparation.",

    repairOrder: [
      "Réparer la fuite hydraulique.",
      "Rétablir ensuite le niveau correct.",
      "Purger le circuit si nécessaire.",
      "Contrôler le fonctionnement de la pompe après remise en état.",
    ],
  },

  // =========================================================
  // SUSPENSION
  // =========================================================

  {
    primaryHypothesisId:
      "problem-wheel-alignment",

    secondaryHypothesisId:
      "problem-deformed-tyre",

    actionId:
      "suspension-tyre-wear-pattern",

    relationText:
      "Une géométrie incorrecte peut provoquer une usure irrégulière du pneumatique et finir par le rendre inutilisable ou déformé.",

    verificationText:
      "Examiner l'usure du pneu puis mesurer la géométrie des trains roulants.",

    repairOrder: [
      "Identifier et corriger d'abord la cause de la géométrie incorrecte.",
      "Régler ensuite la géométrie.",
      "Remplacer le pneumatique s'il est déjà déformé ou hors tolérance.",
    ],
  },

  {
    primaryHypothesisId:
      "problem-incorrect-tyre-pressure",

    secondaryHypothesisId:
      "problem-deformed-tyre",

    actionId:
      "suspension-tyre-pressure-check",

    relationText:
      "Une pression incorrecte maintenue longtemps peut entraîner une usure irrégulière ou une déformation du pneumatique.",

    verificationText:
      "Mesurer les pressions à froid puis contrôler visuellement le profil et le faux-rond du pneumatique.",

    repairOrder: [
      "Corriger les pressions.",
      "Inspecter le pneu pour rechercher une déformation ou une usure anormale.",
      "Remplacer le pneumatique s'il a subi une détérioration irréversible.",
    ],
  },

  // =========================================================
  // TRANSMISSION
  // =========================================================

  {
    primaryHypothesisId:
      "problem-transmission-fluid-leak",

    secondaryHypothesisId:
      "problem-automatic-fluid",

    actionId:
      "transmission-fluid-leak-check",

    relationText:
      "Une fuite de transmission peut provoquer un niveau insuffisant d'huile de boîte automatique.",

    verificationText:
      "Localiser la fuite puis contrôler précisément le niveau et l'état de l'huile de transmission.",

    repairOrder: [
      "Réparer d'abord la fuite.",
      "Rétablir ensuite le niveau d'huile selon la procédure constructeur.",
      "Contrôler le fonctionnement de la transmission après remise à niveau.",
    ],
  },

  {
    primaryHypothesisId:
      "problem-transmission-fluid-leak",

    secondaryHypothesisId:
      "problem-manual-transmission-fluid",

    actionId:
      "transmission-fluid-leak-check",

    relationText:
      "Une fuite de transmission peut provoquer un niveau insuffisant d'huile dans une boîte manuelle.",

    verificationText:
      "Localiser la fuite puis contrôler le niveau et l'état de l'huile de boîte manuelle.",

    repairOrder: [
      "Réparer la fuite.",
      "Rétablir le niveau d'huile correct.",
      "Contrôler ensuite les bruits et la qualité de passage des rapports.",
    ],
  },

  {
    primaryHypothesisId:
      "problem-transmission-fluid-leak",

    secondaryHypothesisId:
      "problem-cvt-fluid",

    actionId:
      "transmission-fluid-leak-check",

    relationText:
      "Une fuite sur une transmission CVT peut provoquer un niveau d'huile insuffisant et perturber son fonctionnement hydraulique.",

    verificationText:
      "Localiser la fuite puis contrôler le niveau et le type exact de fluide CVT.",

    repairOrder: [
      "Réparer d'abord la fuite.",
      "Rétablir le niveau avec le fluide CVT approprié.",
      "Effectuer ensuite les contrôles de pression et de fonctionnement.",
    ],
  },
];

const REGISTRY =
  new Map<
    string,
    CausalDefinition
  >();

for (
  const definition
  of DEFINITIONS
) {

  REGISTRY.set(
    pairKey(
      definition.primaryHypothesisId,
      definition.secondaryHypothesisId,
    ),
    definition,
  );
}

function clampProbability(
  value: number,
): number {

  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function toEvidenceSet(
  confirmedEvidence:
    ReadonlySet<string> |
    readonly string[],
): ReadonlySet<string> {

  if (
    confirmedEvidence instanceof
    Set
  ) {
    return confirmedEvidence;
  }

  return new Set(
    confirmedEvidence,
  );
}

function countConfirmedSupport(
  hypothesis:
    ProbabilityLike["hypothesis"],
  confirmed:
    ReadonlySet<string>,
): number {

  return (
    hypothesis.supportingEvidenceIds ??
    []
  ).filter(
    evidenceId =>
      confirmed.has(
        evidenceId,
      ),
  ).length;
}

function hasConfirmedContradiction(
  hypothesis:
    ProbabilityLike["hypothesis"],
  confirmed:
    ReadonlySet<string>,
): boolean {

  return (
    hypothesis.contradictingEvidenceIds ??
    []
  ).some(
    evidenceId =>
      confirmed.has(
        evidenceId,
      ),
  );
}

export function buildDiagnosticCausalChain(
  status: string,
  probabilities:
    readonly ProbabilityLike[],
  confirmedEvidence:
    ReadonlySet<string> |
    readonly string[],
): DiagnosticCausalChain | null {

  if (
    status !==
    "manual-review-required"
  ) {
    return null;
  }

  const first =
    probabilities[0] ??
    null;

  const second =
    probabilities[1] ??
    null;

  if (
    !first ||
    !second
  ) {
    return null;
  }

  const definition =
    REGISTRY.get(
      pairKey(
        first.hypothesis.id,
        second.hypothesis.id,
      ),
    ) ??
    null;

  if (!definition) {
    return null;
  }

  /*
   * Remet les candidats dans l'ordre causal
   * défini par le registre.
   */
  const primary =
    first.hypothesis.id ===
    definition.primaryHypothesisId
      ? first
      : second;

  const secondary =
    first.hypothesis.id ===
    definition.secondaryHypothesisId
      ? first
      : second;

  if (
    primary.hypothesis.id !==
      definition.primaryHypothesisId ||
    secondary.hypothesis.id !==
      definition.secondaryHypothesisId
  ) {
    return null;
  }

  const primaryProbability =
    clampProbability(
      primary.probability,
    );

  const secondaryProbability =
    clampProbability(
      secondary.probability,
    );

  /*
   * Une vraie chaîne causale exige que les deux
   * éléments soient suffisamment crédibles.
   */
  if (
    primaryProbability <
      0.30 ||
    secondaryProbability <
      0.22
  ) {
    return null;
  }

  if (
    (
      primaryProbability +
      secondaryProbability
    ) <
    0.70
  ) {
    return null;
  }

  const confirmed =
    toEvidenceSet(
      confirmedEvidence,
    );

  const primarySupport =
    countConfirmedSupport(
      primary.hypothesis,
      confirmed,
    );

  const secondarySupport =
    countConfirmedSupport(
      secondary.hypothesis,
      confirmed,
    );

  /*
   * Au moins une preuve confirmée de chaque côté,
   * et trois preuves au total.
   */
  if (
    primarySupport <
      1 ||
    secondarySupport <
      1 ||
    (
      primarySupport +
      secondarySupport
    ) <
      3
  ) {
    return null;
  }

  if (
    hasConfirmedContradiction(
      primary.hypothesis,
      confirmed,
    ) ||
    hasConfirmedContradiction(
      secondary.hypothesis,
      confirmed,
    )
  ) {
    return null;
  }

  const relationConfidence:
    "probable" |
    "strong" =
      (
        primarySupport >= 2 &&
        secondarySupport >= 2 &&
        (
          primaryProbability +
          secondaryProbability
        ) >= 0.85
      )
        ? "strong"
        : "probable";

  return {
    active:
      true,

    reason:
      "primary-caused-secondary",

    primary: {
      hypothesisId:
        primary.hypothesis.id,

      label:
        primary.hypothesis.name,

      probability:
        primaryProbability,

      probabilityPercentage:
        Math.round(
          primaryProbability *
          100,
        ),

      supportingEvidenceCount:
        primarySupport,
    },

    secondary: {
      hypothesisId:
        secondary.hypothesis.id,

      label:
        secondary.hypothesis.name,

      probability:
        secondaryProbability,

      probabilityPercentage:
        Math.round(
          secondaryProbability *
          100,
        ),

      supportingEvidenceCount:
        secondarySupport,
    },

    relation: {
      text:
        definition.relationText,

      confidence:
        relationConfidence,
    },

    verification: {
      actionId:
        definition.actionId,

      text:
        definition.verificationText,
    },

    repairOrder:
      definition.repairOrder,

    message:
      "Les éléments disponibles suggèrent qu'un défaut primaire peut avoir provoqué un défaut secondaire. La cause primaire doit être traitée en premier afin d'éviter une réparation incomplète.",
  };
}

export function getDiagnosticCausalChainCount():
  number {

  return REGISTRY.size;
}