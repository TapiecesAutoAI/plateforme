import {
  SessionId,
  UserProfileId,
} from "./identifiers";

import { Vehicle } from "./vehicle";
import { Evidence } from "./evidences";
import { Hypothesis } from "./hypotheses";
import { DiagnosticAction } from "./actions";

export interface DiagnosticSession {

  id: SessionId;

  profileId: UserProfileId;

  vehicle?: Vehicle;

  evidences: Evidence[];

  hypotheses: Hypothesis[];

  actions: DiagnosticAction[];

  createdAt: string;

  updatedAt: string;

}
