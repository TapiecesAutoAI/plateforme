import type {
  DiagnosticAction,
  DiagnosticAudience,
} from "../../core/actionTypes";

const ALL_AUDIENCES:
  DiagnosticAudience[] = [
    "particulier",
    "bricoleur",
    "vendeur-pieces-auto",
    "mecanicien-garage",
    "depanneur",
    "etudiant-mecanique",
    "autre-professionnel",
  ];

export const startingActions:
  DiagnosticAction[] = [
    {
      id: "starting-main-behaviour",
      workflowId: "starting",
      type: "ask-question",
      text: "Que se passe-t-il lorsque vous essayez de démarrer le véhicule ?",
      purpose: "Séparer immédiatement les principales familles de panne.",
      audiences: ALL_AUDIENCES,
      complexity: "simple",
      priority: 1,
      options: [
        {
          id: "engine-not-turning",
          label: "Le moteur ne tourne pas",
          value: "Le moteur ne tourne pas pendant la tentative de démarrage.",
          addsEvidence: [
            "symptom-no-start",
            "symptom-no-crank",
          ],
          nextActionId: "starting-sound",
        },
        {
          id: "engine-turning-slowly",
          label: "Le moteur tourne lentement",
          value: "Le moteur tourne lentement pendant la tentative de démarrage.",
          addsEvidence: [
            "symptom-no-start",
            "symptom-slow-cranking",
          ],
          nextActionId: "starting-lights",
        },
        {
          id: "engine-cranks-no-start",
          label: "Le moteur tourne normalement mais ne démarre pas",
          value: "Le moteur tourne normalement mais ne démarre pas.",
          addsEvidence: [
            "symptom-no-start",
            "symptom-engine-cranks",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "single-click",
          label: "J'entends un seul clic",
          value: "Un seul clic est entendu pendant la tentative de démarrage.",
          addsEvidence: [
            "symptom-no-start",
            "symptom-single-click",
          ],
          nextActionId: "starting-lights",
        },
        {
          id: "rapid-clicking",
          label: "J'entends plusieurs clics rapides",
          value: "Plusieurs clics rapides sont entendus pendant la tentative de démarrage.",
          addsEvidence: [
            "symptom-no-start",
            "symptom-rapid-clicking",
          ],
          nextActionId: "starting-lights",
        },
        {
          id: "nothing-happens",
          label: "Rien ne se passe",
          value: "Rien ne se passe pendant la tentative de démarrage.",
          addsEvidence: [
            "symptom-no-start",
            "symptom-no-crank",
          ],
          nextActionId: "starting-lights",
        },
        {
          id: "unsure",
          label: "Je ne sais pas",
          value: "Le comportement exact au démarrage n'est pas connu.",
          nextActionId: "starting-sound",
        },
      ],
    },

    {
      id: "starting-sound",
      workflowId: "starting",
      type: "ask-question",
      text: "Quel bruit entendez-vous au moment de démarrer ?",
      purpose: "Identifier les bruits très discriminants du démarreur.",
      audiences: ALL_AUDIENCES,
      complexity: "simple",
      priority: 2,
      options: [
        {
          id: "single-click",
          label: "Un seul clic",
          value: "Un seul clic est entendu.",
          addsEvidence: [
            "symptom-single-click",
          ],
          rejectsEvidence: [
            "symptom-rapid-clicking",
            "symptom-starter-spins-free",
            "symptom-metallic-grinding",
          ],
          nextActionId: "starting-lights",
        },
        {
          id: "rapid-clicking",
          label: "Plusieurs clics rapides",
          value: "Plusieurs clics rapides sont entendus.",
          addsEvidence: [
            "symptom-rapid-clicking",
          ],
          rejectsEvidence: [
            "symptom-single-click",
            "symptom-starter-spins-free",
            "symptom-metallic-grinding",
          ],
          nextActionId: "starting-lights",
        },
        {
          id: "starter-spins-free",
          label: "Le démarreur tourne dans le vide",
          value: "Le démarreur tourne dans le vide sans entraîner le moteur.",
          addsEvidence: [
            "symptom-starter-spins-free",
          ],
          rejectsEvidence: [
            "symptom-single-click",
            "symptom-rapid-clicking",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "metallic-grinding",
          label: "Bruit métallique ou grincement",
          value: "Un bruit métallique ou de grincement est entendu.",
          addsEvidence: [
            "symptom-metallic-grinding",
          ],
          rejectsEvidence: [
            "symptom-single-click",
            "symptom-rapid-clicking",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "no-click",
          label: "Aucun clic",
          value: "Aucun clic n'est entendu.",
          rejectsEvidence: [
            "symptom-single-click",
            "symptom-rapid-clicking",
          ],
          nextActionId: "starting-lights",
        },
        {
          id: "unsure",
          label: "Je ne sais pas",
          value: "Le bruit exact n'est pas connu.",
          nextActionId: "starting-lights",
        },
      ],
    },

    {
      id: "starting-lights",
      workflowId: "starting",
      type: "request-observation",
      text: "Les voyants ou les phares faiblissent-ils pendant la tentative de démarrage ?",
      purpose: "Observer si la tension électrique s'effondre sous la charge.",
      audiences: ALL_AUDIENCES,
      complexity: "simple",
      priority: 3,
      options: [
        {
          id: "strongly",
          label: "Oui, fortement",
          value: "Les voyants ou les phares faiblissent fortement.",
          addsEvidence: [
            "observation-lights-dim-strongly",
          ],
          nextActionId: "starting-jump-test",
        },
        {
          id: "slightly",
          label: "Oui, légèrement",
          value: "Les voyants ou les phares faiblissent légèrement.",
          addsEvidence: [
            "observation-lights-dim-slightly",
          ],
          nextActionId: "starting-intermittent",
        },
        {
          id: "normal",
          label: "Non, ils restent normaux",
          value: "Les voyants et les phares restent normaux.",
          addsEvidence: [
            "observation-lights-stay-normal",
          ],
          nextActionId: "starting-intermittent",
        },
        {
          id: "unsure",
          label: "Je ne sais pas",
          value: "La variation des éclairages n'est pas connue.",
          nextActionId: "starting-intermittent",
        },
      ],
    },

    {
      id: "starting-jump-test",
      workflowId: "starting",
      type: "recommend-test",
      text: "Le véhicule démarre-t-il avec des câbles ou un booster ?",
      purpose: "Distinguer un manque d'énergie d'un défaut du démarreur.",
      audiences: [
        "bricoleur",
        "vendeur-pieces-auto",
        "mecanicien-garage",
        "depanneur",
        "etudiant-mecanique",
        "autre-professionnel",
      ],
      complexity: "intermediate",
      priority: 4,
      options: [
        {
          id: "yes",
          label: "Oui",
          value: "Le véhicule démarre avec des câbles ou un booster.",
          addsEvidence: [
            "observation-jump-start-success",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "no",
          label: "Non",
          value: "Le véhicule ne démarre pas avec des câbles ou un booster.",
          addsEvidence: [
            "observation-jump-start-fails",
          ],
          nextActionId: "starting-intermittent",
        },
        {
          id: "not-tested",
          label: "Pas encore testé",
          value: "Le test avec câbles ou booster n'a pas été réalisé.",
          nextActionId: "starting-intermittent",
        },
      ],
    },

    {
      id: "starting-intermittent",
      workflowId: "starting",
      type: "ask-question",
      text: "Le véhicule démarre-t-il parfois normalement après plusieurs tentatives ?",
      purpose: "Rechercher un défaut intermittent du démarreur ou de sa commande.",
      audiences: ALL_AUDIENCES,
      complexity: "simple",
      priority: 5,
      options: [
        {
          id: "yes",
          label: "Oui",
          value: "Le véhicule démarre parfois après plusieurs tentatives.",
          addsEvidence: [
            "observation-starts-intermittently",
          ],
          nextActionId: "starting-hot-engine",
        },
        {
          id: "no",
          label: "Non",
          value: "Plusieurs tentatives ne changent rien.",
          nextActionId: "starting-conclude",
        },
        {
          id: "unsure",
          label: "Je ne sais pas",
          value: "Le caractère intermittent n'est pas connu.",
          nextActionId: "starting-conclude",
        },
      ],
    },

    {
      id: "starting-hot-engine",
      workflowId: "starting",
      type: "ask-question",
      text: "Le problème apparaît-il surtout lorsque le moteur est chaud ?",
      purpose: "Rechercher un défaut thermique intermittent du démarreur.",
      audiences: [
        "bricoleur",
        "vendeur-pieces-auto",
        "mecanicien-garage",
        "depanneur",
        "etudiant-mecanique",
        "autre-professionnel",
      ],
      complexity: "intermediate",
      priority: 6,
      options: [
        {
          id: "yes",
          label: "Oui",
          value: "Le problème apparaît surtout moteur chaud.",
          addsEvidence: [
            "observation-problem-hot-engine",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "no",
          label: "Non",
          value: "Le problème n'est pas lié à la température du moteur.",
          nextActionId: "starting-conclude",
        },
        {
          id: "unsure",
          label: "Je ne sais pas",
          value: "L'influence de la température n'est pas connue.",
          nextActionId: "starting-conclude",
        },
      ],
    },

    {
      id: "starting-battery-voltage",
      workflowId: "starting",
      type: "request-measurement",
      text: "Quelle tension est mesurée aux bornes de la batterie avant le démarrage ?",
      purpose: "Confirmer l'état de charge de la batterie.",
      audiences: [
        "bricoleur",
        "mecanicien-garage",
        "depanneur",
        "etudiant-mecanique",
        "autre-professionnel",
      ],
      complexity: "intermediate",
      priority: 7,
      options: [
        {
          id: "low",
          label: "Moins d'environ 12,2 V",
          value: "La tension de batterie est insuffisante.",
          addsEvidence: [
            "observation-battery-voltage-low",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "normal",
          label: "Environ 12,4 à 12,8 V",
          value: "La tension de batterie est normale.",
          addsEvidence: [
            "observation-battery-voltage-normal",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "not-measured",
          label: "Pas encore mesurée",
          value: "La tension de batterie n'a pas été mesurée.",
          nextActionId: "starting-conclude",
        },
      ],
    },

    {
      id: "starting-control-voltage",
      workflowId: "starting",
      type: "request-measurement",
      text: "La tension de commande arrive-t-elle au démarreur pendant la tentative ?",
      purpose: "Séparer un démarreur défectueux d'un défaut de commande.",
      audiences: [
        "mecanicien-garage",
        "depanneur",
        "autre-professionnel",
      ],
      complexity: "technical",
      priority: 8,
      options: [
        {
          id: "present",
          label: "Oui",
          value: "La tension de commande arrive au démarreur.",
          addsEvidence: [
            "observation-starter-control-voltage-present",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "absent",
          label: "Non",
          value: "La tension de commande n'arrive pas au démarreur.",
          addsEvidence: [
            "observation-starter-control-voltage-absent",
          ],
          nextActionId: "starting-conclude",
        },
        {
          id: "not-tested",
          label: "Pas encore contrôlé",
          value: "La tension de commande n'a pas été contrôlée.",
          nextActionId: "starting-conclude",
        },
      ],
    },

    {
      id: "starting-conclude",
      workflowId: "starting",
      type: "complete-diagnosis",
      text: "Calcul du diagnostic de démarrage.",
      audiences: ALL_AUDIENCES,
      complexity: "simple",
      priority: 100,
      diagnosisId: "starting-diagnosis",
    },
  ];
