import type {
  ChiefComplaint,
} from "./chiefComplaint";

export type DiagnosticWorkflow =
  | "starting"
  | "battery-discharge"
  | "charging"
  | "cooling"
  | "braking"
  | "steering"
  | "suspension"
  | "transmission"
  | "engine"
  | "noise"
  | "general";

export interface WorkflowState {
  workflow: DiagnosticWorkflow;

  locked: boolean;

  confidence: number;

  reason: string;
}

export function createWorkflow(
  complaint: ChiefComplaint,
): WorkflowState {
  switch (
    complaint.category
  ) {
    case "no-start":

      return {
        workflow:
          "starting",

        locked: true,

        confidence:
          complaint.confidence,

        reason:
          "Plainte principale : démarrage",
      };

    case "starter":

      return {
        workflow:
          "starting",

        locked: true,

        confidence:
          complaint.confidence,

        reason:
          "Plainte principale : démarreur",
      };

    case "slow-cranking":

      return {
        workflow:
          "starting",

        locked: true,

        confidence:
          complaint.confidence,

        reason:
          "Rotation lente",
      };

    case "battery-discharge":

      return {
        workflow:
          "battery-discharge",

        locked: true,

        confidence:
          complaint.confidence,

        reason:
          "Décharge batterie",
      };

    case "charging-system":

      return {
        workflow:
          "charging",

        locked: true,

        confidence:
          complaint.confidence,

        reason:
          "Circuit de charge",
      };

    case "noise":

      return {
        workflow:
          "noise",

        locked: true,

        confidence:
          complaint.confidence,

        reason:
          "Bruit",
      };

    default:

      return {
        workflow:
          "general",

        locked: false,

        confidence:
          complaint.confidence,

        reason:
          "Workflow général",
      };
  }
}

export function canLeaveWorkflow(
  state: WorkflowState,
  newConfidence: number,
): boolean {

  if (!state.locked) {
    return true;
  }

  /*
   * Il faut une preuve très forte
   * avant de quitter le workflow.
   */

  return newConfidence >= 0.97;
}