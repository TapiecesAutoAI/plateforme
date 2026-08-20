import {
  WorkflowId,
  RuleId,
} from "./identifiers";

export interface Workflow {

  id: WorkflowId;

  domainId: string;

  name: string;

  version: string;

  safetyRuleIds: RuleId[];

  completionRules: string[];

}
