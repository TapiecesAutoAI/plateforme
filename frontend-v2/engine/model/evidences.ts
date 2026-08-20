import { EvidenceId } from "./identifiers";
import { Reliability } from "./values";

export type EvidenceValue =
  | boolean
  | number
  | string
  | null;

export type EvidenceStatus =
  | "confirmed"
  | "rejected"
  | "unknown"
  | "uncertain";

export type EvidenceSource =
  | "initial_message"
  | "user_answer"
  | "manual_test"
  | "automatic_test"
  | "vehicle_data"
  | "inference";

export interface Evidence {

  id: EvidenceId;

  value: EvidenceValue;

  status: EvidenceStatus;

  reliability: Reliability;

  source: EvidenceSource;

}
