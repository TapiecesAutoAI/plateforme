export interface DiagnosticCoexistenceCandidate {
  hypothesisId: string;

  label: string;

  diagnosticWeight: number;

  diagnosticWeightPercentage: number;

  supportingEvidenceCount: number;
}

export interface DiagnosticCoexistence {
  active: true;

  reason:
    "compatible-coexisting-faults";

  candidates: [
    DiagnosticCoexistenceCandidate,
    DiagnosticCoexistenceCandidate,
  ];

  combinedDiagnosticWeight:
    number;

  verification: {
    actionId: string | null;

    text: string;
  };

  message: string;
}

interface ProbabilityLike {
  probability: number;

  hypothesis: {
    id: string;

    name: string;

    supportingEvidenceIds?:
      readonly string[];

    contradictingEvidenceIds?:
      readonly string[];
  };
}

interface CoexistenceDefinition {
  hypothesisA: string;

  hypothesisB: string;

  actionId: string | null;

  verificationText: string;
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
 * IMPORTANT
 *
 * Ce registre ne contient PAS des causes simplement
 * difficiles à distinguer.
 *
 * Il contient uniquement des couples pouvant être
 * réellement présents simultanément.
 */
const DEFINITIONS:
  CoexistenceDefinition[] = [

  // =========================================================
  // BATTERY
  // =========================================================

  {
    hypothesisA:
      "problem-aged-battery",

    hypothesisB:
      "problem-alternator",

    actionId:
      "battery-charging-load-value",

    verificationText:
      "Tester séparément la capacité de la batterie après recharge puis contrôler la tension de charge sous consommateurs. Une batterie usée et un alternateur faible peuvent être présents simultanément.",
  },

  {
    hypothesisA:
      "problem-aged-battery",

    hypothesisB:
      "problem-parasitic-drain",

    actionId:
      "battery-parasitic-current-value",

    verificationText:
      "Tester la batterie après recharge complète puis mesurer le courant parasite véhicule en veille. Une batterie vieillissante peut coexister avec une consommation parasite.",
  },

  {
    hypothesisA:
      "problem-battery-connections",

    hypothesisB:
      "problem-ground-connection",

    actionId:
      "battery-ground-check",

    verificationText:
      "Contrôler séparément les connexions positives et les liaisons de masse. Plusieurs résistances de contact peuvent être présentes simultanément.",
  },

  // =========================================================
  // BRAKING
  // =========================================================

  {
    hypothesisA:
      "problem-worn-brake-pads",

    hypothesisB:
      "problem-brake-discs",

    actionId:
      "braking-disc-condition",

    verificationText:
      "Mesurer l'épaisseur des plaquettes et contrôler séparément l'état, l'épaisseur et le voile des disques. L'usure des deux éléments peut être simultanée.",
  },

  {
    hypothesisA:
      "problem-sticking-caliper",

    hypothesisB:
      "problem-brake-discs",

    actionId:
      "braking-left-right-temperature",

    verificationText:
      "Comparer la température des roues puis contrôler l'étrier et le disque. Un étrier grippé peut avoir déjà provoqué une surchauffe ou une détérioration du disque.",
  },

  {
    hypothesisA:
      "problem-brake-fluid-leak",

    hypothesisB:
      "problem-air-in-brake-system",

    actionId:
      "braking-visible-leak",

    verificationText:
      "Localiser la fuite puis purger le circuit. Une fuite hydraulique peut avoir introduit de l'air dans le circuit : les deux défauts doivent alors être corrigés.",
  },

  // =========================================================
  // CHARGING
  // =========================================================

  {
    hypothesisA:
      "problem-accessory-belt",

    hypothesisB:
      "problem-alternator-failure",

    actionId:
      "charging-load-test",

    verificationText:
      "Corriger ou confirmer d'abord l'entraînement par courroie puis mesurer la production de l'alternateur sous charge. Une courroie dégradée et un alternateur faible peuvent coexister.",
  },

  {
    hypothesisA:
      "problem-alternator-connections",

    hypothesisB:
      "problem-ground-circuit",

    actionId:
      "charging-voltage-drop-ground-value",

    verificationText:
      "Effectuer les chutes de tension côté positif et côté masse. Plusieurs défauts de connexion peuvent exister simultanément dans le circuit de charge.",
  },

  // =========================================================
  // COOLING
  // =========================================================

  {
    hypothesisA:
      "problem-coolant-leak",

    hypothesisB:
      "problem-air-in-system",

    actionId:
      "cooling-visible-leak",

    verificationText:
      "Rechercher et supprimer la fuite puis purger correctement le circuit. Une fuite peut introduire de l'air : les deux défauts peuvent donc être simultanés.",
  },

  {
    hypothesisA:
      "problem-water-pump",

    hypothesisB:
      "problem-coolant-leak",

    actionId:
      "cooling-water-pump",

    verificationText:
      "Inspecter la pompe à eau, son axe, son bruit et son orifice de fuite. Une pompe défectueuse peut également être la source d'une fuite de liquide.",
  },

  // =========================================================
  // ENGINE
  // =========================================================

  {
    hypothesisA:
      "problem-head-gasket",

    hypothesisB:
      "problem-low-compression",

    actionId:
      "engine-compression",

    verificationText:
      "Mesurer les compressions puis effectuer le contrôle des gaz de combustion dans le liquide. Un joint de culasse peut provoquer simultanément une perte de compression.",
  },

  {
    hypothesisA:
      "problem-air-intake",

    hypothesisB:
      "problem-turbo-system",

    actionId:
      "engine-boost-leak",

    verificationText:
      "Contrôler l'étanchéité de toute l'admission puis la commande et la production du turbo. Une fuite de suralimentation peut coexister avec un turbo dégradé.",
  },

  {
    hypothesisA:
      "problem-ignition-system",

    hypothesisB:
      "problem-injector",

    actionId:
      "engine-misfire-cylinder",

    verificationText:
      "Identifier précisément les cylindres concernés puis contrôler séparément allumage et injection. Un défaut d'allumage sur un cylindre et un injecteur défectueux sur un autre peuvent coexister.",
  },

  // =========================================================
  // STARTING
  // =========================================================

  {
    hypothesisA:
      "problem-weak-battery",

    hypothesisB:
      "problem-battery-connection",

    actionId:
      "starting-check-battery-terminals",

    verificationText:
      "Tester la batterie sous charge puis mesurer les chutes de tension dans les connexions. Une batterie faible et une mauvaise connexion peuvent cumuler leurs effets au démarrage.",
  },

  {
    hypothesisA:
      "problem-weak-battery",

    hypothesisB:
      "problem-starter",

    actionId:
      "starting-booster-test",

    verificationText:
      "Tester avec une alimentation auxiliaire correcte puis contrôler l'intensité et le comportement du démarreur. Une batterie affaiblie peut coexister avec un démarreur consommant trop de courant.",
  },

  // =========================================================
  // STEERING
  // =========================================================

  {
    hypothesisA:
      "problem-power-steering-fluid-low",

    hypothesisB:
      "problem-power-steering-leak",

    actionId:
      "steering-leak",

    verificationText:
      "Contrôler le niveau puis rechercher précisément l'origine de la fuite. Un niveau insuffisant est fréquemment la conséquence directe d'une fuite et les deux constats sont simultanément vrais.",
  },

  {
    hypothesisA:
      "problem-steering-rack",

    hypothesisB:
      "problem-power-steering-leak",

    actionId:
      "steering-leak",

    verificationText:
      "Localiser la fuite sur le circuit et contrôler la crémaillère. Une crémaillère défectueuse peut également présenter une fuite hydraulique.",
  },

  // =========================================================
  // SUSPENSION
  // =========================================================

  {
    hypothesisA:
      "problem-shock-absorber",

    hypothesisB:
      "problem-shock-mount",

    actionId:
      "suspension-shock-mount-check",

    verificationText:
      "Contrôler séparément l'amortisseur et sa coupelle/fixation. Sur un ensemble fortement kilométré, l'amortisseur et sa fixation peuvent être usés simultanément.",
  },

  {
    hypothesisA:
      "problem-stabilizer-link",

    hypothesisB:
      "problem-stabilizer-bushing",

    actionId:
      "suspension-link-check",

    verificationText:
      "Mettre la barre stabilisatrice en contrainte et vérifier séparément les biellettes et les silentblocs. L'usure peut concerner plusieurs articulations simultanément.",
  },

  {
    hypothesisA:
      "problem-wheel-alignment",

    hypothesisB:
      "problem-deformed-tyre",

    actionId:
      "suspension-tyre-wear-pattern",

    verificationText:
      "Contrôler la géométrie puis examiner la déformation et l'usure du pneumatique. Une mauvaise géométrie peut avoir déjà endommagé le pneu.",
  },

  {
    hypothesisA:
      "problem-wheel-alignment",

    hypothesisB:
      "problem-incorrect-tyre-pressure",

    actionId:
      "suspension-tyre-pressure-check",

    verificationText:
      "Corriger les pressions puis contrôler la géométrie. Pressions incorrectes et géométrie hors tolérance peuvent coexister et amplifier le comportement anormal.",
  },

  // =========================================================
  // TRANSMISSION
  // =========================================================

  {
    hypothesisA:
      "problem-clutch-disc",

    hypothesisB:
      "problem-clutch-release-bearing",

    actionId:
      "transmission-clutch-mechanical-check",

    verificationText:
      "Contrôler séparément le disque, la butée et le mécanisme d'embrayage. Sur un embrayage usé, plusieurs composants peuvent être dégradés simultanément.",
  },

  {
    hypothesisA:
      "problem-automatic-fluid",

    hypothesisB:
      "problem-automatic-filter",

    actionId:
      "transmission-automatic-fluid-check",

    verificationText:
      "Contrôler le niveau et l'état de l'huile puis inspecter le filtre. Une huile dégradée et un filtre colmaté peuvent être présents simultanément.",
  },

  {
    hypothesisA:
      "problem-dct-mechatronic",

    hypothesisB:
      "problem-dct-actuator",

    actionId:
      "transmission-dct-mechatronic-check",

    verificationText:
      "Effectuer les tests d'actionneurs et contrôler la mécatronique. Un actionneur défectueux peut coexister avec une mécatronique présentant d'autres défauts.",
  },

  {
    hypothesisA:
      "problem-cvt-belt-chain",

    hypothesisB:
      "problem-cvt-pulley",

    actionId:
      "transmission-cvt-pulley-belt-check",

    verificationText:
      "Inspecter la chaîne ou courroie métallique et les surfaces des poulies. L'usure d'un élément peut entraîner ou accompagner la détérioration de l'autre.",
  },
];

const REGISTRY =
  new Map<
    string,
    CoexistenceDefinition
  >();

for (
  const definition
  of DEFINITIONS
) {

  REGISTRY.set(
    pairKey(
      definition.hypothesisA,
      definition.hypothesisB,
    ),
    definition,
  );
}

function normalizeUnit(
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

function countConfirmed(
  ids:
    readonly string[] |
    undefined,
  confirmed:
    ReadonlySet<string>,
): number {

  if (!ids) {
    return 0;
  }

  return ids.filter(
    id =>
      confirmed.has(
        id,
      ),
  ).length;
}

function hasConfirmedContradiction(
  ids:
    readonly string[] |
    undefined,
  confirmed:
    ReadonlySet<string>,
): boolean {

  if (!ids) {
    return false;
  }

  return ids.some(
    id =>
      confirmed.has(
        id,
      ),
  );
}

export function buildDiagnosticCoexistence(
  status: string,
  probabilities:
    readonly ProbabilityLike[],
  confirmedEvidence:
    ReadonlySet<string> |
    readonly string[],
): DiagnosticCoexistence | null {

  /*
   * On commence volontairement uniquement
   * sur les dossiers non conclus automatiquement.
   *
   * Cela évite de perturber les diagnostics
   * déjà stables.
   */
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

  const firstWeight =
    normalizeUnit(
      first.probability,
    );

  const secondWeight =
    normalizeUnit(
      second.probability,
    );

  /*
   * Cas diffus interdits.
   *
   * Exemple 20 % / 12 % :
   * ce n'est pas une double panne suffisamment
   * soutenue.
   */
  if (
    firstWeight <
      0.35 ||
    secondWeight <
      0.25
  ) {
    return null;
  }

  const combinedWeight =
    firstWeight +
    secondWeight;

  if (
    combinedWeight <
    0.72
  ) {
    return null;
  }

  const lead =
    Math.abs(
      firstWeight -
      secondWeight,
    );

  /*
   * Si une cause écrase complètement l'autre,
   * on ne transforme pas artificiellement le
   * résultat en double panne.
   */
  if (
    lead >
    0.40
  ) {
    return null;
  }

  const confirmed =
    toEvidenceSet(
      confirmedEvidence,
    );

  const firstSupportCount =
    countConfirmed(
      first.hypothesis
        .supportingEvidenceIds,
      confirmed,
    );

  const secondSupportCount =
    countConfirmed(
      second.hypothesis
        .supportingEvidenceIds,
      confirmed,
    );

  /*
   * Chaque panne doit posséder au moins un
   * élément positif propre.
   *
   * Au total nous exigeons au minimum
   * trois éléments concordants.
   */
  if (
    firstSupportCount <
      1 ||
    secondSupportCount <
      1 ||
    (
      firstSupportCount +
      secondSupportCount
    ) <
      3
  ) {
    return null;
  }

  if (
    hasConfirmedContradiction(
      first.hypothesis
        .contradictingEvidenceIds,
      confirmed,
    ) ||
    hasConfirmedContradiction(
      second.hypothesis
        .contradictingEvidenceIds,
      confirmed,
    )
  ) {
    return null;
  }

  return {
    active:
      true,

    reason:
      "compatible-coexisting-faults",

    candidates: [
      {
        hypothesisId:
          first.hypothesis.id,

        label:
          first.hypothesis.name,

        diagnosticWeight:
          firstWeight,

        diagnosticWeightPercentage:
          Math.round(
            firstWeight *
            100,
          ),

        supportingEvidenceCount:
          firstSupportCount,
      },

      {
        hypothesisId:
          second.hypothesis.id,

        label:
          second.hypothesis.name,

        diagnosticWeight:
          secondWeight,

        diagnosticWeightPercentage:
          Math.round(
            secondWeight *
            100,
          ),

        supportingEvidenceCount:
          secondSupportCount,
      },
    ],

    combinedDiagnosticWeight:
      Math.min(
        1,
        combinedWeight,
      ),

    verification: {
      actionId:
        definition.actionId,

      text:
        definition.verificationText,
    },

    message:
      "Les éléments recueillis sont compatibles avec deux défauts pouvant être présents simultanément. Les deux doivent être vérifiés avant de remplacer des pièces.",
  };
}

export function getDiagnosticCoexistencePairCount():
  number {

  return REGISTRY.size;
}