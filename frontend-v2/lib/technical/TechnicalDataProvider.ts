import type {
  ToolKnowledgeRecord,
} from "../tools/ToolKnowledgeBase";

import type {
  ToolOperationId,
} from "../tools/ToolOperationResolver";

export type TechnicalVehicle = {
  vin?: string;

  make?: string;
  model?: string;
  generation?: string;

  year?: number;

  fuel?: string;

  engineName?: string;
  engineCode?: string;

  powerKw?: number;
  powerHp?: number;

  transmission?: string;
};

export type TechnicalOperationRequest = {
  operation: ToolOperationId;

  vehicle?: TechnicalVehicle;
};

export type TechnicalDataResult =
  | {
      status: "found";

      record: ToolKnowledgeRecord;
    }
  | {
      status: "vehicle-required";

      missing: string[];
    }
  | {
      status: "not-found";
    };

export interface TechnicalDataProvider {

  resolveTools(
    request: TechnicalOperationRequest,
  ): Promise<TechnicalDataResult>;

}