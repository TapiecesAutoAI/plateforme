import type {
  DiagnosticAction,
  DiagnosticActionResult,
  DiagnosticAudience,
} from "./actionTypes";

export type DiagnosticWorkflowId =
  | "starting"
  | "battery-discharge"
  | "charging"
  | "engine"
  | "cooling"
  | "braking"
  | "steering"
  | "suspension"
  | "transmission"
  | "noise"
  | "general";

export type DiagnosticSessionStatus =
  | "created"
  | "collecting-information"
  | "waiting-for-user"
  | "diagnosis-ready"
  | "completed"
  | "manual-review-required";

export type VehicleContext = {
  brand: string | null;

  model: string | null;

  year: number | null;

  engine: string | null;

  fuel: string | null;

  vin: string | null;

  vinValidated: boolean;
};

export type DiagnosticEvidence = {
  id: string;

  label: string;

  source:
    | "user-text"
    | "action-answer"
    | "observation"
    | "measurement"
    | "vehicle"
    | "calculated";

  confidence: number;

  createdAt: string;
};

export type DiagnosticHypothesis = {
  id: string;

  label: string;

  probability: number;

  eliminated: boolean;

  supportingEvidenceIds: string[];

  contradictingEvidenceIds: string[];
};

export type DiagnosticConclusion = {
  diagnosisId: string;

  title: string;

  confidence: number;

  explanation: string;

  recommendedChecks: string[];

  possibleParts: string[];
};

export type DiagnosticSession = {
  id: string;

  profile: DiagnosticAudience;

  status: DiagnosticSessionStatus;

  workflowId: DiagnosticWorkflowId;

  workflowLocked: boolean;

  currentActionId: string | null;

  vehicle: VehicleContext;

  evidence: DiagnosticEvidence[];

  hypotheses: DiagnosticHypothesis[];

  completedActionIds: string[];

  actionResults: DiagnosticActionResult[];

  pendingAction: DiagnosticAction | null;

  conclusion: DiagnosticConclusion | null;

  createdAt: string;

  updatedAt: string;
};

export function createEmptyVehicleContext():
  VehicleContext {
  return {
    brand: null,
    model: null,
    year: null,
    engine: null,
    fuel: null,
    vin: null,

    vinValidated:
      false,
  };
}

export function createDiagnosticSession(
  id: string,
  profile: DiagnosticAudience,
): DiagnosticSession {
  const now =
    new Date().toISOString();

  return {
    id,

    profile,

    status:
      "created",

    workflowId:
      "general",

    workflowLocked:
      false,

    currentActionId:
      null,

    vehicle:
      createEmptyVehicleContext(),

    evidence: [],

    hypotheses: [],

    completedActionIds: [],

    actionResults: [],

    pendingAction:
      null,

    conclusion:
      null,

    createdAt:
      now,

    updatedAt:
      now,
  };
}
