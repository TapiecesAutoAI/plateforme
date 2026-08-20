import { Evidence } from "./evidences";

export interface Contradiction {

  evidence: Evidence;

  reason: string;

  severity: number;

}
