import type {
  StartingEvidenceId,
} from "./evidences";

export type StartingHypothesisId =
  | "problem-weak-battery"
  | "problem-battery-internal-failure"
  | "problem-battery-connection"
  | "problem-starter"
  | "problem-starter-solenoid"
  | "problem-starter-drive"
  | "problem-starter-worn-brushes"
  | "problem-starter-relay"
  | "problem-starter-control-circuit"
  | "problem-engine-mechanical-lock"
  | "problem-engine-cranks-no-start";

export type StartingHypothesisDefinition = {
  id: StartingHypothesisId;
  label: string;
  explanation: string;
  possibleParts: string[];
  recommendedChecks: string[];
  support: Partial<Record<StartingEvidenceId, number>>;
  contradictions: Partial<Record<StartingEvidenceId, number>>;
};

export const startingHypotheses:
  StartingHypothesisDefinition[] = [
    {
      id: "problem-weak-battery",
      label: "Batterie faible ou déchargée",
      explanation:
        "La batterie ne fournit pas suffisamment d'énergie pour entraîner correctement le démarreur.",
      possibleParts: [
        "Batterie",
      ],
      recommendedChecks: [
        "Mesure de la tension de batterie",
        "Test de capacité et de courant de démarrage",
        "Contrôle du circuit de charge",
      ],
      support: {
        "symptom-rapid-clicking": 0.96,
        "symptom-slow-cranking": 0.88,
        "observation-lights-dim-strongly": 0.90,
        "observation-lights-dim-slightly": 0.42,
        "observation-jump-start-success": 0.98,
        "observation-battery-voltage-low": 0.99,
      },
      contradictions: {
        "symptom-starter-spins-free": 0.98,
        "symptom-metallic-grinding": 0.90,
        "observation-lights-stay-normal": 0.60,
        "observation-jump-start-fails": 0.78,
        "observation-battery-voltage-normal": 0.92,
      },
    },
    {
      id: "problem-battery-internal-failure",
      label: "Batterie défectueuse",
      explanation:
        "La batterie peut afficher une tension correcte au repos tout en s'effondrant sous la charge du démarreur.",
      possibleParts: [
        "Batterie",
      ],
      recommendedChecks: [
        "Test de capacité",
        "Test du courant de démarrage à froid",
      ],
      support: {
        "symptom-rapid-clicking": 0.72,
        "symptom-slow-cranking": 0.74,
        "observation-lights-dim-strongly": 0.82,
        "observation-jump-start-success": 0.86,
      },
      contradictions: {
        "symptom-starter-spins-free": 0.96,
        "symptom-metallic-grinding": 0.86,
        "observation-jump-start-fails": 0.58,
      },
    },
    {
      id: "problem-battery-connection",
      label: "Connexion de batterie ou masse défectueuse",
      explanation:
        "Une borne desserrée, oxydée ou une mauvaise masse limite le courant disponible au démarreur.",
      possibleParts: [
        "Cosse de batterie",
        "Câble positif",
        "Câble de masse",
      ],
      recommendedChecks: [
        "Contrôle visuel des bornes",
        "Contrôle des chutes de tension",
      ],
      support: {
        "symptom-single-click": 0.62,
        "symptom-rapid-clicking": 0.68,
        "symptom-slow-cranking": 0.66,
        "observation-lights-dim-strongly": 0.70,
        "observation-battery-terminal-corrosion": 0.99,
      },
      contradictions: {
        "symptom-starter-spins-free": 0.94,
        "symptom-metallic-grinding": 0.82,
        "observation-starter-control-voltage-present": 0.46,
      },
    },
    {
      id: "problem-starter",
      label: "Démarreur défectueux",
      explanation:
        "Le démarreur ne transforme plus correctement l'énergie électrique en rotation mécanique.",
      possibleParts: [
        "Démarreur",
      ],
      recommendedChecks: [
        "Contrôle de l'alimentation du démarreur",
        "Contrôle des chutes de tension",
        "Mesure du courant absorbé",
      ],
      support: {
        "symptom-no-crank": 0.72,
        "symptom-single-click": 0.84,
        "observation-lights-stay-normal": 0.78,
        "observation-jump-start-fails": 0.86,
        "observation-starter-control-voltage-present": 0.98,
      },
      contradictions: {
        "symptom-rapid-clicking": 0.58,
        "observation-jump-start-success": 0.72,
        "symptom-engine-cranks": 0.99,
      },
    },
    {
      id: "problem-starter-solenoid",
      label: "Solénoïde de démarreur défectueux",
      explanation:
        "Le solénoïde s'active mais n'alimente pas correctement le moteur de démarreur.",
      possibleParts: [
        "Solénoïde",
        "Démarreur complet",
      ],
      recommendedChecks: [
        "Contrôle de la commande du solénoïde",
        "Contrôle du circuit de puissance",
      ],
      support: {
        "symptom-single-click": 0.97,
        "observation-lights-stay-normal": 0.76,
        "observation-starter-control-voltage-present": 0.94,
      },
      contradictions: {
        "symptom-rapid-clicking": 0.64,
        "symptom-starter-spins-free": 0.92,
        "symptom-metallic-grinding": 0.76,
        "observation-jump-start-success": 0.66,
      },
    },
    {
      id: "problem-starter-drive",
      label: "Lanceur ou pignon de démarreur défectueux",
      explanation:
        "Le démarreur tourne mais son pignon n'entraîne pas correctement le moteur thermique.",
      possibleParts: [
        "Lanceur de démarreur",
        "Pignon de démarreur",
        "Démarreur complet",
      ],
      recommendedChecks: [
        "Contrôle du fonctionnement du lanceur",
        "Contrôle de la couronne moteur",
      ],
      support: {
        "symptom-starter-spins-free": 0.999,
        "symptom-metallic-grinding": 0.98,
      },
      contradictions: {
        "symptom-rapid-clicking": 0.92,
        "symptom-slow-cranking": 0.82,
        "observation-jump-start-success": 0.72,
      },
    },
    {
      id: "problem-starter-worn-brushes",
      label: "Charbons de démarreur usés",
      explanation:
        "Des charbons usés peuvent provoquer un fonctionnement intermittent du démarreur.",
      possibleParts: [
        "Démarreur",
        "Jeu de charbons selon disponibilité",
      ],
      recommendedChecks: [
        "Contrôle du fonctionnement intermittent",
        "Contrôle du courant absorbé",
      ],
      support: {
        "observation-starts-intermittently": 0.98,
        "observation-problem-hot-engine": 0.74,
        "observation-jump-start-fails": 0.52,
      },
      contradictions: {
        "symptom-rapid-clicking": 0.52,
        "symptom-starter-spins-free": 0.86,
        "symptom-metallic-grinding": 0.88,
      },
    },
    {
      id: "problem-starter-relay",
      label: "Relais de démarreur défectueux",
      explanation:
        "Le relais ne transmet pas correctement l'ordre électrique au démarreur.",
      possibleParts: [
        "Relais de démarreur",
      ],
      recommendedChecks: [
        "Contrôle du relais",
        "Contrôle de la tension de commande",
      ],
      support: {
        "symptom-no-crank": 0.64,
        "observation-starter-control-voltage-absent": 0.86,
        "observation-lights-stay-normal": 0.62,
      },
      contradictions: {
        "symptom-starter-spins-free": 0.99,
        "symptom-metallic-grinding": 0.90,
        "observation-starter-control-voltage-present": 0.96,
      },
    },
    {
      id: "problem-starter-control-circuit",
      label: "Défaut du circuit de commande du démarreur",
      explanation:
        "L'ordre de démarrage n'arrive pas jusqu'au démarreur.",
      possibleParts: [
        "Contacteur de démarrage",
        "Bouton Start",
        "Capteur d'embrayage",
        "Capteur de position de boîte",
        "Câblage",
      ],
      recommendedChecks: [
        "Contrôle de la tension de commande",
        "Lecture des autorisations de démarrage",
      ],
      support: {
        "symptom-no-crank": 0.72,
        "observation-starter-control-voltage-absent": 0.99,
        "observation-lights-stay-normal": 0.56,
      },
      contradictions: {
        "symptom-single-click": 0.72,
        "symptom-rapid-clicking": 0.84,
        "symptom-starter-spins-free": 0.999,
        "symptom-metallic-grinding": 0.96,
        "observation-starter-control-voltage-present": 0.99,
      },
    },
    {
      id: "problem-engine-mechanical-lock",
      label: "Moteur ou accessoire mécaniquement bloqué",
      explanation:
        "Le moteur thermique ou un accessoire entraîné peut empêcher la rotation.",
      possibleParts: [],
      recommendedChecks: [
        "Vérification professionnelle de la rotation mécanique",
        "Contrôle des accessoires entraînés",
      ],
      support: {
        "symptom-no-crank": 0.68,
        "symptom-single-click": 0.54,
        "observation-jump-start-fails": 0.74,
        "observation-lights-dim-strongly": 0.52,
      },
      contradictions: {
        "symptom-starter-spins-free": 0.90,
        "symptom-engine-cranks": 0.999,
        "observation-jump-start-success": 0.98,
        "observation-starts-intermittently": 0.82,
      },
    },
    {
      id: "problem-engine-cranks-no-start",
      label: "Le moteur tourne mais ne démarre pas",
      explanation:
        "La panne ne se situe probablement pas dans le démarreur, mais dans l'allumage, l'injection, l'alimentation en carburant, l'antidémarrage ou la compression.",
      possibleParts: [],
      recommendedChecks: [
        "Lecture des codes défaut",
        "Contrôle de l'allumage ou de l'injection",
        "Contrôle de l'alimentation en carburant",
      ],
      support: {
        "symptom-engine-cranks": 0.999,
      },
      contradictions: {
        "symptom-no-crank": 0.99,
        "symptom-single-click": 0.96,
        "symptom-rapid-clicking": 0.98,
        "symptom-starter-spins-free": 0.82,
      },
    },
  ];
