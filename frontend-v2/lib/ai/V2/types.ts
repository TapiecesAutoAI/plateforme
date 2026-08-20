/*
|--------------------------------------------------------------------------
| TA PIÈCES AUTO AI V2
|--------------------------------------------------------------------------
| Types fondamentaux
*/

export type UserProfile =
  | "particulier"
  | "bricoleur"
  | "vendeur"
  | "garage"
  | "expert";

export type WorkflowId =
  | "starting"
  | "battery"
  | "charging"
  | "engine"
  | "cooling"
  | "braking"
  | "steering"
  | "suspension"
  | "transmission"
  | "noise"
  | "general";

export interface VehicleContext {
  brand?: string;
  model?: string;
  year?: number;
  engine?: string;
  fuel?: string;
  vin?: string;
}

export interface Evidence {

  id: string;

  confidence: number;

  source:
    | "text"
    | "question"
    | "measurement"
    | "calculated";

}

export interface WorkflowState {

  workflow: WorkflowId;

  locked: boolean;

  completed: boolean;

  currentNode: string;

}

export interface DiagnosticState {

  vehicle: VehicleContext;

  profile: UserProfile;

  workflow: WorkflowState;

  evidences: Evidence[];

  askedQuestions: string[];

}

export interface WorkflowResult {

  nextQuestionId: string | null;

  diagnosisId: string | null;

  completed: boolean;

}