export interface DiagnosticDiscriminatingCheck {
  domain: string;

  actionId: string;

  text: string;
}

type Entry = {
  domain: string;

  hypothesisA: string;

  hypothesisB: string;

  actionId: string;

  text: string;
};

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

const ENTRIES:
  Entry[] = [

  // =========================================================
  // BATTERY
  // =========================================================

  {
    domain:
      "battery",

    hypothesisA:
      "problem-accessory-belt",

    hypothesisB:
      "problem-alternator",

    actionId:
      "battery-charging-load-value",

    text:
      "Contrôler d'abord l'état et la tension de la courroie, puis mesurer la tension de charge avec plusieurs consommateurs électriques activés. Une courroie correcte avec une charge insuffisante oriente davantage vers l'alternateur.",
  },

  {
    domain:
      "battery",

    hypothesisA:
      "problem-alternator",

    hypothesisB:
      "problem-voltage-regulator",

    actionId:
      "battery-charging-voltage-value",

    text:
      "Mesurer précisément la tension moteur tournant. Une tension durablement insuffisante oriente vers l'alternateur ; une tension excessive ou anormalement instable oriente davantage vers le régulateur.",
  },

  {
    domain:
      "battery",

    hypothesisA:
      "problem-aged-battery",

    hypothesisB:
      "problem-discharged-battery",

    actionId:
      "battery-post-charge-voltage-value",

    text:
      "Recharger complètement la batterie, la laisser reposer puis mesurer sa tension. Une chute rapide après recharge oriente vers une batterie vieillissante plutôt que vers une simple décharge.",
  },

  {
    domain:
      "battery",

    hypothesisA:
      "problem-battery-connections",

    hypothesisB:
      "problem-ground-connection",

    actionId:
      "battery-ground-check",

    text:
      "Contrôler séparément les bornes et câbles de batterie puis la liaison de masse batterie-moteur. Une anomalie localisée côté masse permet de distinguer la liaison de masse des connexions de batterie.",
  },

  {
    domain:
      "battery",

    hypothesisA:
      "problem-discharged-battery",

    hypothesisB:
      "problem-internal-battery-failure",

    actionId:
      "battery-test-result",

    text:
      "Effectuer un test de batterie. Une batterie simplement déchargée peut retrouver une capacité correcte après recharge ; un test révélant une défaillance interne oriente vers le remplacement de la batterie.",
  },

  // =========================================================
  // BRAKING
  // =========================================================

  {
    domain:
      "braking",

    hypothesisA:
      "problem-air-in-brake-system",

    hypothesisB:
      "problem-master-cylinder",

    actionId:
      "braking-bleeding-result",

    text:
      "Effectuer une purge correcte du circuit. Si la pédale redevient ferme, la présence d'air est privilégiée. Si elle continue à descendre sous pression, contrôler le maître-cylindre.",
  },

  {
    domain:
      "braking",

    hypothesisA:
      "problem-brake-servo",

    hypothesisB:
      "problem-vacuum-circuit",

    actionId:
      "braking-vacuum-check",

    text:
      "Contrôler la durite de dépression, le clapet anti-retour et la dépression disponible. Une alimentation en dépression correcte avec assistance toujours absente oriente vers le servofrein.",
  },

  {
    domain:
      "braking",

    hypothesisA:
      "problem-sticking-caliper",

    hypothesisB:
      "problem-brake-hose",

    actionId:
      "braking-caliper-hose-check",

    text:
      "Contrôler séparément le coulissement de l'étrier et le flexible de frein. Une pression qui reste emprisonnée malgré un étrier mécaniquement libre oriente vers le flexible.",
  },

  {
    domain:
      "braking",

    hypothesisA:
      "problem-worn-brake-pads",

    hypothesisB:
      "problem-brake-discs",

    actionId:
      "braking-disc-condition",

    text:
      "Contrôler l'épaisseur des plaquettes puis l'état et le voile des disques. Des plaquettes correctes avec disques rainurés, voilés ou surchauffés orientent vers les disques.",
  },

  {
    domain:
      "braking",

    hypothesisA:
      "problem-abs-wheel-sensor",

    hypothesisB:
      "problem-abs-hydraulic-unit",

    actionId:
      "braking-wheel-speed-sensor-check",

    text:
      "Contrôler le capteur de vitesse de roue, sa cible et son faisceau. Si les signaux de roue sont cohérents mais que le défaut ABS persiste, poursuivre vers le bloc hydraulique.",
  },

  // =========================================================
  // CHARGING
  // =========================================================

  {
    domain:
      "charging",

    hypothesisA:
      "problem-alternator-failure",

    hypothesisB:
      "problem-voltage-regulator",

    actionId:
      "charging-load-test",

    text:
      "Mesurer le comportement de la charge avec phares, ventilation et dégivrage activés. Une production insuffisante sous charge oriente vers l'alternateur ; une régulation excessive ou instable vers le régulateur.",
  },

  {
    domain:
      "charging",

    hypothesisA:
      "problem-accessory-belt",

    hypothesisB:
      "problem-freewheel-pulley",

    actionId:
      "charging-freewheel-pulley-check",

    text:
      "Contrôler la courroie, le tendeur puis le fonctionnement de la poulie roue libre. Une courroie correcte avec poulie bloquée, bruyante ou fonctionnant dans les deux sens oriente vers la poulie.",
  },

  {
    domain:
      "charging",

    hypothesisA:
      "problem-alternator-connections",

    hypothesisB:
      "problem-positive-cable",

    actionId:
      "charging-voltage-drop-positive-value",

    text:
      "Mesurer la chute de tension entre la borne B+ de l'alternateur et la batterie. Une chute excessive localise le défaut sur le circuit positif plutôt que dans les connexions internes de l'alternateur.",
  },

  {
    domain:
      "charging",

    hypothesisA:
      "problem-ground-circuit",

    hypothesisB:
      "problem-positive-cable",

    actionId:
      "charging-voltage-drop-ground-value",

    text:
      "Mesurer séparément les chutes de tension côté masse et côté positif. Une chute excessive côté masse oriente vers le circuit de masse ; une chute côté B+ vers le câble positif.",
  },

  {
    domain:
      "charging",

    hypothesisA:
      "problem-alternator-failure",

    hypothesisB:
      "problem-alternator-command",

    actionId:
      "charging-field-command-result",

    text:
      "Contrôler la commande d'excitation ou le signal LIN/BSS. Une commande correcte avec production insuffisante oriente vers l'alternateur ; une commande absente ou incohérente vers son circuit de pilotage.",
  },

  // =========================================================
  // COOLING
  // =========================================================

  {
    domain:
      "cooling",

    hypothesisA:
      "problem-radiator-fan",

    hypothesisB:
      "problem-fan-control",

    actionId:
      "cooling-fan-motor",

    text:
      "Alimenter directement le moteur du ventilateur. S'il fonctionne correctement en direct, rechercher la panne dans la commande, le relais ou l'alimentation ; s'il ne fonctionne pas, le moteur du ventilateur est suspect.",
  },

  {
    domain:
      "cooling",

    hypothesisA:
      "problem-thermostat",

    hypothesisB:
      "problem-water-pump",

    actionId:
      "cooling-upper-hose",

    text:
      "Observer la montée en température de la durite supérieure et la circulation du liquide. Une ouverture tardive ou absente oriente vers le thermostat ; une circulation insuffisante malgré thermostat ouvert vers la pompe à eau.",
  },

  {
    domain:
      "cooling",

    hypothesisA:
      "problem-temperature-sensor",

    hypothesisB:
      "problem-air-in-system",

    actionId:
      "cooling-temperature-sensor",

    text:
      "Comparer la valeur de la sonde à la température réelle du moteur. Une valeur incohérente oriente vers la sonde ; une valeur cohérente avec variations anormales et chauffage irrégulier peut orienter vers de l'air dans le circuit.",
  },

  {
    domain:
      "cooling",

    hypothesisA:
      "problem-coolant-leak",

    hypothesisB:
      "problem-head-gasket",

    actionId:
      "cooling-visible-leak",

    text:
      "Rechercher d'abord une fuite externe. Si aucune fuite n'est visible malgré une perte de liquide persistante, une fuite interne ou un joint de culasse doit être recherché.",
  },

  // =========================================================
  // ENGINE
  // =========================================================

  {
    domain:
      "engine",

    hypothesisA:
      "problem-ignition-system",

    hypothesisB:
      "problem-injector",

    actionId:
      "engine-ignition-swap",

    text:
      "Permuter la bobine ou la bougie du cylindre concerné. Si le défaut suit l'élément d'allumage, l'allumage est en cause ; s'il reste sur le même cylindre, poursuivre vers l'injection ou la mécanique.",
  },

  {
    domain:
      "engine",

    hypothesisA:
      "problem-fuel-pump",

    hypothesisB:
      "problem-fuel-pressure",

    actionId:
      "engine-fuel-pressure",

    text:
      "Mesurer la pression de carburant. Une pompe qui fonctionne mais une pression insuffisante impose de distinguer pompe, régulation, filtre ou fuite de pression.",
  },

  {
    domain:
      "engine",

    hypothesisA:
      "problem-crankshaft-sensor",

    hypothesisB:
      "problem-camshaft-timing",

    actionId:
      "engine-sync",

    text:
      "Contrôler la synchronisation vilebrequin-arbre à cames pendant le lancement. Une absence de signal régime oriente vers le capteur vilebrequin ; des signaux présents mais désynchronisés vers le calage moteur.",
  },

  {
    domain:
      "engine",

    hypothesisA:
      "problem-air-intake",

    hypothesisB:
      "problem-egr-system",

    actionId:
      "engine-throttle-egr",

    text:
      "Contrôler l'admission, le boîtier papillon et la vanne EGR. Une prise d'air mesurable oriente vers l'admission ; une EGR bloquée ou fortement encrassée vers le système EGR.",
  },

  {
    domain:
      "engine",

    hypothesisA:
      "problem-turbo-system",

    hypothesisB:
      "problem-air-intake",

    actionId:
      "engine-boost-leak",

    text:
      "Contrôler toutes les durites de suralimentation et l'étanchéité de l'admission. Une fuite explique une pression de suralimentation insuffisante sans condamner le turbo.",
  },

  {
    domain:
      "engine",

    hypothesisA:
      "problem-low-compression",

    hypothesisB:
      "problem-ignition-system",

    actionId:
      "engine-compression",

    text:
      "Mesurer les compressions sur les cylindres concernés. Une compression correcte oriente davantage vers l'allumage ; une compression faible confirme une cause mécanique.",
  },

  // =========================================================
  // STARTING
  // =========================================================

  {
    domain:
      "starting",

    hypothesisA:
      "problem-weak-battery",

    hypothesisB:
      "problem-starter",

    actionId:
      "starting-booster-test",

    text:
      "Effectuer un essai avec un booster correctement branché. Si le moteur retrouve une vitesse normale de lancement, la batterie est privilégiée ; si le démarreur reste lent ou inactif, contrôler le démarreur et son alimentation.",
  },

  {
    domain:
      "starting",

    hypothesisA:
      "problem-weak-battery",

    hypothesisB:
      "problem-battery-connection",

    actionId:
      "starting-check-battery-terminals",

    text:
      "Contrôler et solliciter les bornes et câbles de batterie. Une batterie correctement chargée avec chute de tension au niveau des connexions oriente vers les câbles ou les cosses.",
  },

  {
    domain:
      "starting",

    hypothesisA:
      "problem-starter",

    hypothesisB:
      "problem-starter-control-circuit",

    actionId:
      "starting-starter-command-check",

    text:
      "Mesurer la tension sur le fil de commande du démarreur pendant la tentative. Une commande correcte avec démarreur inactif oriente vers le démarreur ; une commande absente vers le circuit de commande.",
  },

  {
    domain:
      "starting",

    hypothesisA:
      "problem-starter",

    hypothesisB:
      "problem-starter-drive",

    actionId:
      "starting-confirm-starter-drive",

    text:
      "Vérifier si le démarreur tourne rapidement sans entraîner le moteur. Dans ce cas, le lanceur ou le pignon est davantage suspect que le moteur électrique du démarreur.",
  },

  {
    domain:
      "starting",

    hypothesisA:
      "problem-fuel-supply",

    hypothesisB:
      "problem-immobilizer",

    actionId:
      "starting-immobilizer-question",

    text:
      "Contrôler le voyant d'antidémarrage puis tester la seconde clé. Si l'antidémarrage est reconnu correctement, poursuivre le contrôle de l'alimentation en carburant.",
  },

  // =========================================================
  // STEERING
  // =========================================================

  {
    domain:
      "steering",

    hypothesisA:
      "problem-power-steering-pump",

    hypothesisB:
      "problem-eps-system",

    actionId:
      "steering-power-assisted",

    text:
      "Identifier d'abord le type d'assistance. Une pompe hydraulique ne peut être incriminée que sur un système hydraulique ; sur une direction électrique, poursuivre vers le système EPS.",
  },

  {
    domain:
      "steering",

    hypothesisA:
      "problem-power-steering-fluid-low",

    hypothesisB:
      "problem-power-steering-leak",

    actionId:
      "steering-leak",

    text:
      "Contrôler le niveau puis rechercher une fuite. Un niveau bas accompagné de traces de liquide confirme davantage une fuite qu'un simple niveau insuffisant.",
  },

  {
    domain:
      "steering",

    hypothesisA:
      "problem-steering-rack",

    hypothesisB:
      "problem-steering-column",

    actionId:
      "steering-play-location",

    text:
      "Localiser précisément le jeu. Un jeu concentré au volant ou à la colonne oriente vers la colonne ; un jeu transmis à la crémaillère et aux roues oriente vers la crémaillère.",
  },

  {
    domain:
      "steering",

    hypothesisA:
      "problem-wheel-alignment",

    hypothesisB:
      "problem-wheel-balance",

    actionId:
      "steering-vibration-speed",

    text:
      "Observer si le défaut se manifeste surtout par une dérive constante ou par une vibration dépendante de la vitesse. La dérive oriente vers la géométrie ; la vibration vers l'équilibrage ou le pneumatique.",
  },

  // =========================================================
  // SUSPENSION
  // =========================================================

  {
    domain:
      "suspension",

    hypothesisA:
      "problem-outer-tie-rod",

    hypothesisB:
      "problem-inner-tie-rod",

    actionId:
      "suspension-steering-joint-check",

    text:
      "Mettre la roue en contrainte et localiser précisément le jeu entre la rotule extérieure et la rotule axiale.",
  },

  {
    domain:
      "suspension",

    hypothesisA:
      "problem-stabilizer-link",

    hypothesisB:
      "problem-stabilizer-bushing",

    actionId:
      "suspension-link-check",

    text:
      "Mettre en contrainte la barre stabilisatrice et contrôler séparément la biellette et le silentbloc afin de localiser le jeu.",
  },

  {
    domain:
      "suspension",

    hypothesisA:
      "problem-shock-mount",

    hypothesisB:
      "problem-strut-bearing",

    actionId:
      "suspension-shock-mount-check",

    text:
      "Contrôler la coupelle, la fixation et le roulement supérieur pendant un mouvement de suspension et de braquage afin de localiser le jeu ou le bruit.",
  },

  {
    domain:
      "suspension",

    hypothesisA:
      "problem-wheel-balance",

    hypothesisB:
      "problem-bent-rim",

    actionId:
      "suspension-wheel-balance-check",

    text:
      "Contrôler la roue sur équilibreuse et mesurer le voile de jante. Un déséquilibre corrigible par masses oriente vers l'équilibrage ; un voile géométrique vers la jante.",
  },

  {
    domain:
      "suspension",

    hypothesisA:
      "problem-wheel-balance",

    hypothesisB:
      "problem-deformed-tyre",

    actionId:
      "suspension-wheel-balance-check",

    text:
      "Contrôler l'équilibrage et observer le faux-rond du pneumatique. Une roue équilibrée présentant encore un faux-rond oriente vers un pneu déformé.",
  },

  {
    domain:
      "suspension",

    hypothesisA:
      "problem-ball-joint",

    hypothesisB:
      "problem-wheel-bearing",

    actionId:
      "suspension-wheel-play-check",

    text:
      "Roue levée, contrôler le jeu horizontal et vertical puis localiser visuellement le mouvement. Un mouvement dans la rotule oriente vers celle-ci ; un jeu au moyeu vers le roulement.",
  },

  {
    domain:
      "suspension",

    hypothesisA:
      "problem-wheel-alignment",

    hypothesisB:
      "problem-deformed-tyre",

    actionId:
      "suspension-tyre-wear-pattern",

    text:
      "Examiner le profil d'usure du pneu et contrôler la géométrie. Une usure géométrique régulière oriente vers le réglage des trains ; une déformation localisée vers le pneumatique.",
  },

  // =========================================================
  // TRANSMISSION
  // =========================================================

  {
    domain:
      "transmission",

    hypothesisA:
      "problem-clutch-release-bearing",

    hypothesisB:
      "problem-clutch-mechanism",

    actionId:
      "transmission-clutch-mechanical-check",

    text:
      "Contrôler séparément la butée, la fourchette et le mécanisme d'embrayage afin de localiser le bruit, le point dur ou la course anormale.",
  },

  {
    domain:
      "transmission",

    hypothesisA:
      "problem-manual-synchronizer",

    hypothesisB:
      "problem-manual-selector-internal",

    actionId:
      "transmission-manual-internal-check",

    text:
      "Contrôler les synchros, fourchettes, baladeurs et pignons afin de distinguer un synchroniseur usé d'un défaut interne de sélection.",
  },

  {
    domain:
      "transmission",

    hypothesisA:
      "problem-automatic-pump",

    hypothesisB:
      "problem-automatic-valve-body",

    actionId:
      "transmission-pump-valve-body-check",

    text:
      "Contrôler la pression hydraulique puis la pompe et le bloc hydraulique. Une pression d'alimentation insuffisante en amont oriente vers la pompe ; une pression disponible mais mal distribuée vers le bloc hydraulique.",
  },

  {
    domain:
      "transmission",

    hypothesisA:
      "problem-automatic-filter",

    hypothesisB:
      "problem-automatic-valve-body",

    actionId:
      "transmission-pump-valve-body-check",

    text:
      "Contrôler le filtre et la pression avant d'incriminer le bloc hydraulique. Un débit insuffisant lié au filtre doit être éliminé avant de conclure à un défaut du valve body.",
  },

  {
    domain:
      "transmission",

    hypothesisA:
      "problem-dct-mechatronic",

    hypothesisB:
      "problem-dct-actuator",

    actionId:
      "transmission-dct-mechatronic-check",

    text:
      "Effectuer les tests d'actionneurs de la mécatronique et contrôler les commandes. Un actionneur isolé hors tolérance oriente vers celui-ci ; plusieurs fonctions incohérentes vers la mécatronique.",
  },

  {
    domain:
      "transmission",

    hypothesisA:
      "problem-dct-mechatronic",

    hypothesisB:
      "problem-dct-position-sensor",

    actionId:
      "transmission-dct-mechatronic-check",

    text:
      "Comparer la position commandée et la position réellement mesurée. Une commande correcte avec retour de position incohérent oriente vers le capteur ; plusieurs fonctions de commande défaillantes vers la mécatronique.",
  },

  {
    domain:
      "transmission",

    hypothesisA:
      "problem-cvt-belt-chain",

    hypothesisB:
      "problem-cvt-pulley",

    actionId:
      "transmission-cvt-pulley-belt-check",

    text:
      "Inspecter la chaîne ou courroie métallique et les surfaces des poulies afin de déterminer quel élément présente l'usure ou la détérioration.",
  },
];

const CHECKS =
  new Map<
    string,
    DiagnosticDiscriminatingCheck
  >();

for (
  const entry
  of ENTRIES
) {

  CHECKS.set(
    pairKey(
      entry.hypothesisA,
      entry.hypothesisB,
    ),
    {
      domain:
        entry.domain,

      actionId:
        entry.actionId,

      text:
        entry.text,
    },
  );
}

export function getDiagnosticDiscriminatingCheck(
  hypothesisA: string,
  hypothesisB: string,
): DiagnosticDiscriminatingCheck | null {

  return (
    CHECKS.get(
      pairKey(
        hypothesisA,
        hypothesisB,
      ),
    ) ??
    null
  );
}

export function getDiagnosticDiscriminatingCheckCount():
  number {

  return CHECKS.size;
}

export function getDiagnosticDiscriminatingCheckDomains():
  string[] {

  return [
    ...new Set(
      ENTRIES.map(
        entry =>
          entry.domain,
      ),
    ),
  ].sort();
}