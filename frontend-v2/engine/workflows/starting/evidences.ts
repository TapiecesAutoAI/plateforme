export type StartingEvidenceId =
  | "symptom-no-start"
  | "symptom-no-crank"
  | "symptom-slow-cranking"
  | "symptom-engine-cranks"
  | "symptom-single-click"
  | "symptom-rapid-clicking"
  | "symptom-starter-spins-free"
  | "symptom-metallic-grinding"
  | "observation-lights-dim-strongly"
  | "observation-lights-dim-slightly"
  | "observation-lights-stay-normal"
  | "observation-jump-start-success"
  | "observation-jump-start-fails"
  | "observation-starts-intermittently"
  | "observation-problem-hot-engine"
  | "observation-battery-voltage-low"
  | "observation-battery-voltage-normal"
  | "observation-battery-terminal-corrosion"
  | "observation-starter-control-voltage-present"
  | "observation-starter-control-voltage-absent";

export type StartingEvidenceDefinition = {
  id: StartingEvidenceId;
  label: string;
  defaultConfidence: number;
};

export const startingEvidenceDefinitions:
  StartingEvidenceDefinition[] = [
    {
      id: "symptom-no-start",
      label: "Le véhicule ne démarre pas",
      defaultConfidence: 0.85,
    },
    {
      id: "symptom-no-crank",
      label: "Le moteur ne tourne pas pendant la tentative de démarrage",
      defaultConfidence: 0.92,
    },
    {
      id: "symptom-slow-cranking",
      label: "Le moteur tourne lentement pendant la tentative de démarrage",
      defaultConfidence: 0.94,
    },
    {
      id: "symptom-engine-cranks",
      label: "Le moteur tourne normalement mais ne démarre pas",
      defaultConfidence: 0.96,
    },
    {
      id: "symptom-single-click",
      label: "Un seul clic est entendu au démarrage",
      defaultConfidence: 0.92,
    },
    {
      id: "symptom-rapid-clicking",
      label: "Plusieurs clics rapides sont entendus au démarrage",
      defaultConfidence: 0.96,
    },
    {
      id: "symptom-starter-spins-free",
      label: "Le démarreur tourne dans le vide",
      defaultConfidence: 0.99,
    },
    {
      id: "symptom-metallic-grinding",
      label: "Un bruit métallique ou de grincement est entendu au démarrage",
      defaultConfidence: 0.98,
    },
    {
      id: "observation-lights-dim-strongly",
      label: "Les voyants ou les phares faiblissent fortement",
      defaultConfidence: 0.88,
    },
    {
      id: "observation-lights-dim-slightly",
      label: "Les voyants ou les phares faiblissent légèrement",
      defaultConfidence: 0.62,
    },
    {
      id: "observation-lights-stay-normal",
      label: "Les voyants et les phares restent normaux",
      defaultConfidence: 0.78,
    },
    {
      id: "observation-jump-start-success",
      label: "Le véhicule démarre avec des câbles ou un booster",
      defaultConfidence: 0.97,
    },
    {
      id: "observation-jump-start-fails",
      label: "Le véhicule ne démarre pas avec des câbles ou un booster",
      defaultConfidence: 0.90,
    },
    {
      id: "observation-starts-intermittently",
      label: "Le véhicule démarre parfois après plusieurs tentatives",
      defaultConfidence: 0.90,
    },
    {
      id: "observation-problem-hot-engine",
      label: "Le problème apparaît surtout moteur chaud",
      defaultConfidence: 0.80,
    },
    {
      id: "observation-battery-voltage-low",
      label: "La tension de batterie est insuffisante",
      defaultConfidence: 0.96,
    },
    {
      id: "observation-battery-voltage-normal",
      label: "La tension de batterie est normale",
      defaultConfidence: 0.90,
    },
    {
      id: "observation-battery-terminal-corrosion",
      label: "Les bornes ou connexions de batterie sont oxydées ou desserrées",
      defaultConfidence: 0.92,
    },
    {
      id: "observation-starter-control-voltage-present",
      label: "La commande électrique arrive au démarreur",
      defaultConfidence: 0.98,
    },
    {
      id: "observation-starter-control-voltage-absent",
      label: "La commande électrique n'arrive pas au démarreur",
      defaultConfidence: 0.98,
    },
  ];

const evidenceById = new Map(
  startingEvidenceDefinitions.map(
    (definition) => [
      definition.id,
      definition,
    ],
  ),
);

export function getStartingEvidenceDefinition(
  evidenceId: StartingEvidenceId,
): StartingEvidenceDefinition | null {
  return evidenceById.get(evidenceId) ?? null;
}
